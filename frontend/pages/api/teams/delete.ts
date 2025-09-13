import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const userId = (session.user as any).id;
  const { teamId } = req.body;

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({ error: "Team ID is required" });
  }

  try {
    // Verify the user owns the team
    const team = await prisma.team.findFirst({
      where: { 
        id: teamId,
        ownerId: userId 
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found or you don't have permission to delete it" });
    }

    // Delete all memberships first (due to foreign key constraints)
    await prisma.membership.deleteMany({
      where: { teamId },
    });

    // Then delete the team
    await prisma.team.delete({
      where: { id: teamId },
    });

    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return res.status(500).json({ error: "Failed to delete team" });
  }
}
