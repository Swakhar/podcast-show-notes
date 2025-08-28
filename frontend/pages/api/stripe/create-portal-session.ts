import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { customerId } = req.body as { customerId: string }; // you’ll store this after webhook (see below)
    if (!customerId) return res.status(400).json({ error: "Missing customerId" });

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXT_PUBLIC_APP_URL,
    });

    return res.status(200).json({ url: portal.url });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
