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
      sourceJobId,
      contentTypes,
      customInstructions,
      targetAudience,
      brandVoice,
      language
    } = req.body;

    // ✅ Calculate estimated minutes
    const estimatedMinutes = contentTypes.length;

    // ✅ Fetch original job and validate
    const originalJobResponse = await fetch(`${BACKEND}/jobs/${sourceJobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

    const finalLanguage = language || 'auto';

    // ✅ Send repurposing request to BACKEND
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
        user_email: session.user.email,
        language: finalLanguage
      })
    });

    if (!repurposingResponse.ok) {
      const errorData = await repurposingResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to start repurposing job');
    }

    const repurposingJob = await repurposingResponse.json();
    const jobId = repurposingJob.job_id || repurposingJob.id;

    // ✅ Bill usage immediately when job is created
    try {
      await fetch(`${req.headers.origin}/api/usage/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie || ''
        },
        body: JSON.stringify({ 
          minutes: estimatedMinutes, 
          op: 'inc' 
        })
      });
    } catch (billingError) {
    }

    res.status(200).json({
      jobId: jobId,
      status: 'started',
      message: 'Repurposing job started successfully',
      billed_minutes: estimatedMinutes
    });

  } catch (error: any) {
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    });
  }
}
