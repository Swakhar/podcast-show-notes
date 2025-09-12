import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import axios from "axios";
import { marked } from "marked";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  const { title, markdown, status = "draft" } = req.body || {};
  if (!title || !markdown) return res.status(400).json({ error: "Missing title/markdown" });

  const cred = await prisma.wordpressCred.findUnique({ where: { userId: (session.user as any).id } });
  if (!cred) return res.status(400).json({ error: "Connect WordPress in settings first." });

  const html = marked.parse(markdown) as string;
  const endpoint = `${cred.siteUrl.replace(/\/+$/,"")}/wp-json/wp/v2/posts`;
  const auth = Buffer.from(`${cred.username}:${cred.appPass}`).toString("base64");

  try {
    const r = await axios.post(endpoint, {
      title, content: html, status
    }, { headers: { Authorization: `Basic ${auth}` }});

    return res.status(200).json({ ok: true, postId: r.data.id, link: r.data.link });
  } catch (e: any) {
    console.error("[wp publish] error:", e.response?.data || e.message);
    return res.status(502).json({ error: e.response?.data?.message || "WordPress publish failed" });
  }
}
