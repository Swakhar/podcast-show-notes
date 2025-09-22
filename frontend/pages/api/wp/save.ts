import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Fix: Use getServerSession instead of getSession
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = (session.user as any).id;

  if (req.method === "GET") {
    // Get existing credentials
    try {
      const cred = await prisma.wordpressCred.findUnique({
        where: { userId },
        select: {
          siteUrl: true,
          username: true,
          // Don't return the password for security
        },
      });

      return res.status(200).json({ cred });
    } catch (error) {
      console.error("Error fetching WordPress credentials:", error);
      return res.status(500).json({ error: "Failed to fetch credentials" });
    }
  }

  if (req.method === "POST") {
    // Save/update credentials
    const { siteUrl, username, appPass } = req.body;

    if (!siteUrl || !username) {
      return res.status(400).json({ error: "Site URL and username are required" });
    }

    try {
      const data: any = {
        siteUrl: siteUrl.trim(),
        username: username.trim(),
      };

      // Only update password if provided
      if (appPass && appPass.trim()) {
        data.appPass = appPass.trim();
      }

      const cred = await prisma.wordpressCred.upsert({
        where: { userId },
        update: data,
        create: {
          userId,
          ...data,
        },
      });

      return res.status(200).json({ 
        message: "WordPress credentials saved successfully",
        cred: {
          siteUrl: cred.siteUrl,
          username: cred.username,
        }
      });
    } catch (error) {
      console.error("Error saving WordPress credentials:", error);
      return res.status(500).json({ error: "Failed to save credentials" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
