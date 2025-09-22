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
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "RSS feed URL is required" });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    // Check if feed already exists for this user
    const existingFeed = await prisma.rssFeed.findFirst({
      where: { 
        userId,
        url: url.trim()
      },
    });

    if (existingFeed) {
      return res.status(400).json({ error: "RSS feed already exists" });
    }

    // Try to fetch the RSS feed to validate it and get title
    let title = null;
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url.trim(), {
        headers: { 'User-Agent': 'CastLumen RSS Reader/1.0' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId); // Clear timeout if request completes

      if (response.ok) {
        const text = await response.text();
        // Simple title extraction from RSS/XML
        const titleMatch = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
        if (titleMatch) {
          title = (titleMatch[1] || titleMatch[2] || "").trim();
        }
      }
    } catch (error: any) {
      // Continue anyway - feed might be temporarily unavailable
      if (error.name === 'AbortError') {
        logger.error("RSS feed fetch timed out");
      }
    }

    // Create the RSS feed
    const feed = await prisma.rssFeed.create({
      data: {
        userId,
        url: url.trim(),
        title,
        active: true,
      },
    });

    return res.status(200).json({ feed });
  } catch (error) {
    logger.error("Error adding RSS feed:", error);
    return res.status(500).json({ error: "Failed to add RSS feed" });
  }
}
