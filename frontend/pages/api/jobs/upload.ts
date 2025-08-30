// pages/api/jobs/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import FormData from "form-data";
import fs from "fs";
import formidable from "formidable";

export const config = {
  api: { bodyParser: false }, // we parse multipart ourselves
};

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const FREE_PREVIEW_LIMIT_MIN = 3; // free tier per-job preview cap

function parseForm(req: NextApiRequest) {
  const form = formidable({ multiples: false, keepExtensions: true });
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // OPTIONAL: require sign-in. If you want “guest” uploads while launching, comment this block
  const session = await getServerSession(req, res, authOptions);
  // if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  try {
    const { fields, files } = await parseForm(req);
    const preview = Number(fields.preview_minutes || 0) || 0;
    const features = String(fields.features || "summary,show_notes,timestamps,social_snippets,seo,newsletter");

    // Simple free-tier guard (client does UI guard too). Replace with DB checks when ready.
    const isFree = false; // TODO: read from session/DB; true if plan === "FREE"
    const previewMinutes = isFree ? Math.min(preview || 2, FREE_PREVIEW_LIMIT_MIN) : preview || undefined;

    const f = files.file;
    if (!f || (Array.isArray(f) && f.length === 0)) {
      return res.status(400).json({ error: "Missing file" });
    }
    const fileObj = Array.isArray(f) ? f[0] : f;

    const fd = new FormData();
    fd.append("file", fs.createReadStream(fileObj.filepath), fileObj.originalFilename || "audio.bin");
    if (previewMinutes) fd.append("preview_minutes", String(previewMinutes));
    if (features) fd.append("features", features);

    const r = await fetch(`${BACKEND}/jobs/upload`, {
      method: "POST",
      body: fd as any,
      headers: fd.getHeaders(),
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e: any) {
    console.error("[proxy upload] error:", e);
    return res.status(500).json({ error: e.message || "Upload proxy failed" });
  }
}
