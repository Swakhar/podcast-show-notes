import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { 
          status: 'PUBLISHED',
          published_at: {
            not: null
          }
        },
        include: {
          author: {
            select: { 
              name: true,
              email: true 
            }
          }
        },
        orderBy: { published_at: 'desc' }
      });

      // Format dates for JSON serialization
      const formattedPosts = posts.map(post => ({
        ...post,
        published_at: post.published_at?.toISOString(),
        created_at: post.created_at.toISOString(),
        updated_at: post.updated_at.toISOString()
      }));

      return res.json({ posts: formattedPosts });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
