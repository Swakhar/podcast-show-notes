import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";
import { emailService } from "../../../lib/emails/sender";
import { logger } from '../../../lib/logger';

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-08-27.basil" });

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
      // ✅ KEEP ALL YOUR EXISTING WORKING CASES
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
            logger.error("Failed to send welcome email:", emailError);
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
            logger.error("Failed to send payment confirmation email:", emailError);
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

      // ✅ ADD ONLY THESE NEW CASES FOR GERMAN PAYMENT METHODS
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // For SEPA, payment can fail after initial success
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: "past_due",
          },
        });

        // Send email notification about failed payment (only if emailService.sendPaymentFailed exists)
        if (invoice.customer_email) {
          try {
            // Check if method exists before calling
            if (emailService.sendPaymentFailed) {
              await emailService.sendPaymentFailed(invoice.customer_email);
            } else {
              logger.debug("Payment failed email not configured yet for:", invoice.customer_email);
            }
          } catch (emailError) {
            logger.error("Failed to send payment failed email:", emailError);
          }
        }
        break;
      }

      // ✅ OPTIONAL: Handle payment method updates (for SEPA Direct Debit)
      case "setup_intent.succeeded": {
        const setupIntent = event.data.object as Stripe.SetupIntent;
        logger.debug("Payment method updated successfully:", setupIntent.id);
        // This is just for logging - no database updates needed
        break;
      }

      case "payment_method.attached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        logger.debug("New payment method attached:", paymentMethod.id, paymentMethod.type);
        // This is just for logging - no database updates needed
        break;
      }

      // ✅ OPTIONAL: Handle Sofort payment failures
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.debug("Payment failed for intent:", paymentIntent.id);
        
        // Check if this payment intent has invoice metadata or is related to a subscription
        if (paymentIntent.metadata?.invoice_id) {
          logger.debug("Subscription payment failed for invoice:", paymentIntent.metadata.invoice_id);
          // The invoice.payment_failed event above will handle the database update
        } else if (paymentIntent.description?.includes('subscription')) {
          logger.debug("Subscription-related payment failed:", paymentIntent.description);
        } else {
          logger.debug("One-time payment failed (not subscription-related)");
        }
        break;
      }

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
        break;
    }
  } catch (e) {
    logger.error("[webhook] handler failed:", e);
    return res.status(500).send("Webhook handler failed");
  }

  res.json({ received: true });
}
