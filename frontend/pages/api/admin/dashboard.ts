import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/adminAuth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require admin authentication
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current date for monthly revenue calculation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch dashboard stats
    const [
      totalUsers,
      activeSubscriptions,
      blogPosts,
      recentJobs,
      totalJobs
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active subscriptions (users with active paid plans)
      prisma.user.count({
        where: {
          AND: [
            { subscriptionStatus: 'active' },
            { plan: { not: 'FREE' } }
          ]
        }
      }),
      
      // Blog posts count
      prisma.blogPost.count(),
      
      // Recent jobs (last 7 days) - you might need to adjust this based on your jobs table
      // For now, using user creation as a proxy
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Total jobs/users
      prisma.user.count()
    ]);

    // Calculate monthly revenue (rough estimate based on active subscriptions)
    // You should adjust this based on your actual pricing and payment data
    const monthlyRevenue = await calculateMonthlyRevenue();

    const stats = {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      blogPosts,
      recentJobs,
      totalJobs
    };

    return res.json({ stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

async function calculateMonthlyRevenue(): Promise<number> {
  try {
    // Get active subscriptions with their plans
    const activeUsers = await prisma.user.findMany({
      where: {
        AND: [
          { subscriptionStatus: 'active' },
          { plan: { not: 'FREE' } }
        ]
      },
      select: {
        plan: true,
        priceId: true
      }
    });

    // Simple calculation based on plan types
    // You should replace this with actual Stripe revenue data
    let totalRevenue = 0;
    for (const user of activeUsers) {
      switch (user.plan) {
        case 'PRO':
          totalRevenue += 29; // $29/month
          break;
        case 'AGENCY':
          totalRevenue += 99; // $99/month
          break;
        default:
          totalRevenue += 0;
      }
    }

    return totalRevenue;
  } catch (error) {
    console.error('Revenue calculation error:', error);
    return 0;
  }
}
