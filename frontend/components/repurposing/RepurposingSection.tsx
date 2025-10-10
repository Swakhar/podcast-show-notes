import React, { useState } from 'react';
import { RepurposingForm } from './RepurposingForm';
import { RepurposingResults } from './RepurposingResults';
import { useRepurposing } from './useRepurposing';
import { RepurposingSectionMode, RepurposingConfig } from './types';

interface RepurposingSectionProps {
  sourceJobId?: string;
  existingRepurposedContent?: any;
  mode: RepurposingSectionMode;
  onJobCreated?: (jobId: string) => void;
}

export function RepurposingSection({ 
  sourceJobId, 
  existingRepurposedContent, 
  mode,
  onJobCreated 
}: RepurposingSectionProps) {
  const { submitRepurposingJob, isSubmitting } = useRepurposing();
  const [showForm, setShowForm] = useState(!existingRepurposedContent);

  const handleSubmit = async (data: RepurposingConfig) => {
    try {
      const newJobId = await submitRepurposingJob(data);
      onJobCreated?.(newJobId);
      setShowForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // If we have existing content, show results
  if (existingRepurposedContent && !showForm) {
    return (
      <div className="space-y-6">
        {/* ✅ Only show "Create More Content" button for standalone mode (jobId page) */}
        {mode === 'standalone' && (
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">🔄 Repurposed Content</h3>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              ➕ Create More Content
            </button>
          </div>
        )}
        
        <RepurposingResults 
          results={existingRepurposedContent} 
          jobId={sourceJobId || 'unknown'}
          mode={mode}
        />
      </div>
    );
  }

  // Show form for creating new repurposed content
  return (
    <div className="space-y-6">
      <RepurposingForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode={mode}
        sourceJobId={sourceJobId}
      />
      
      {existingRepurposedContent && (
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          ← Back to existing content
        </button>
      )}
    </div>
  );
}
