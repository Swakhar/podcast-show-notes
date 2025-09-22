import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { logger } from "../../../lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Sign in required" });
  }

  const userId = (session.user as any).id;
  const { feedId } = req.body;

  if (!feedId || typeof feedId !== "string") {
    return res.status(400).json({ error: "Feed ID is required" });
  }

  try {
    // Verify the feed belongs to the user before deleting
    const feed = await prisma.rssFeed.findFirst({
      where: { 
        id: feedId,
        userId 
      },
    });

    if (!feed) {
      return res.status(404).json({ error: "RSS feed not found" });
    }

    await prisma.rssFeed.delete({
      where: { id: feedId },
    });

    return res.status(200).json({ message: "RSS feed removed successfully" });
  } catch (error) {
    logger.error("Error removing RSS feed:", error);
    return res.status(500).json({ error: "Failed to remove RSS feed" });
  }
}
