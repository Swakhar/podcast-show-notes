import React from 'react';
import { motion } from 'framer-motion';
import ContentPreviewGrid from './ContentPreviewGrid';
import RepurposingProgress from './RepurposingProgress';

interface RepurposingDashboardProps {
  jobStatus: any;
  results?: Record<string, any>;
}

export default function RepurposingDashboard({ jobStatus, results }: RepurposingDashboardProps) {
  const isProcessing = jobStatus?.status === 'processing' || jobStatus?.status === 'pending';
  
  if (isProcessing) {
    return (
      <RepurposingProgress 
        stage={jobStatus.stage || 'queued'} 
        progress={jobStatus.progress || 10}
        contentTypes={jobStatus.contentTypes || ['linkedin_carousel']}
      />
    );
  }

  if (results && Object.keys(results).length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🎉 Content Repurposing Complete!</h2>
              <p className="text-gray-600 mt-1">
                Generated {Object.keys(results).length} content formats ready for publishing
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Complete</span>
            </div>
          </div>
        </div>
        
        <ContentPreviewGrid results={results} jobId={jobStatus.id} />
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Content Available</h3>
      <p className="text-gray-600">Start by creating some repurposed content.</p>
    </div>
  );
}
