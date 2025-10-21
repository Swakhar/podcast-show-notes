import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/adminAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await requireAdmin(req, res);
  if (!session) return;

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'PATCH') {
    try {
      const { is_admin } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { is_admin },
        select: { id: true, email: true, is_admin: true }
      });

      return res.json({ user: updatedUser });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.user.delete({ where: { id } });
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
