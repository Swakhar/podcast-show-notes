import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { RepurposingSectionMode, RepurposingConfig } from './types';
import { useRepurposing } from './useRepurposing';

interface Job {
  id: string;
  created_at: string;
  result?: {
    seo?: { title: string };
    summary?: string;
  };
  billed_minutes?: number;
}

interface RepurposingFormProps {
  isSubmitting: boolean;
  mode: RepurposingSectionMode;
  sourceJobId?: string;
  onJobCreated?: (jobId: string) => void;
}

export function RepurposingForm({ isSubmitting: externalIsSubmitting, mode, sourceJobId: propSourceJobId, onJobCreated }: Omit<RepurposingFormProps, 'onSubmit'> & { onJobCreated?: (jobId: string) => void }) {
  const { t, i18n } = useTranslation('common');
  const currentLocale = i18n.language || 'en';
  const { submitRepurposingJob, isSubmitting, me } = useRepurposing(); // ✅ Use the hook directly
  
  // Use translation for content types
  const CONTENT_TYPES = [
    { 
      id: 'linkedin_carousel', 
      label: t('repurposingForm.contentTypes.linkedinCarousel.label'), 
      icon: '📊', 
      description: t('repurposingForm.contentTypes.linkedinCarousel.description') 
    },
    { 
      id: 'twitter_thread', 
      label: t('repurposingForm.contentTypes.twitterThread.label'), 
      icon: '🧵', 
      description: t('repurposingForm.contentTypes.twitterThread.description') 
    },
    { 
      id: 'instagram_story', 
      label: t('repurposingForm.contentTypes.instagramStory.label'), 
      icon: '📱', 
      description: t('repurposingForm.contentTypes.instagramStory.description') 
    },
    { 
      id: 'tiktok_script', 
      label: t('repurposingForm.contentTypes.tiktokScript.label'), 
      icon: '🎬', 
      description: t('repurposingForm.contentTypes.tiktokScript.description') 
    },
    { 
      id: 'blog_outline', 
      label: t('repurposingForm.contentTypes.blogOutline.label'), 
      icon: '📝', 
      description: t('repurposingForm.contentTypes.blogOutline.description') 
    },
    { 
      id: 'email_course', 
      label: t('repurposingForm.contentTypes.emailCourse.label'), 
      icon: '📧', 
      description: t('repurposingForm.contentTypes.emailCourse.description') 
    },
    { 
      id: 'infographic_data', 
      label: t('repurposingForm.contentTypes.infographicData.label'), 
      icon: '📈', 
      description: t('repurposingForm.contentTypes.infographicData.description') 
    },
  ];

  const [selectedTypes, setSelectedTypes] = useState<string[]>(['linkedin_carousel']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('professional');
  const [includeDesignSpecs, setIncludeDesignSpecs] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeScheduling, setIncludeScheduling] = useState(false);
  
  // ✅ Source job selection (preserved from RepurposingSidebarForm)
  const [sourceJobId, setSourceJobId] = useState<string>(propSourceJobId || '');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // ✅ Fetch user's completed jobs (preserved functionality)
  useEffect(() => {
    if (mode === 'sidebar' || !propSourceJobId) {
      fetchUserJobs();
    }
  }, [mode, propSourceJobId]);

  const fetchUserJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await fetch('/api/jobs/completed');
      
      if (response.ok) {
        const data = await response.json();
        setAvailableJobs(data.jobs || []);
        
        // Auto-select the most recent job if no sourceJobId provided
        if (data.jobs && data.jobs.length > 0 && !propSourceJobId) {
          setSourceJobId(data.jobs[0].id);
        }
      } else {
      }
    } catch (error) {
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  // ✅ Calculate quota information
  const estimatedMinutes = selectedTypes.length;
  const usagePercent = me ? Math.round((me.monthlyMinutesUsed / me.monthlyMinutesLimit) * 100) : 0;
  const wouldExceedQuota = me ? (me.monthlyMinutesUsed + estimatedMinutes > me.monthlyMinutesLimit) : false;
  const isNearLimit = usagePercent > 80;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTypes.length === 0) {
      alert(t('repurposingForm.validation.selectContentType'));
      return;
    }

    const finalSourceJobId = propSourceJobId || sourceJobId;
    if (!finalSourceJobId) {
      alert(t('repurposingForm.validation.selectSourceJob'));
      return;
    }

    // ✅ Check quota before submitting
    if (wouldExceedQuota) {
      alert(t('repurposingForm.validation.quotaExceeded'));
      return;
    }

    try {
      const jobId = await submitRepurposingJob({
        sourceJobId: finalSourceJobId,
        contentTypes: selectedTypes,
        customInstructions,
        targetAudience,
        brandVoice,
        includeDesignSpecs,
        includeAnalytics,
        includeScheduling,
        language: currentLocale,
      });
      
      // ✅ Notify parent component if callback provided
      if (onJobCreated) {
        onJobCreated(jobId);
      }
    } catch (error) {
    }
  };

  const formatJobTitle = (job: Job) => {
    // ✅ Add safety checks
    if (!job || !job.id) {
      return t('repurposingForm.unknownJob');
    }
    return job.result?.seo?.title || t('repurposingForm.jobPrefix', { id: job.id.slice(0, 8) });
  };

  const formatJobDate = (dateString: string) => {
    if (!dateString) return t('repurposingForm.unknownDate');
    return new Date(dateString).toLocaleDateString();
  };

  const getFormClasses = () => {
    switch (mode) {
      case 'sidebar':
        return 'p-6 space-y-6';
      case 'inline':
        return 'bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6';
      case 'standalone':
        return 'max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8';
      default:
        return 'p-6 space-y-6';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={getFormClasses()}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🔄</span>
          </div>
          <div>
            <h3 className={`font-bold text-gray-900 ${mode === 'standalone' ? 'text-2xl' : 'text-lg'}`}>
              {t('repurposingForm.header.title')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('repurposingForm.header.subtitle')}
            </p>
          </div>
        </div>
        
        {mode === 'sidebar' && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            <span className="animate-pulse">🚀</span>
            {t('repurposingForm.header.popularFeature')}
          </div>
        )}
      </div>

      {/* ✅ Source Job Selection (only show if no propSourceJobId or in sidebar mode) */}
      {(mode === 'sidebar' || !propSourceJobId) && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('repurposingForm.sourceContent.label')}
          </label>
          
          {loadingJobs ? (
            <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">{t('repurposingForm.sourceContent.loading')}</span>
            </div>
          ) : availableJobs.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <span className="font-medium text-yellow-800">{t('repurposingForm.sourceContent.noContent.title')}</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                {t('repurposingForm.sourceContent.noContent.description')}
              </p>
              <button
                type="button"
                onClick={() => window.location.href = '#audio'}
                className="text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                {t('repurposingForm.sourceContent.noContent.goToAudio')}
              </button>
            </div>
          ) : (
            <select
              value={sourceJobId}
              onChange={(e) => setSourceJobId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              required
            >
              <option value="">{t('repurposingForm.sourceContent.selectPlaceholder')}</option>
              {availableJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {formatJobTitle(job)} • {formatJobDate(job.created_at)} • {job.billed_minutes || 1}min
                </option>
              ))}
            </select>
          )}
          
          {sourceJobId && (
            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span className="text-sm font-medium text-purple-800">
                  {t('repurposingForm.sourceContent.sourceSelected')}: {(() => {
                    const selectedJob = availableJobs.find(j => j.id === sourceJobId);
                    if (selectedJob) {
                      return formatJobTitle(selectedJob);
                    }
                    return t('repurposingForm.jobPrefix', { id: sourceJobId.slice(0, 8) });
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Type Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          {t('repurposingForm.contentTypeSelection.label', { count: selectedTypes.length })}
        </label>
        
        <div className={`grid gap-3 ${mode === 'standalone' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {CONTENT_TYPES.map((type) => (
            <div
              key={type.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedTypes.includes(type.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTypeToggle(type.id)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => handleTypeToggle(type.id)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-lg">{type.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{type.label}</h4>
                  {mode !== 'sidebar' && (
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">{t('repurposingForm.advancedOptions.title')}</label>
        
        <div className={`grid gap-4 ${mode === 'standalone' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('repurposingForm.advancedOptions.targetAudience.label')}</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder={t('repurposingForm.advancedOptions.targetAudience.placeholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('repurposingForm.advancedOptions.brandVoice.label')}</label>
            <select
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="professional">{t('repurposingForm.advancedOptions.brandVoice.options.professional')}</option>
              <option value="casual">{t('repurposingForm.advancedOptions.brandVoice.options.casual')}</option>
              <option value="friendly">{t('repurposingForm.advancedOptions.brandVoice.options.friendly')}</option>
              <option value="authoritative">{t('repurposingForm.advancedOptions.brandVoice.options.authoritative')}</option>
              <option value="humorous">{t('repurposingForm.advancedOptions.brandVoice.options.humorous')}</option>
              <option value="inspirational">{t('repurposingForm.advancedOptions.brandVoice.options.inspirational')}</option>
              <option value="educational">{t('repurposingForm.advancedOptions.brandVoice.options.educational')}</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('repurposingForm.advancedOptions.customInstructions.label')}</label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder={t('repurposingForm.advancedOptions.customInstructions.placeholder')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
          />
        </div>
        
        {/* Feature Toggles */}
        {mode !== 'sidebar' && (
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeDesignSpecs}
                onChange={(e) => setIncludeDesignSpecs(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{t('repurposingForm.advancedOptions.featureToggles.includeDesignSpecs')}</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeAnalytics}
                onChange={(e) => setIncludeAnalytics(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{t('repurposingForm.advancedOptions.featureToggles.includeAnalytics')}</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeScheduling}
                onChange={(e) => setIncludeScheduling(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{t('repurposingForm.advancedOptions.featureToggles.includeScheduling')}</span>
            </label>
          </div>
        )}
      </div>

      {/* ✅ Add quota display */}
      {me && (
        <div className={`p-3 rounded-lg border ${wouldExceedQuota ? 'bg-red-50 border-red-200' : isNearLimit ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {t('repurposingForm.quota.usage')}: {me.monthlyMinutesUsed}/{me.monthlyMinutesLimit === 999999 ? '∞' : me.monthlyMinutesLimit} {t('repurposingForm.quota.minutes')}
            </span>
            <span className={`font-medium ${wouldExceedQuota ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-blue-600'}`}>
              {usagePercent}%
            </span>
          </div>
          
          {selectedTypes.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              {t('repurposingForm.quota.willUse', { minutes: estimatedMinutes })}
              {wouldExceedQuota && (
                <span className="text-red-600 font-medium ml-2">
                  {t('repurposingForm.quota.exceedsLimit')}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Submit Button - update disabled condition */}
      <button
        type="submit"
        disabled={isSubmitting || selectedTypes.length === 0 || !(propSourceJobId || sourceJobId) || wouldExceedQuota}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
          mode === 'standalone' ? 'text-lg py-4' : ''
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{t('repurposingForm.submitButton.generating')}</span>
          </>
        ) : wouldExceedQuota ? (
          <>
            <span>⚠️</span>
            <span>{t('repurposingForm.submitButton.quotaExceeded')}</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            {selectedTypes.length === 1 && (
              <span>{t('repurposingForm.submitButton.generateSingle')}</span>
            )}
            {selectedTypes.length > 1 && (
              <span>{t('repurposingForm.submitButton.generate', { count: selectedTypes.length })}</span>
            )}
          </>
        )}
      </button>

      {selectedTypes.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          {t('repurposingForm.info.selectPrompt')}
        </p>
      )}
    </form>
  );
}
