import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { prisma } from './prisma';

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check if user is admin from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, is_admin: true }
  });
  
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  // Return session with user ID
  return {
    ...session,
    user: {
      ...session.user,
      id: user.id
    }
  };
}
