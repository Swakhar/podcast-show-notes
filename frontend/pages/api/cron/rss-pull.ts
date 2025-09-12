import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import Parser from "rss-parser";

const parser = new Parser();
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// naive limiter
const MAX_PER_RUN = 50;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Optionally protect with a secret header
  if (process.env.CRON_SECRET && req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const feeds = await prisma.rssFeed.findMany({ where: { active: true }, take: 50 });
  let created = 0;

  for (const feed of feeds) {
    if (created >= MAX_PER_RUN) break;

    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, 5); // recent few
      await prisma.rssFeed.update({ where: { id: feed.id }, data: { title: parsed.title || feed.title, lastCheckedAt: new Date() } });

      for (const it of items) {
        if (created >= MAX_PER_RUN) break;
        const guid = (it.guid || it.link || it.id || "").trim();
        if (!guid) continue;
        if (feed.lastItemGuid && guid <= feed.lastItemGuid) continue;

        // Find audio enclosure
        const enc = (it.enclosure?.url) || (Array.isArray((it as any).enclosures) ? (it as any).enclosures[0]?.url : null);
        const audioUrl = enc || it.link;
        if (!audioUrl) continue;

        // create a job (fast preview 2 min for auto)
        const fd = new URLSearchParams({
          url: audioUrl,
          preview_minutes: "2",
          features: "summary,show_notes,timestamps,social_snippets,seo,newsletter",
          language: "auto",
        });

        await fetch(`${API_BASE_URL}/jobs/url`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: fd.toString(),
        });
        created++;
      }

      // update lastItemGuid to newest item guid
      if (items[0]?.guid) {
        await prisma.rssFeed.update({ where: { id: feed.id }, data: { lastItemGuid: items[0].guid! } });
      }
    } catch (e) {
      console.error("[rss-pull] feed error:", feed.url, e);
    }
  }

  res.status(200).json({ ok: true, created });
}
