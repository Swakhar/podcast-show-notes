import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { is_admin: true }
  });

  if (!user?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    // Get all stats in parallel
    const [
      totalUsers,
      activeSubscriptions,
      blogPosts,
      recentJobs,
      totalJobs,
      subscriptions
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active subscriptions (users with active subscription status)
      prisma.user.count({
        where: {
          subscriptionStatus: 'active',
          plan: {
            in: ['PRO', 'AGENCY']
          }
        }
      }),
      
      // Blog posts count
      prisma.blogPost.count({
        where: { status: 'PUBLISHED' }
      }),
      
      // Recent jobs (last 24 hours) - this might need adjustment based on your job storage
      // Since jobs seem to be stored in your backend, we'll simulate this for now
      Promise.resolve(0),
      
      // Total jobs processed - also simulated
      Promise.resolve(0),
      
      // Get subscription data for revenue calculation
      prisma.user.findMany({
        where: {
          subscriptionStatus: 'active',
          plan: {
            in: ['PRO', 'AGENCY']
          }
        },
        select: {
          plan: true,
          priceId: true
        }
      })
    ]);

    // Calculate monthly revenue based on active subscriptions
    let monthlyRevenue = 0;
    subscriptions.forEach(sub => {
      if (sub.plan === 'PRO') {
        monthlyRevenue += 19; // €19 for PRO
      } else if (sub.plan === 'AGENCY') {
        monthlyRevenue += 49; // €49 for AGENCY
      }
    });

    const stats = {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      blogPosts,
      recentJobs,
      totalJobs
    };

    logger.info('Admin dashboard stats:', stats);

    return res.status(200).json({ stats });
    
  } catch (error) {
    logger.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
