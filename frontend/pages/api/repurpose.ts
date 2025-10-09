import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { 
      sourceJobId, // Changed from jobId to sourceJobId to match frontend
      contentTypes, 
      customInstructions, 
      targetAudience, 
      brandVoice 
    } = req.body;

    console.log('Repurposing request:', { sourceJobId, contentTypes, customInstructions, targetAudience, brandVoice });

    // 📍 Fetch the original job from BACKEND, not frontend database
    const originalJobResponse = await fetch(`${BACKEND}/jobs/${sourceJobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add user context for security
        'X-User-Email': session.user.email
      }
    });

    if (!originalJobResponse.ok) {
      if (originalJobResponse.status === 404) {
        return res.status(404).json({ error: 'Original job not found' });
      }
      throw new Error(`Failed to fetch original job: ${originalJobResponse.status}`);
    }

    const originalJob = await originalJobResponse.json();
    console.log('Original job fetched:', { id: originalJob.id, status: originalJob.status });

    // Verify job is complete
    if (originalJob.status !== 'complete') {
      return res.status(400).json({ error: 'Original job is not completed yet' });
    }

    // Extract content from the original job
    const sourceContent = originalJob.result?.transcript || 
                         originalJob.result?.show_notes || 
                         originalJob.result?.summary;

    if (!sourceContent) {
      return res.status(400).json({ error: 'No content available for repurposing' });
    }

    // 📍 Send repurposing request to BACKEND
    const repurposingResponse = await fetch(`${BACKEND}/jobs/repurpose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_job_id: sourceJobId,
        source_content: sourceContent,
        content_types: contentTypes,
        custom_instructions: customInstructions,
        target_audience: targetAudience,
        brand_voice: brandVoice,
        user_email: session.user.email
      })
    });

    if (!repurposingResponse.ok) {
      const errorData = await repurposingResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to start repurposing job');
    }

    const repurposingJob = await repurposingResponse.json();
    console.log('Repurposing job created:', repurposingJob);

    res.status(200).json({ 
      jobId: repurposingJob.job_id || repurposingJob.id,
      status: 'started',
      message: 'Repurposing job started successfully'
    });

  } catch (error: any) {
    console.error('Repurposing API error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}
