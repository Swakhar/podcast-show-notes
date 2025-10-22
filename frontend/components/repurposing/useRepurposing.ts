import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { RepurposingConfig } from './types';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface JobStatus {
  id: string;
  status: "pending" | "processing" | "complete" | "failed";
  stage?: string;
  error?: string;
  result?: any;
  billed_minutes?: number;
}

export function useRepurposing() {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const { data: meData, mutate: mutateMeData } = useSWR("/api/me", fetcher);
  const me = meData?.user;
  const repurposingJobId = jobStatus?.id || null;
  const isJobActive = jobStatus && !["complete", "failed"].includes(jobStatus.status);

  const submitRepurposingJob = useCallback(async (config: RepurposingConfig): Promise<string> => {
    if (!me?.email) {
      throw new Error("Sign in required");
    }

    const estimatedMinutes = config.contentTypes.length;
    if (me.monthlyMinutesUsed + estimatedMinutes > me.monthlyMinutesLimit) {
      throw new Error("Quota exceeded. Please upgrade.");
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Repurposing failed');
      }

      const result = await response.json();
      const jobId = result.jobId;
      
      // ✅ Single source of truth - only set jobStatus
      setJobStatus({
        id: jobId,
        status: "pending",
        stage: "queued",
        billed_minutes: result.billed_minutes
      });
      
      // ✅ Refresh user data after billing
      await mutateMeData();
      
      showToast('Content repurposing started!', 'success');
      
      return jobId;
    } catch (error: any) {
      showToast(error.message || 'Failed to start repurposing', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [showToast, me, mutateMeData]);

  // ✅ Polling effect - only runs when we have an active job
  useEffect(() => {
    if (!repurposingJobId || !isJobActive) return;
    
    let first = true;
    
    const interval = setInterval(async () => {
      try {
        const response = await axios.get<JobStatus>(`${API_BASE_URL}/jobs/${repurposingJobId}`);
        const jobData = response.data;
        
        setJobStatus(jobData);
        
        if (first) { 
          first = false; 
          setIsSubmitting(false); 
        }

        // ✅ Auto-stop polling when job completes
        if (jobData.status === "complete" || jobData.status === "failed") {
          clearInterval(interval);
          await mutateMeData(); // Refresh user data on completion
        }
        
      } catch (error: any) {
        clearInterval(interval);
        setIsSubmitting(false);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [repurposingJobId, isJobActive, mutateMeData]);

  // ✅ Helper function to reset/clear current job
  const clearJob = useCallback(() => {
    setJobStatus(null);
  }, []);

  return {
    submitRepurposingJob,
    clearJob,
    isSubmitting,
    repurposingJobId,
    jobStatus,
    isJobActive,
    me,
  };
}
