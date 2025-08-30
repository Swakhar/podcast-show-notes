import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

function buffer(req: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    req.on("data", (c: any) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function planForPrice(priceId?: string) {
  switch (priceId) {
    case process.env.STRIPE_PRICE_STARTER: return { plan: "STARTER", limit: 300 /* minutes */ };
    case process.env.STRIPE_PRICE_PRO:     return { plan: "PRO",     limit: 1200 };
    case process.env.STRIPE_PRICE_AGENCY:  return { plan: "AGENCY",  limit: 99999 };
    default:                               return { plan: "FREE",    limit: 30 };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      const line = s.line_items?.data?.[0]; // requires expand in webhook settings OR handle later via subscription event
      // safer: fetch the subscription to get price id
      const subId = s.subscription as string | undefined;
      let priceId: string | undefined;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        priceId = sub.items.data[0].price.id;
      }
      const refId = (s.client_reference_id || "") as string;
      const { plan, limit } = planForPrice(priceId);

      // link by customer or client_reference_id
      let user = await prisma.user.findFirst({
        where: { OR: [{ id: refId }, { stripeCustomerId: s.customer as string | undefined }, { email: s.customer_email || undefined }] }
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: plan as any,
            priceId: priceId,
            subscriptionStatus: "active",
            monthlyMinutesLimit: limit,
            // reset usage on upgrade
            monthlyMinutesUsed: 0,
            monthlyResetAt: new Date(),
          }
        });
      }
    }

    if (event.type.startsWith("customer.subscription.")) {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0].price.id;
      const custId = sub.customer as string;
      const { plan, limit } = planForPrice(priceId);
      const status = sub.status;

      const user = await prisma.user.findFirst({ where: { stripeCustomerId: custId } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: (status === "active" || status === "trialing") ? (plan as any) : "FREE",
            priceId: (status === "active" || status === "trialing") ? priceId : null,
            subscriptionStatus: status,
            monthlyMinutesLimit: (status === "active" || status === "trialing") ? limit : 30,
            // do not reset used here unless you want to on every update
          }
        });
      }
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send("Webhook handler failed");
  }

  res.json({ received: true });
}
