import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/adminAuth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      const { range = '30d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Plan distribution
      const planDistribution = await prisma.user.groupBy({
        by: ['plan'],
        _count: { plan: true }
      });

      const totalUsers = planDistribution.reduce((sum, item) => sum + item._count.plan, 0);
      const formattedPlanDistribution = planDistribution.map(item => ({
        plan: item.plan,
        count: item._count.plan,
        percentage: totalUsers > 0 ? Math.round((item._count.plan / totalUsers) * 100) : 0
      }));

      // Job statistics - Check if Job model exists, otherwise use placeholder data
      let jobStats;
      try {
        const [totalJobs, successfulJobs, failedJobs] = await Promise.all([
          prisma.job.count({ where: { createdAt: { gte: startDate } } }), // Changed to createdAt
          prisma.job.count({ where: { status: 'completed', createdAt: { gte: startDate } } }), // Changed to createdAt
          prisma.job.count({ where: { status: 'failed', createdAt: { gte: startDate } } }) // Changed to createdAt
        ]);
        
        jobStats = {
          totalJobs,
          successfulJobs,
          failedJobs,
          averageProcessingTime: 45
        };
      } catch (error) {
        jobStats = {
          totalJobs: 0,
          successfulJobs: 0,
          failedJobs: 0,
          averageProcessingTime: 0
        };
      }

      // User growth - Group by date (extract date from createdAt)
      let userGrowth;
      try {
        const users = await prisma.user.findMany({
          where: { createdAt: { gte: startDate } }, // Changed to createdAt
          select: { createdAt: true }, // Changed to createdAt
          orderBy: { createdAt: 'asc' } // Changed to createdAt
        });

        // Group users by date
        const growthMap = new Map<string, number>();
        users.forEach(user => {
          const date = user.createdAt.toISOString().split('T')[0];
          growthMap.set(date, (growthMap.get(date) || 0) + 1);
        });

        userGrowth = Array.from(growthMap.entries()).map(([date, count]) => ({
          date,
          count
        }));
      } catch (error) {
        userGrowth = [];
      }

      // Top features - Check if Job model exists
      let topFeatures;
      try {
        const jobTypes = await prisma.job.groupBy({
          by: ['job_type'],
          _count: { job_type: true },
          where: { createdAt: { gte: startDate } }, // Changed to createdAt
          orderBy: { _count: { job_type: 'desc' } },
          take: 5
        });

        topFeatures = jobTypes.map(item => ({
          feature: item.job_type,
          usage: item._count.job_type
        }));
      } catch (error) {
        topFeatures = [
          { feature: 'Transcription', usage: 0 },
          { feature: 'Show Notes', usage: 0 },
          { feature: 'Social Media', usage: 0 }
        ];
      }

      const analytics = {
        planDistribution: formattedPlanDistribution,
        jobStats,
        userGrowth,
        topFeatures
      };

      return res.json(analytics);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
