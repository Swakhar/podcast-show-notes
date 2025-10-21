import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/adminAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          subscriptionStatus: true,
          monthlyMinutesUsed: true,
          monthlyMinutesLimit: true,
          createdAt: true, // Changed from created_at to createdAt
          is_admin: true
        },
        orderBy: { createdAt: 'desc' } // Changed from created_at to createdAt
      });

      const formattedUsers = users.map(user => ({
        ...user,
        created_at: user.createdAt.toISOString(), // Map createdAt to created_at for frontend
        createdAt: undefined // Remove the original camelCase field
      }));

      return res.json({ users: formattedUsers });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
