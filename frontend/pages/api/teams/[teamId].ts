import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { requireAgencyPlan } from "../../../lib/teamMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = req.query;

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({ error: "Team ID is required" });
  }

  const auth = await requireAgencyPlan(req, res);
  if (auth.error) {
    return res.status(auth.error.status).json(auth.error);
  }

  if (req.method === "GET") {
    try {
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          OR: [
            { ownerId: auth.user.id },
            { 
              memberships: {
                some: { userId: auth.user.id }
              }
            }
          ]
        },
        include: {
          owner: { select: { name: true, email: true } },
          memberships: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        }
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found or access denied" });
      }

      return res.status(200).json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      return res.status(500).json({ error: "Failed to fetch team" });
    }
  }

  if (req.method === "PUT") {
    const { name, description } = req.body;

    try {
      // Only team owner can update
      const team = await prisma.team.findFirst({
        where: { 
          id: teamId,
          ownerId: auth.user.id 
        }
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found or you don't have permission to update it" });
      }

      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          name: name?.trim() || team.name,
          description: description?.trim() || team.description,
        },
        include: {
          owner: { select: { name: true, email: true } },
          memberships: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        }
      });

      return res.status(200).json(updatedTeam);
    } catch (error) {
      console.error("Error updating team:", error);
      return res.status(500).json({ error: "Failed to update team" });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Only team owner can delete
      const team = await prisma.team.findFirst({
        where: { 
          id: teamId,
          ownerId: auth.user.id 
        }
      });

      if (!team) {
        return res.status(404).json({ error: "Team not found or you don't have permission to delete it" });
      }

      await prisma.team.delete({
        where: { id: teamId }
      });

      return res.status(200).json({ message: "Team deleted successfully" });
    } catch (error) {
      console.error("Error deleting team:", error);
      return res.status(500).json({ error: "Failed to delete team" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
