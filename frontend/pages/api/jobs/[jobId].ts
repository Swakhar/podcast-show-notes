import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { logger } from '../../../lib/logger';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { jobId } = req.query;

  try {
    // Fetch job from backend
    console.log('Fetching job from backend:', jobId);
    const backendRes = await fetch(`${BACKEND}/jobs/${jobId}`);
    console.log('Backend response status:', backendRes.status);
    
    if (!backendRes.ok) {
      if (backendRes.status === 404) {
        return res.status(404).json({ message: 'Job not found' });
      }
      throw new Error(`Backend error: ${backendRes.status}`);
    }

    const jobData = await backendRes.json();
    console.log('Job data fetched:', jobData);
    
    // Optional: Verify the job belongs to the current user
    // You might want to add user verification here based on your job storage
    
    return res.status(200).json(jobData);
    
  } catch (error) {
    logger.error('Failed to fetch job:', error);
    return res.status(500).json({ message: 'Failed to fetch job' });
  }
}
