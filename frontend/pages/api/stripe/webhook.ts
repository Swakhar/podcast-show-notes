import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { emailService } from "../../../lib/emails/sender";

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// Map your Stripe price IDs to app plans
const PRICE_IDS = {
  PRO:     process.env.STRIPE_PRICE_PRO,
  AGENCY:  process.env.STRIPE_PRICE_AGENCY,
};

// Minutes per month per plan
const PLAN_LIMITS: Record<PlanName, number> = {
  FREE: 30,
  PRO: 300,
  AGENCY: 1200,
};

type PlanName = "FREE" | "PRO" | "AGENCY";

function planFromPriceId(priceId?: string): PlanName {
  if (!priceId) return "FREE";
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

        // Send welcome email using the new service
        if (email) {
          try {
            await emailService.sendWelcomeSubscription(email);
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't fail the webhook for email errors
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const email = invoice.customer_email || invoice.account_customer_email;
        
        if (email) {
          try {
            const amount = (invoice.amount_paid / 100).toFixed(2);
            const currency = invoice.currency || "usd";
            await emailService.sendPaymentReceived(email, amount, currency);
          } catch (emailError) {
            console.error("Failed to send payment confirmation email:", emailError);
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id;
        const status = sub.status;

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
            subscriptionStatus: sub.status,
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
            subscriptionStatus: sub.status,
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
