import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Fetch jobs for this user from your AI backend
    const response = await fetch(`${API_BASE_URL}/jobs/user/${encodeURIComponent(session.user.email)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const jobs = await response.json();
    return res.status(200).json({ jobs });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
