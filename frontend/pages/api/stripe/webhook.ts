import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { sendMail } from "../../../lib/smtp";

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// Map your Stripe price IDs to app plans
const PRICE_IDS = {
  STARTER: process.env.STRIPE_PRICE_STARTER, // e.g. price_123
  PRO:     process.env.STRIPE_PRICE_PRO,
  AGENCY:  process.env.STRIPE_PRICE_AGENCY,
};

// Minutes per month per plan
const PLAN_LIMITS: Record<PlanName, number> = {
  FREE:    30,
  STARTER: 300,
  PRO:     1200,
  AGENCY:  99999,
};

type PlanName = "FREE" | "STARTER" | "PRO" | "AGENCY";

function planFromPriceId(priceId?: string): PlanName {
  if (!priceId) return "FREE";
  if (PRICE_IDS.STARTER && priceId === PRICE_IDS.STARTER) return "STARTER";
  if (PRICE_IDS.PRO     && priceId === PRICE_IDS.PRO)     return "PRO";
  if (PRICE_IDS.AGENCY  && priceId === PRICE_IDS.AGENCY)  return "AGENCY";
  return "FREE";
}

function rawBody(req: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"] as string;
  const buf = await rawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const customerId = s.customer as string | undefined;
        const subscriptionId = s.subscription as string | undefined;
        const email = s.customer_details?.email;

        let priceId: string | undefined;
        let status: string | undefined;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] });
          priceId = sub.items.data[0]?.price?.id;
          status = sub.status;
        }

        if (customerId) {
          const plan = planFromPriceId(priceId);
          const limit = PLAN_LIMITS[plan];

          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              plan,
              priceId: priceId || null,
              subscriptionStatus: status || "active",
              subscriptionId: subscriptionId || null,
              monthlyMinutesLimit: limit,
              monthlyMinutesUsed: 0,
              monthlyResetAt: new Date(),
            },
          });
        }

        if (email) {
          await sendMail(
            email,
            "Welcome to CastLumen — your subscription is active 🎉",
            `
            <div style="font-family:Inter,system-ui,Arial">
              <h2>Thanks for upgrading!</h2>
              <p>Your CastLumen plan is now active. You can start generating show notes, timestamps, SEO & snippets right away.</p>
              <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com"}/generate"
                    style="display:inline-block;padding:10px 16px;background:#9CEE69;color:#0F172A;border-radius:8px;text-decoration:none;font-weight:600">
                Open CastLumen
              </a></p>
              <p style="margin-top:16px">Manage billing anytime from your profile.</p>
              <p>— Team CastLumen</p>
            </div>
            `
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const email = invoice.customer_email || invoice.account_customer_email;
        if (email) {
          await sendMail(
            email,
            "Payment received ✔ — CastLumen",
            `<div style="font-family:Inter,system-ui,Arial">
              <p>We’ve received your payment of <strong>${(invoice.amount_paid/100).toFixed(2)} ${invoice.currency?.toUpperCase()}</strong>.</p>
              <p>Thanks for being with us!</p>
            </div>`
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id;
        const status = sub.status; // "active" | "trialing" | "past_due" | "canceled" | "unpaid" | ...

        const plan = planFromPriceId(priceId);
        const isActive = status === "active" || status === "trialing";
        const limit = isActive ? PLAN_LIMITS[plan] : PLAN_LIMITS.FREE;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: isActive ? plan as PlanName : "FREE",
            priceId: isActive ? (priceId || null) : null,
            subscriptionStatus: status,
            subscriptionId: sub.id,
            monthlyMinutesLimit: limit,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            priceId: null,
            subscriptionStatus: sub.status, // usually "canceled"
            subscriptionId: sub.id,
            monthlyMinutesLimit: PLAN_LIMITS.FREE,
          },
        });
        break;
      }

      case "customer.subscription.paused": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: sub.status, // "paused"
          },
        });
        break;
      }
    }
  } catch (e) {
    console.error("[webhook] handler failed:", e);
    return res.status(500).send("Webhook handler failed");
  }

  res.json({ received: true });
}
