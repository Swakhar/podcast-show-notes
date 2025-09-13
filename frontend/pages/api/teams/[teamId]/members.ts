import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { requireAgencyPlan } from "../../../../lib/teamMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = req.query;

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({ error: "Team ID is required" });
  }

  const auth = await requireAgencyPlan(req, res);
  if (auth.error) {
    return res.status(auth.error.status).json(auth.error);
  }

  if (req.method === "DELETE") {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      // Verify team ownership or self-removal
      const team = await prisma.team.findFirst({
        where: { 
          id: teamId,
          OR: [
            { ownerId: auth.user.id }, // Team owner can remove anyone
            { 
              memberships: {
                some: { 
                  userId: auth.user.id,
                  userId: userId // User can remove themselves
                }
              }
            }
          ]
        }
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found or insufficient permissions" });
      }

      const membership = await prisma.membership.findFirst({
        where: {
          teamId,
          userId
        }
      });

      if (!membership) {
        return res.status(404).json({ error: "User is not a member of this team" });
      }

      await prisma.membership.delete({
        where: { id: membership.id }
      });

      return res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing team member:", error);
      return res.status(500).json({ error: "Failed to remove team member" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
