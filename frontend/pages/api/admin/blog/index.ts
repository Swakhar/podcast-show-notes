import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/adminAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return; // Response already sent by requireAdmin
  
  if (req.method === 'GET') {
    try {
      const posts = await prisma.blogPost.findMany({
        include: { author: { select: { name: true, email: true } } },
        orderBy: { created_at: 'desc' }
      });
      return res.json({ posts });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { title, content, excerpt, status, meta_title, meta_description, meta_keywords } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Check if slug already exists
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug }
      });
      
      const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;
      
      const post = await prisma.blogPost.create({
        data: {
          title,
          slug: finalSlug,
          content,
          excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
          status: status || 'DRAFT',
          meta_title,
          meta_description,
          meta_keywords,
          author_id: session.user.id,
          published_at: status === 'PUBLISHED' ? new Date() : null
        },
        include: { author: { select: { name: true, email: true } } }
      });
      
      return res.json({ post });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
