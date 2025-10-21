import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/adminAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      const { locale = 'en' } = req.query;

      const features = await prisma.landingFeature.findMany({
        where: { locale: locale as string },
        orderBy: { sortOrder: 'asc' }
      });

      return res.json({ features });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch features' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { features } = req.body;

      // Delete existing features
      await prisma.landingFeature.deleteMany();

      // Create new features
      if (features && features.length > 0) {
        await prisma.landingFeature.createMany({
          data: features.map((feature: any, index: number) => ({
            locale: feature.locale,
            icon: feature.icon,
            title: feature.title,
            description: feature.description,
            benefits: feature.benefits,
            isActive: feature.isActive,
            sortOrder: feature.sortOrder || index + 1
          }))
        });
      }

      return res.json({ message: 'Features updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update features' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
