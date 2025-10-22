import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { locale = 'en' } = req.query;

    const stats = await prisma.landingStats.findUnique({
      where: { locale: locale as string }
    });

    // Fallback to default values if no stats found
    const defaultStats = {
      episodes: '500+',
      episodesLabel: locale === 'de' ? 'Folgen verarbeitet' : 'Episodes Processed',
      creators: '100+',
      creatorsLabel: locale === 'de' ? 'Beta-Nutzer' : 'Beta Users',
      timeSaved: '2,000+',
      timeSavedLabel: locale === 'de' ? 'Gesparte Stunden' : 'Hours Saved',
      rating: '4.8/5',
      ratingLabel: locale === 'de' ? 'Bewertung' : 'Rating'
    };

    return res.json({ 
      stats: stats || defaultStats 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
