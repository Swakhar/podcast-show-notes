import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import Parser from 'rss-parser';

const parser = new Parser();
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { feedId } = req.body;
  if (!feedId) {
    return res.status(400).json({ message: 'Feed ID is required' });
  }

  try {
    // Get the RSS feed from database (using lowercase rssFeed to match cron)
    const rssFeed = await prisma.rssFeed.findUnique({
      where: { id: feedId },
      include: { user: true }
    });

    if (!rssFeed) {
      return res.status(404).json({ message: 'RSS feed not found' });
    }

    // Check if user owns this feed
    if (rssFeed.user.email !== session.user.email) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Parse the RSS feed
    const feed = await parser.parseURL(rssFeed.url);
    
    // Update feed title if needed
    await prisma.rssFeed.update({ 
      where: { id: rssFeed.id }, 
      data: { 
        title: feed.title || rssFeed.title, 
        lastCheckedAt: new Date() 
      } 
    });

    let jobsCreated = 0;
    const items = (feed.items || []).slice(0, 10); // Get recent 10 items

    // Process each item in the feed
    for (const item of items) {
      const guid = (item.guid || item.link || item.id || "").trim();
      if (!guid) continue;

      // Skip if we've already processed this item
      if (rssFeed.lastItemGuid && guid <= rssFeed.lastItemGuid) continue;

      // Find audio enclosure (same logic as cron)
      const enc = (item.enclosure?.url) || (Array.isArray((item as any).enclosures) ? (item as any).enclosures[0]?.url : null);
      const audioUrl = enc || item.link;
      if (!audioUrl) continue;

      // Create AI processing job
      try {
        const fd = new URLSearchParams({
          url: audioUrl,
          preview_minutes: "5", // Longer preview for manual requests
          features: "summary,show_notes,timestamps,social_snippets,seo,newsletter",
          language: "auto",
          user_email: session.user.email, // Add user email for notifications
          source_type: "rss", // Add this line
        });

        const response = await fetch(`${API_BASE_URL}/jobs/url`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: fd.toString(),
        });

        if (response.ok) {
          jobsCreated++;
        }
      } catch (error) {
        console.error('Error creating job for:', audioUrl, error);
      }
    }

    // Update lastItemGuid to newest item guid
    if (items[0]?.guid) {
      await prisma.rssFeed.update({ 
        where: { id: rssFeed.id }, 
        data: { lastItemGuid: items[0].guid } 
      });
    }
    
    return res.status(200).json({ 
      message: 'RSS feed pulled successfully',
      itemCount: items.length,
      jobsCreated: jobsCreated,
      feedTitle: feed.title
    });

  } catch (error) {
    console.error('Error pulling RSS feed:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
