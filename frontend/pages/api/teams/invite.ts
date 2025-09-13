import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { emailService } from "../../../lib/emails/sender";

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

  if (!teamId || !email || typeof teamId !== "string" || typeof email !== "string") {
    return res.status(400).json({ error: "Team ID and email are required" });
  }

  try {
    // Get the current user's plan
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, name: true }
    });

    // Restrict Teams functionality to Agency plan only
    if (currentUser?.plan !== "AGENCY") {
      return res.status(403).json({ 
        error: "Teams functionality is only available for Agency plan users. Please upgrade to access this feature.",
        requiresPlan: "AGENCY"
      });
    }

    // Verify the user owns the team
    const team = await prisma.team.findFirst({
      where: { 
        id: teamId,
        ownerId: userId 
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found or you don't have permission to invite members" });
    }

    // Find the user to invite
    const inviteUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!inviteUser) {
      return res.status(404).json({ error: "User with this email not found. They need to sign up first." });
    }

    // Check if user is already a member
    const existingMembership = await prisma.membership.findFirst({
      where: {
        teamId,
        userId: inviteUser.id,
      },
    });

    if (existingMembership) {
      return res.status(400).json({ error: "User is already a member of this team" });
    }

    // Create the membership
    const membership = await prisma.membership.create({
      data: {
        teamId,
        userId: inviteUser.id,
        role: "EDITOR",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Send invitation email using the centralized service
    const inviterName = currentUser?.name || "A CastLumen user";
    const teamUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com"}/teams/${teamId}`;
    
    try {
      await emailService.sendTeamInvitation(
        inviteUser.email,
        inviterName,
        team.name,
        teamUrl,
        session.user.email
      );
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the entire request if email fails
    }

    return res.status(200).json({ 
      message: "User invited successfully and email notification sent",
      membership,
      emailSent: true
    });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return res.status(500).json({ error: "Failed to invite team member" });
  }
}
