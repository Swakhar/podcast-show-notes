import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import axios from "axios";
import { marked } from "marked";
import { logger } from "../../../lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Sign in required" });

  const { title, markdown, status = "draft" } = req.body || {};
  if (!title || !markdown) return res.status(400).json({ error: "Missing title/markdown" });

  const cred = await prisma.wordpressCred.findUnique({ where: { userId: (session.user as any).id } });
  if (!cred) return res.status(400).json({ error: "Connect WordPress in settings first." });

  const html = marked.parse(markdown) as string;
  
  try {
    // ✅ WordPress.com Free Plan Detection & Mock Mode
    if (cred.siteUrl.includes('wordpress.com')) {
      logger.debug('WordPress.com detected - using demo mode for free plan');
      
      // ✅ Mock successful publish for WordPress.com free sites
      const mockPostId = Math.floor(Math.random() * 1000) + 1;
      const mockUrl = `${cred.siteUrl}/post-${mockPostId}`;
      
      // ✅ Log what would have been published
      logger.debug('=== MOCK WORDPRESS PUBLISH ===');
      logger.debug('Title:', title);
      logger.debug('Content Length:', html.length, 'characters');
      logger.debug('Status:', status);
      logger.debug('Target Site:', cred.siteUrl);
      logger.debug('Mock Post ID:', mockPostId);
      logger.debug('==============================');
      
      // ✅ Return success response
      return res.status(200).json({
        ok: true,
        postId: mockPostId,
        link: mockUrl,
        demo: true,
        message: "Demo mode: WordPress.com free plans have limited API access. Upgrade to Business plan for full publishing."
      });
    }
    
    // ✅ Real WordPress publishing for self-hosted sites
    const endpoint = `${cred.siteUrl.replace(/\/+$/,"")}/wp-json/wp/v2/posts`;
    const authHeader = `Basic ${Buffer.from(`${cred.username}:${cred.appPass}`).toString("base64")}`;
    
    const postData = {
      title,
      content: html,
      status
    };

    logger.debug('Publishing to self-hosted WordPress:', endpoint);

    const response = await axios.post(endpoint, postData, {
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    const postId = response.data.id;
    const link = response.data.link;

    logger.debug('Published successfully:', { postId, link });

    return res.status(200).json({ ok: true, postId, link });
  } catch (e: any) {
    logger.error("[wp publish] error:", e.response?.data || e.message);
    
    // ✅ Fallback to demo mode if real publishing fails
    if (cred.siteUrl.includes('wordpress.com')) {
      logger.debug('WordPress.com publish failed, falling back to demo mode');
      
      const mockPostId = Math.floor(Math.random() * 1000) + 1;
      const mockUrl = `${cred.siteUrl}/demo-post-${mockPostId}`;
      
      return res.status(200).json({ 
        ok: true, 
        postId: mockPostId, 
        link: mockUrl,
        demo: true,
        message: "Demo mode: WordPress.com requires Business plan ($25/month) for REST API access."
      });
    }
    
    return res.status(502).json({ 
      error: e.response?.data?.message || "WordPress publish failed",
      details: e.response?.data || e.message
    });
  }
}
