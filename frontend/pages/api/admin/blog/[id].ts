import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/adminAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;
  
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  
  if (req.method === 'GET') {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id },
        include: { author: { select: { name: true, email: true } } }
      });
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      return res.json({ post });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch post' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { title, content, excerpt, status, meta_title, meta_description, meta_keywords } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      // Check if post exists
      const existingPost = await prisma.blogPost.findUnique({
        where: { id }
      });
      
      if (!existingPost) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Generate new slug if title changed
      let slug = existingPost.slug;
      if (title !== existingPost.title) {
        slug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // Check if new slug already exists
        const duplicateSlug = await prisma.blogPost.findFirst({
          where: { 
            slug,
            id: { not: id }
          }
        });
        
        if (duplicateSlug) {
          slug = `${slug}-${Date.now()}`;
        }
      }
      
      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          title,
          slug,
          content,
          excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
          status,
          meta_title,
          meta_description,
          meta_keywords,
          published_at: status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED' 
            ? new Date() 
            : existingPost.published_at,
          updated_at: new Date()
        },
        include: { author: { select: { name: true, email: true } } }
      });
      
      return res.json({ post });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update post' });
    }
  }
  
  if (req.method === 'DELETE') {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id }
      });
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      await prisma.blogPost.delete({
        where: { id }
      });
      
      return res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
