import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const userId = (session.user as any).id;
  const { teamId } = req.query;

  if (req.method === "GET") {
    try {
      // Get user's current plan and team membership status
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
      });

      const membershipCount = await prisma.membership.count({
        where: { userId }
      });

      const hasAgencyPlan = currentUser?.plan === "AGENCY";
      const isTeamMember = membershipCount > 0;

      if (!hasAgencyPlan && !isTeamMember) {
        return res.status(403).json({ 
          error: "Teams functionality requires an Agency plan subscription or team membership."
        });
      }

      // Get the team with members
      const team = await prisma.team.findFirst({
        where: {
          id: teamId as string,
          OR: [
            { ownerId: userId }, // User is the owner
            { 
              memberships: {
                some: { userId } // User is a member
              }
            }
          ]
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          },
          memberships: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            },
            orderBy: { createdAt: "asc" }
          }
        }
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found or access denied" });
      }

      return res.status(200).json({ team });

    } catch (error) {
      logger.error("Error fetching team:", error);
      return res.status(500).json({ error: "Failed to fetch team" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
