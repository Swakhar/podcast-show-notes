import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FREE_PREVIEW_CAP = 3;

function monthNeedsReset(last: Date) {
  const next = new Date(last);
  next.setMonth(next.getMonth() + 1);
  return Date.now() > next.getTime();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: "User not found" });
  if (monthNeedsReset(user.monthlyResetAt)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { monthlyMinutesUsed: 0, monthlyResetAt: new Date() },
    });
  }

  // Expect JSON
  const url = String(req.body?.url || "");
  const features = String(req.body?.features || "");
  const reqPreview = Number(req.body?.preview_minutes || 0) || 0;

  if (!url) return res.status(400).json({ error: "Missing url" });

  const isFree = user.plan === "FREE";
  const effectivePreview = reqPreview ? (isFree ? Math.min(reqPreview, FREE_PREVIEW_CAP) : reqPreview) : 0;
  // Optional language (auto | en | de)
  const language = String(req.body?.language || "auto");

  // Enforce feature gates for FREE
  if (isFree && /\b(seo|newsletter)\b/i.test(features)) {
    return res.status(402).json({ error: "Feature requires upgrade." });
  }

  // Forward to FastAPI as x-www-form-urlencoded
  const form = new URLSearchParams();
  form.set("url", url);
  if (effectivePreview) form.set("preview_minutes", String(effectivePreview));
  if (features) form.set("features", features);
  if (language) form.set("language", language);
  form.set("user_email", session.user.email); // Add this line

  // DEBUG: Add logging
  console.log("DEBUG: Form data:", Object.fromEntries(form.entries()));

  const r = await fetch(`${BACKEND}/jobs/url`, { method: "POST", body: form });
  const data = await r.json().catch(() => ({} as any));

  if (!r.ok) {
    return res.status(r.status).json({ error: data?.detail || data?.error || "Backend error" });
  }
  if (!data?.id) {
    return res.status(502).json({ error: "Backend returned no job id." });
  }

  // Bill minutes (prefer backend billed_minutes)
  let billed = Number(data?.billed_minutes || 0);
  if (!billed || billed < 0) billed = effectivePreview || 2;

  if (user.monthlyMinutesUsed + billed > user.monthlyMinutesLimit) {
    return res.status(402).json({ error: "Quota exceeded. Please upgrade." });
  }

  return res.status(200).json({
    id: data.id,
    status: data.status || "pending",
    stage: data.stage,
    billed_minutes: billed,
  });
}
