import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const userId = (session.user as any).id;
  const { membershipId } = req.body;

  if (!membershipId || typeof membershipId !== "string") {
    return res.status(400).json({ error: "Membership ID is required" });
  }

  try {
    // Verify the membership belongs to the user
    const membership = await prisma.membership.findFirst({
      where: { 
        id: membershipId,
        userId 
      },
    });

    if (!membership) {
      return res.status(404).json({ error: "Membership not found" });
    }

    // Delete the membership
    await prisma.membership.delete({
      where: { id: membershipId },
    });

    return res.status(200).json({ message: "Successfully left the team" });
  } catch (error) {
    logger.error("Error leaving team:", error);
    return res.status(500).json({ error: "Failed to leave team" });
  }
}
