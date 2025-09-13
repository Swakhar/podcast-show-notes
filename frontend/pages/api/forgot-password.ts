import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { emailService } from "../../lib/emails/sender";
import crypto from "crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({ 
        message: "If an account with that email exists, we've sent password reset instructions." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    try {
      await emailService.sendPasswordReset(user.email, user.name || "there", resetToken);
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return res.status(500).json({ error: "Failed to send reset email" });
    }

    return res.status(200).json({ 
      message: "If an account with that email exists, we've sent password reset instructions." 
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}