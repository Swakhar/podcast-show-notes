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
  const { teamId, email } = req.body;

  if (!teamId || typeof teamId !== "string") {
    return res.status(400).json({ error: "Team ID is required" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Verify the user owns the team
    const team = await prisma.team.findFirst({
      where: { 
        id: teamId,
        ownerId: userId 
      },
      include: {
        memberships: {
          include: {
            user: {
              select: { email: true }
            }
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found or you don't have permission to manage it" });
    }

    // Check if user exists
    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true }
    });

    if (!invitedUser) {
      return res.status(404).json({ error: "User with this email not found. They need to create a CastLumen account first." });
    }

    // Check if user is trying to invite themselves
    if (invitedUser.id === userId) {
      return res.status(400).json({ error: "You cannot invite yourself to the team" });
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findFirst({
      where: {
        teamId,
        userId: invitedUser.id
      }
    });

    if (existingMembership) {
      return res.status(400).json({ error: "User is already a member of this team" });
    }

    // Create the membership
    const membership = await prisma.membership.create({
      data: {
        teamId,
        userId: invitedUser.id,
        role: "MEMBER"
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return res.status(201).json({
      message: `${invitedUser.name || invitedUser.email} has been added to the team`,
      membership
    });

  } catch (error) {
    logger.error("Error inviting team member:", error);
    return res.status(500).json({ error: "Failed to invite team member" });
  }
}
