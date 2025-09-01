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

function monthNeedsReset(last: Date) {
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

    const features = String(fields.features || "");
    if (isFree && /\b(seo|newsletter)\b/i.test(features)) {
      return res.status(402).json({ error: "Feature requires upgrade." });
    }

    const reqPreview = Number(fields.preview_minutes || 0) || 0;
    const effectivePreview = reqPreview ? (isFree ? Math.min(reqPreview, FREE_PREVIEW_CAP) : reqPreview) : 0;

    const f = files.file;
    if (!f) return res.status(400).json({ error: "Missing file" });
    const fileObj = Array.isArray(f) ? f[0] : f;

    const fd = new FormData();
    fd.append("file", fs.createReadStream(fileObj.filepath), fileObj.originalFilename || "audio.bin");
    if (effectivePreview) fd.append("preview_minutes", String(effectivePreview));
    if (features) fd.append("features", features);

    const r = await fetch(`${BACKEND}/jobs/upload`, {
      method: "POST",
      body: fd as any,
      headers: fd.getHeaders(),
    });
    const data = await r.json().catch(() => ({} as any));

    if (!r.ok) {
      return res.status(r.status).json({ error: data?.detail || data?.error || "Backend error" });
    }
    if (!data?.id) {
      return res.status(502).json({ error: "Backend returned no job id." });
    }

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
  } catch (e: any) {
    console.error("[proxy upload] error:", e);
    return res.status(500).json({ error: e.message || "Upload proxy failed" });
  }
}
