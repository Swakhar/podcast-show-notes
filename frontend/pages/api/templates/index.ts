import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });
  const userId = (session.user as any).id;

  if (req.method === "GET") {
    const list = await prisma.template.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }});
    return res.status(200).json({ list });
  }

  if (req.method === "POST") {
    const { name, kind, system, user } = req.body || {};
    if (!name || !kind) return res.status(400).json({ error: "Missing name/kind" });
    const t = await prisma.template.create({ data: { userId, name, kind, system: system||"", user: user||"" }});
    return res.status(200).json({ template: t });
  }

  if (req.method === "PUT") {
    const { id, name, system, user } = req.body || {};
    const t = await prisma.template.update({ where: { id }, data: { name, system, user }});
    return res.status(200).json({ template: t });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    await prisma.template.delete({ where: { id }});
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
