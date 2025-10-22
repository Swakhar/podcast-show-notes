import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { RepurposingForm } from './RepurposingForm';
import { RepurposingResults } from './RepurposingResults';
import { RepurposingSectionMode } from './types';

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
  const { t } = useTranslation('common');
  const [showForm, setShowForm] = useState(!existingRepurposedContent);

  // ✅ Handle job creation with proper callback flow
  const handleJobCreated = (jobId: string) => {
    onJobCreated?.(jobId);
    setShowForm(false);
  };

  // If we have existing content, show results
  if (existingRepurposedContent && !showForm) {
    return (
      <div className="space-y-6">
        {/* ✅ Only show "Create More Content" button for standalone mode (jobId page) */}
        {mode === 'standalone' && (
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">🔄 {t('repurposingSection.existingContent.title')}</h3>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              ➕ {t('repurposingSection.existingContent.createMoreButton')}
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
        isSubmitting={false} // ✅ The hook manages its own submitting state now
        mode={mode}
        sourceJobId={sourceJobId}
        onJobCreated={handleJobCreated} // ✅ Pass the callback
      />
      
      {existingRepurposedContent && (
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          ← {t('repurposingSection.form.backToExistingContent')}
        </button>
      )}
    </div>
  );
}
