import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL parameter required" });
  }

  try {
    console.log("🔍 Testing RSS feed:", url);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'CastLumen RSS Reader/1.0' }
    });
    
    if (!response.ok) {
      return res.status(400).json({ 
        error: `RSS feed returned ${response.status}`,
        status: response.status 
      });
    }
    
    const text = await response.text();
    console.log("📄 RSS content length:", text.length);
    
    // Extract title
    const titleMatch = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || "").trim() : null;
    
    // Extract episodes (basic parsing)
    const itemMatches = text.match(/<item[\s\S]*?<\/item>/gi);
    const episodes = [];
    
    if (itemMatches) {
      for (let i = 0; i < Math.min(3, itemMatches.length); i++) {
        const item = itemMatches[i];
        
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
        const episodeTitle = titleMatch ? (titleMatch[1] || titleMatch[2] || "").trim() : null;
        
        const enclosureMatch = item.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i);
        const audioUrl = enclosureMatch ? enclosureMatch[1] : null;
        
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/i);
        const pubDate = pubDateMatch ? pubDateMatch[1] : null;
        
        episodes.push({
          title: episodeTitle,
          audioUrl,
          pubDate
        });
      }
    }
    
    const result = {
      success: true,
      feedTitle: title,
      episodeCount: itemMatches?.length || 0,
      sampleEpisodes: episodes,
      contentPreview: text.substring(0, 500) + "..."
    };
    
    console.log("✅ RSS parsing result:", JSON.stringify(result, null, 2));
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error("❌ RSS test error:", error);
    return res.status(500).json({ 
      error: "Failed to test RSS feed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
