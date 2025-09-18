import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

// Import the same storage (in production, use database)
const userNotifications: { [userEmail: string]: any[] } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { notificationId } = req.body;
  
  if (userNotifications[session.user.email]) {
    userNotifications[session.user.email] = userNotifications[session.user.email].filter(
      n => n.id !== notificationId
    );
  }

  return res.status(200).json({ success: true });
}
