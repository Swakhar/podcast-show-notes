import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.method === 'GET') {
    // Get email preferences
    const preferences = {
      rssNewContent: user.emailRssNewContent ?? true,
      manualJobs: user.emailManualJobs ?? true,
      weeklyDigest: user.emailWeeklyDigest ?? false
    };

    return res.status(200).json({ preferences });

  } else if (req.method === 'POST') {
    // Update email preferences
    const { rssNewContent, manualJobs, weeklyDigest } = req.body;

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        emailRssNewContent: rssNewContent,
        emailManualJobs: manualJobs,
        emailWeeklyDigest: weeklyDigest
      }
    });

    return res.status(200).json({ 
      message: 'Email preferences updated',
      preferences: { rssNewContent, manualJobs, weeklyDigest }
    });

  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
