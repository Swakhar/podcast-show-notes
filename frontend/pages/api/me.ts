import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        subscriptionStatus: true,
        monthlyMinutesLimit: true,
        monthlyMinutesUsed: true,
        // Check if user owns any teams
        ownedTeams: {
          select: { id: true }
        },
        // Check if user is a member of any teams
        memberships: {
          select: { 
            id: true,
            team: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isTeamOwner = user.ownedTeams.length > 0;
    const isTeamMember = user.memberships.length > 0;

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        monthlyMinutesLimit: user.monthlyMinutesLimit,
        monthlyMinutesUsed: user.monthlyMinutesUsed,
        isTeamOwner,
        isTeamMember,
        ownedTeamsCount: user.ownedTeams.length,
        memberTeamsCount: user.memberships.length
      }
    });

  } catch (error) {
    logger.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
