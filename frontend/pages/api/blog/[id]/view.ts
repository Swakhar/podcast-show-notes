import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    try {
      // Increment view count
      await prisma.blogPost.update({
        where: { id },
        data: {
          views: {
            increment: 1
          }
        }
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return res.status(500).json({ error: 'Failed to track view' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
