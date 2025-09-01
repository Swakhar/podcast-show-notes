import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  const { minutes, op } = req.body as { minutes: number; op: "inc" | "dec" };
  if (!minutes || minutes < 0 || !op) return res.status(400).json({ error: "Bad request" });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (op === "inc") {
    if (user.monthlyMinutesUsed + minutes > user.monthlyMinutesLimit) {
      return res.status(402).json({ error: "Quota exceeded" });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyMinutesUsed: { increment: minutes } },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyMinutesUsed: Math.max(0, user.monthlyMinutesUsed - minutes),
      },
    });
  }
  return res.status(200).json({ ok: true });
}
