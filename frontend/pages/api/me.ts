import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(200).json({ user: null });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      plan: true,
      subscriptionStatus: true,
      monthlyMinutesLimit: true,
      monthlyMinutesUsed: true,
      stripeCustomerId: true,
    },
  });

  res.status(200).json({ user });
}
