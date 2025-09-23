import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

// Simple in-memory storage (you can enhance this with database later)
const userNotifications: { [userEmail: string]: any[] } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(200).json({ 
        notifications: [],
        authenticated: false 
      });
    }

    const notifications = userNotifications[session.user.email] || [];
    return res.status(200).json({ 
      notifications,
      authenticated: true 
    });
  }

  if (req.method === 'POST') {
    const { userEmail, title, message, type, actionUrl, actionLabel } = req.body;
    
    // If userEmail is provided (from backend), use it directly
    // Otherwise, get from session (from frontend)
    let targetEmail = userEmail;
    
    if (!targetEmail) {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.email) {
        return res.status(401).json({ message: 'Unauthorized - Cannot create notification without user email' });
      }
      targetEmail = session.user.email;
    }
    
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      actionUrl,
      actionLabel,
      timestamp: new Date().toISOString()
    };
    
    if (!userNotifications[targetEmail]) {
      userNotifications[targetEmail] = [];
    }
    userNotifications[targetEmail].unshift(notification);
    
    // Keep only last 10 notifications per user
    if (userNotifications[targetEmail].length > 10) {
      userNotifications[targetEmail] = userNotifications[targetEmail].slice(0, 10);
    }
    
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
