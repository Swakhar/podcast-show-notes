// pages/api/jobs/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import formidable from "formidable";
import FormData from "form-data";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FREE_PREVIEW_CAP = 3;

function monthNeedsReset(last?: Date | null) {
  if (!last) return true;
  const next = new Date(last);
  next.setMonth(next.getMonth() + 1);
  return Date.now() > next.getTime();
}

function parseForm(req: NextApiRequest) {
  const f = formidable({ multiples: false, keepExtensions: true });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    f.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  // Pull canonical user and reset monthly window if needed
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: "User not found" });

  if (monthNeedsReset(user.monthlyResetAt)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { monthlyMinutesUsed: 0, monthlyResetAt: new Date() },
    });
  }

  try {
    const { fields, files } = await parseForm(req);

    const isFree = user.plan === "FREE";
    const features = String(fields.features || "").trim();

    // Gate paid features on FREE
    if (isFree && /\b(seo|newsletter)\b/i.test(features)) {
      return res.status(402).json({ error: "Feature requires upgrade." });
    }

    // Preview minutes (cap on FREE)
    const reqPreview = Number(fields.preview_minutes || 0) || 0;
    const effectivePreview = reqPreview ? (isFree ? Math.min(reqPreview, FREE_PREVIEW_CAP) : reqPreview) : 0;

    // Optional language (auto | en | de)
    const language = (String(fields.language || "auto") as "auto" | "en" | "de");

    // File
    const f = (files as any).file;
    if (!f) return res.status(400).json({ error: "Missing file" });
    const fileObj = Array.isArray(f) ? f[0] : f;

    // Build multipart payload for FastAPI
    const fd = new FormData();
    fd.append(
      "file",
      fs.createReadStream(fileObj.filepath),
      fileObj.originalFilename || "audio.bin"
    );
    if (effectivePreview) fd.append("preview_minutes", String(effectivePreview));
    if (features) fd.append("features", features);
    if (language) fd.append("language", language);

    const r = await fetch(`${BACKEND}/jobs/upload`, {
      method: "POST",
      body: fd as any,
      headers: fd.getHeaders(), // DO NOT set Content-Type manually
    });

    // Try to bubble up backend error details
    const text = await r.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }

    if (!r.ok) {
      const msg = data?.detail || data?.error || text || "Backend error";
      return res.status(r.status).json({ error: msg });
    }
    if (!data?.id) {
      return res.status(502).json({ error: "Backend returned no job id." });
    }

    // Bill the preview if backend provided a number; otherwise estimate lightly
    let billed = Number(data?.billed_minutes || 0);
    if (!billed || billed < 0) billed = effectivePreview || 2;

    // Quota check (pre-flight); final booking happens on job success
    if (user.monthlyMinutesUsed + billed > user.monthlyMinutesLimit) {
      return res.status(402).json({ error: "Quota exceeded. Please upgrade." });
    }

    return res.status(200).json({
      id: data.id,
      status: data.status || "pending",
      stage: data.stage,
      billed_minutes: billed,
    });
  } catch (e: any) {
    console.error("[proxy upload] error:", e);
    return res.status(500).json({ error: e?.message || "Upload proxy failed" });
  }
}
