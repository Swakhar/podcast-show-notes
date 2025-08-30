import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function resetIfNeeded(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return;
  const now = new Date();
  const nextReset = new Date(u.monthlyResetAt);
  nextReset.setMonth(nextReset.getMonth() + 1);
  if (now > nextReset) {
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyMinutesUsed: 0, monthlyResetAt: now }
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: "User not found" });

  await resetIfNeeded(user.id);

  const isFree = user.plan === "FREE";
  const preview = Number(req.body?.preview_minutes || req.query.preview_minutes || 0) || 0;
  const alloc = preview || 2; // if unknown, assume 2 minutes
  const willUse = Math.min(alloc, isFree ? 3 : alloc);

  // Enforce minutes quota
  if (user.monthlyMinutesUsed + willUse > user.monthlyMinutesLimit) {
    return res.status(402).json({ error: "Quota exceeded. Please upgrade." });
  }

  // Enforce features on FREE
  const features = (req.body?.features as string | undefined)?.split(",").map(s => s.trim()) || [];
  const blocked = isFree ? features.filter(f => ["seo","newsletter"].includes(f)) : [];
  if (blocked.length) return res.status(402).json({ error: "Feature requires upgrade." });

  // Forward to FastAPI (form encoding)
  const form = new URLSearchParams();
  form.set("url", req.body.url);
  if (preview) form.set("preview_minutes", String(isFree ? Math.min(preview, 3) : preview));
  if (features.length) form.set("features", features.join(","));

  const r = await fetch(`${BACKEND}/jobs/url`, { method: "POST", body: form });
  const data = await r.json();

  // Optimistically add usage (you can also add after completion via webhook/callback)
  await prisma.user.update({
    where: { id: user.id },
    data: { monthlyMinutesUsed: { increment: willUse } }
  });

  res.status(r.status).json(data);
}
