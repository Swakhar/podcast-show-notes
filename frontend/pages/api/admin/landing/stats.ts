import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/adminAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      const stats = await prisma.landingStats.findMany({
        orderBy: { locale: 'asc' }
      });

      return res.json({ stats });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { stats } = req.body;

      // Update or create stats for each locale
      for (const stat of stats) {
        await prisma.landingStats.upsert({
          where: { locale: stat.locale },
          update: {
            episodes: stat.episodes,
            episodesLabel: stat.episodesLabel,
            creators: stat.creators,
            creatorsLabel: stat.creatorsLabel,
            timeSaved: stat.timeSaved,
            timeSavedLabel: stat.timeSavedLabel,
            rating: stat.rating,
            ratingLabel: stat.ratingLabel,
            isActive: stat.isActive,
          },
          create: stat,
        });
      }

      return res.json({ message: 'Stats updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update stats' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
