import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });
  const userId = (session.user as any).id;

  const { token } = req.body || {};
  const inv = await prisma.invite.findUnique({ where: { token }});
  if (!inv || inv.used) return res.status(400).json({ error: "Invalid invite" });

  await prisma.membership.upsert({
    where: { teamId_userId: { teamId: inv.teamId, userId } },
    update: { role: inv.role },
    create: { teamId: inv.teamId, userId, role: inv.role }
  });

  await prisma.invite.update({ where: { id: inv.id }, data: { used: true } });
  res.status(200).json({ ok: true });
}
