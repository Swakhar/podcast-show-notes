import { useState, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { RepurposingConfig } from './types';

export function useRepurposing() {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repurposingJobId, setRepurposingJobId] = useState<string | null>(null);

  const submitRepurposingJob = useCallback(async (config: RepurposingConfig): Promise<string> => {
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
      setRepurposingJobId(result.jobId);
      showToast('Content repurposing started!', 'success');
      
      return result.jobId;
    } catch (error: any) {
      showToast(error.message || 'Failed to start repurposing', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [showToast]);

  return {
    submitRepurposingJob,
    isSubmitting,
    repurposingJobId,
  };
}
