import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import formidable from "formidable";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { logger } from "../../../lib/logger";

export const config = { api: { bodyParser: false } };

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FREE_PREVIEW_CAP = 3;

// ---- helpers ---------------------------------------------------------------

function monthNeedsReset(last?: Date | null) {
  if (!last) return true;
  const next = new Date(last);
  next.setMonth(next.getMonth() + 1);
  return Date.now() > next.getTime();
}

function parseForm(req: NextApiRequest) {
  const f = formidable({
    multiples: false,
    keepExtensions: true,
    allowEmptyFiles: false,
    minFileSize: 1,                    // 1 byte
    maxFileSize: 200 * 1024 * 1024,    // 200 MB
  });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    f.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

// ---- route ----------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(401).json({ error: "User not found" });

  // Reset monthly window if needed
  if (monthNeedsReset(user.monthlyResetAt)) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { monthlyMinutesUsed: 0, monthlyResetAt: new Date() },
    });
  }

  try {
    // ---------- parse multipart ----------
    const { fields, files } = await parseForm(req);

    // Required file
    const fAny: any = (files as any).file;
    if (!fAny) return res.status(400).json({ error: "Missing file" });
    const fileObj = Array.isArray(fAny) ? fAny[0] : fAny;

    // Parse fields
    const isFree = user.plan === "FREE";
    const features = String(fields.features || "").trim();
    const language = (String(fields.language || "auto") as "auto" | "en" | "de");

    // Gate paid features on FREE
    if (isFree && /\b(seo|newsletter)\b/i.test(features)) {
      return res.status(402).json({ error: "Feature requires upgrade." });
    }

    // Preview minutes with free cap
    const reqPreview = Number(fields.preview_minutes || 0) || 0;
    const effectivePreview = reqPreview ? (isFree ? Math.min(reqPreview, FREE_PREVIEW_CAP) : reqPreview) : 0;

    // ---------- forward to FastAPI ----------
    const fd = new FormData();
    const buf = fs.readFileSync(fileObj.filepath);
    fd.append("file", buf, {
      filename: fileObj.originalFilename || "audio.bin",
      contentType: fileObj.mimetype || "application/octet-stream"
    });
    if (effectivePreview) fd.append("preview_minutes", String(effectivePreview));
    if (features) fd.append("features", features);
    if (language) fd.append("language", language);
    fd.append("user_email", session.user.email);
    // Axios: pass fd and headers
    const r = await axios.post(`${BACKEND}/jobs/upload`, fd, {
      headers: fd.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    const data = r.data;

    if (r.status < 200 || r.status >= 300) {
      logger.error("[upload->backend] non-200:", r.status, data);
      const msg = data?.detail || data?.error || "Backend error";
      return res.status(r.status).json({ error: msg });
    }
    if (!data?.id) {
      logger.error("[upload->backend] no id in response:", data);
      return res.status(502).json({ error: "Backend returned no job id." });
    }

    // Bill preview minutes conservatively
    let billed = Number(data?.billed_minutes || 0);
    if (!billed || billed < 0) billed = effectivePreview || 2;

    // Quota pre-check
    if (user.monthlyMinutesUsed + billed > user.monthlyMinutesLimit) {
      return res.status(402).json({ error: "Quota exceeded. Please upgrade." });
    }

    // Success passthrough
    return res.status(200).json({
      id: data.id,
      status: data.status || "pending",
      stage: data.stage,
      billed_minutes: billed,
    });
  } catch (e: any) {
    logger.error("[upload] error:", e);
    // Common developer mistakes surfaced nicely:
    if (String(e?.message || "").includes("maxFileSize")) {
      return res.status(413).json({ error: "File too large (limit 200MB)." });
    }
    return res.status(500).json({ error: e?.message || "Upload proxy failed" });
  }
}
