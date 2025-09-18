// pages/api/stripe/confirm.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

function planForPrice(priceId?: string) {
  switch (priceId) {
    case process.env.STRIPE_PRICE_PRO: return { plan: "PRO", limit: 300 };
    case process.env.STRIPE_PRICE_AGENCY:     return { plan: "AGENCY", limit: 1200 };
    default:                               return { plan: "FREE", limit: 30 };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  const { session_id } = req.body as { session_id?: string };
  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  try {
    // 1) Get checkout session
    const cs = await stripe.checkout.sessions.retrieve(session_id, { expand: ["subscription", "customer"] });
    const subId = (cs.subscription as Stripe.Subscription | null)?.id || (cs.subscription as string | undefined);
    let priceId: string | undefined;

    if (subId && typeof subId === "string") {
      const sub = await stripe.subscriptions.retrieve(subId);
      priceId = sub.items.data[0]?.price?.id;
    } else if (cs.subscription && typeof cs.subscription === "object") {
      priceId = (cs.subscription as Stripe.Subscription).items.data[0]?.price?.id;
    }

    const custId = (cs.customer as Stripe.Customer | string | null)
      ? (typeof cs.customer === "string" ? cs.customer : (cs.customer as Stripe.Customer).id)
      : undefined;

    // 2) Map to plan + minutes
    const { plan, limit } = planForPrice(priceId);

    // 3) Update your user
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: session.user.email }, { stripeCustomerId: custId }] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found to update" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: plan as any,
        priceId: priceId,
        stripeCustomerId: custId || user.stripeCustomerId,
        subscriptionStatus: "active",
        monthlyMinutesLimit: limit,
        monthlyMinutesUsed: 0,
        monthlyResetAt: new Date(),
      },
    });

    return res.status(200).json({ ok: true, plan, priceId });
  } catch (e: any) {
    console.error("[stripe/confirm] error:", e);
    return res.status(400).json({ error: e.message || "Confirm failed" });
  }
}
