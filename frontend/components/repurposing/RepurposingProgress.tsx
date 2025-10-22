import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface RepurposingProgressProps {
  stage: string;
  progress: number;
  contentTypes: string[];
}

export default function RepurposingProgress({ stage, progress, contentTypes }: RepurposingProgressProps) {
  const { t } = useTranslation('common');
  
  // Use translation for stages
  const REPURPOSING_STAGES = [
    { key: 'queued', label: t('repurposingProgress.stages.queued'), progress: 10 },
    { key: 'initializing', label: t('repurposingProgress.stages.initializing'), progress: 20 },
    { key: 'generating_content', label: t('repurposingProgress.stages.generatingContent'), progress: 60 },
    { key: 'optimizing', label: t('repurposingProgress.stages.optimizing'), progress: 80 },
    { key: 'finalizing', label: t('repurposingProgress.stages.finalizing'), progress: 95 },
    { key: 'complete', label: t('repurposingProgress.stages.complete'), progress: 100 }
  ];

  const currentStageIndex = REPURPOSING_STAGES.findIndex(s => s.key === stage) || 0;

  // Helper function to format content type names
  const formatContentTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'linkedin_carousel': t('repurposingProgress.contentTypes.linkedinCarousel'),
      'twitter_thread': t('repurposingProgress.contentTypes.twitterThread'),
      'instagram_story': t('repurposingProgress.contentTypes.instagramStory'),
      'tiktok_script': t('repurposingProgress.contentTypes.tiktokScript'),
      'blog_outline': t('repurposingProgress.contentTypes.blogOutline'),
      'email_course': t('repurposingProgress.contentTypes.emailCourse'),
      'infographic_data': t('repurposingProgress.contentTypes.infographicData')
    };
    
    return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('repurposingProgress.title')}</h2>
        <p className="text-gray-600">
          {t('repurposingProgress.subtitle', { count: contentTypes.length, progress })}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div 
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, progress)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="space-y-4">
        {REPURPOSING_STAGES.map((stageItem, index) => {
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex;
          
          return (
            <div key={stageItem.key} className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isActive 
                  ? 'bg-purple-500 text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <span className={`font-medium ${
                isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {stageItem.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content Types Being Generated */}
      <div className="mt-8 p-4 bg-purple-50 rounded-lg">
        <h3 className="font-medium text-purple-900 mb-3">{t('repurposingProgress.generatingTitle')}:</h3>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map(type => (
            <span key={type} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {formatContentTypeName(type)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
