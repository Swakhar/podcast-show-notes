import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const userId = (session.user as any).id;
  const { feedId, active } = req.body;

  if (!feedId || typeof feedId !== "string" || typeof active !== "boolean") {
    return res.status(400).json({ error: "Feed ID and active status are required" });
  }

  try {
    // Verify the feed belongs to the user before updating
    const feed = await prisma.rssFeed.findFirst({
      where: { 
        id: feedId,
        userId 
      },
    });

    if (!feed) {
      return res.status(404).json({ error: "RSS feed not found" });
    }

    const updatedFeed = await prisma.rssFeed.update({
      where: { id: feedId },
      data: { active },
    });

    return res.status(200).json({ feed: updatedFeed });
  } catch (error) {
    console.error("Error updating RSS feed:", error);
    return res.status(500).json({ error: "Failed to update RSS feed" });
  }
}
