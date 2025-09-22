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

  if (req.method === "GET") {
    try {
      // Get user's current plan
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, email: true }
      });

      logger.debug("Teams API - User:", { userId, plan: currentUser?.plan, email: currentUser?.email });

      // Check if user has Agency plan OR is a team member
      const hasAgencyPlan = currentUser?.plan === "AGENCY";
      const membershipCount = await prisma.membership.count({
        where: { userId }
      });
      const isTeamMember = membershipCount > 0;

      logger.debug("Teams API - Access:", { hasAgencyPlan, isTeamMember, membershipCount });

      if (!hasAgencyPlan && !isTeamMember) {
        return res.status(403).json({ 
          error: "Teams functionality requires an Agency plan subscription or team membership.",
          requiresPlan: "AGENCY"
        });
      }

      // Get teams where user is owner
      const ownedTeams = await prisma.team.findMany({
        where: { ownerId: userId },
        include: {
          owner: {
            select: { name: true, email: true }
          },
          memberships: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          _count: {
            select: { memberships: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      // Get teams where user is a member
      const memberTeams = await prisma.team.findMany({
        where: {
          memberships: {
            some: { userId }
          }
        },
        include: {
          owner: {
            select: { name: true, email: true }
          },
          memberships: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          },
          _count: {
            select: { memberships: true }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      logger.debug("Teams API - Result:", { 
        ownedTeams: ownedTeams.length, 
        memberTeams: memberTeams.length,
        canCreateTeams: hasAgencyPlan
      });

      return res.status(200).json({
        ownedTeams,
        memberTeams,
        canCreateTeams: hasAgencyPlan // Only Agency users can create teams
      });

    } catch (error) {
      logger.error("Error fetching teams:", error);
      return res.status(500).json({ error: "Failed to fetch teams" });
    }
  }

  if (req.method === "POST") {
    const { name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Team name is required" });
    }

    try {
      // Get user's current plan
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
      });

      // Only Agency plan users can create teams
      if (currentUser?.plan !== "AGENCY") {
        return res.status(403).json({ 
          error: "Creating teams requires an Agency plan subscription. Please upgrade to create teams.",
          requiresPlan: "AGENCY"
        });
      }

      const team = await prisma.team.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          ownerId: userId,
        },
        include: {
          owner: {
            select: { name: true, email: true }
          },
          _count: {
            select: { memberships: true }
          }
        }
      });

      logger.debug("Team created:", team);

      return res.status(201).json(team);

    } catch (error) {
      logger.error("Error creating team:", error);
      return res.status(500).json({ error: "Failed to create team" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
