import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { logger } from "../../../../../lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const userId = (session.user as any).id;
  const { teamId, membershipId } = req.query;

  if (req.method === "DELETE") {
    try {
      // Verify the user owns the team
      const team = await prisma.team.findFirst({
        where: { 
          id: teamId as string,
          ownerId: userId 
        },
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found or you don't have permission to manage it" });
      }

      // Check if the membership exists and belongs to this team
      const membership = await prisma.membership.findFirst({
        where: {
          id: membershipId as string,
          teamId: teamId as string
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!membership) {
        return res.status(404).json({ error: "Membership not found" });
      }

      // Prevent owner from removing themselves
      if (membership.userId === userId) {
        return res.status(400).json({ error: "You cannot remove yourself from the team. Delete the team instead." });
      }

      // Delete the membership
      await prisma.membership.delete({
        where: { id: membershipId as string }
      });

      return res.status(200).json({ 
        message: `${membership.user.name || membership.user.email} has been removed from the team` 
      });

    } catch (error) {
      logger.error("Error removing team member:", error);
      return res.status(500).json({ error: "Failed to remove team member" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
