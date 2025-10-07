import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { locale = 'en' } = req.query;

    const features = await prisma.landingFeature.findMany({
      where: { 
        locale: locale as string,
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' }
    });

    return res.json({ 
      features: features.length > 0 ? features : [] 
    });
  } catch (error) {
    console.error('Error fetching landing features:', error);
    return res.status(500).json({ error: 'Failed to fetch features' });
  }
}
