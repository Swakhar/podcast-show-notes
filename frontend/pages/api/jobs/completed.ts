import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // ✅ Use query parameter format that matches backend expectation
    const backendRes = await fetch(`${BACKEND}/jobs/completed/${encodeURIComponent(session.user.email)}`);
    
    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      throw new Error(`Backend error: ${backendRes.status}`);
    }

    const data = await backendRes.json();
    console.log(`✅ Successfully fetched ${data.jobs?.length || 0} completed jobs`);
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Failed to fetch completed jobs:', error);
    return res.status(500).json({ message: 'Failed to fetch jobs' });
  }
}
