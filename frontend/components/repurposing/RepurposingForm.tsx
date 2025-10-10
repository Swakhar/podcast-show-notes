import React, { useState, useEffect } from 'react';
import { RepurposingSectionMode, RepurposingConfig } from './types';

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
  onSubmit: (data: RepurposingConfig) => Promise<void>;
  isSubmitting: boolean;
  mode: RepurposingSectionMode;
  sourceJobId?: string;
}

const CONTENT_TYPES = [
  { id: 'linkedin_carousel', label: 'LinkedIn Carousel', icon: '📊', description: 'Professional slides for LinkedIn' },
  { id: 'twitter_thread', label: 'Twitter Thread', icon: '🧵', description: 'Engaging thread posts' },
  { id: 'instagram_story', label: 'Instagram Stories', icon: '📱', description: 'Visual story sequence' },
  { id: 'tiktok_script', label: 'TikTok Script', icon: '🎬', description: 'Short-form video script' },
  { id: 'blog_outline', label: 'Blog Outline', icon: '📝', description: 'SEO-optimized blog structure' },
  { id: 'email_course', label: 'Email Course', icon: '📧', description: 'Educational email sequence' },
  { id: 'infographic_data', label: 'Infographic Data', icon: '📈', description: 'Visual data representation' },
];

export function RepurposingForm({ onSubmit, isSubmitting, mode, sourceJobId: propSourceJobId }: RepurposingFormProps) {
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
      console.log('🔍 Fetching user jobs...');
      
      const response = await fetch('/api/jobs/completed');
      console.log(`🔍 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Received ${data.jobs?.length || 0} jobs`);
        setAvailableJobs(data.jobs || []);
        
        // Auto-select the most recent job if no sourceJobId provided
        if (data.jobs && data.jobs.length > 0 && !propSourceJobId) {
          setSourceJobId(data.jobs[0].id);
          console.log(`🎯 Auto-selected job: ${data.jobs[0].id}`);
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ Failed to fetch jobs: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTypes.length === 0) {
      alert('Please select at least one content type');
      return;
    }

    const finalSourceJobId = propSourceJobId || sourceJobId;
    if (!finalSourceJobId) {
      alert('Please select a source job to repurpose');
      return;
    }

    // ✅ Now passing the complete RepurposingConfig object
    await onSubmit({
      sourceJobId: finalSourceJobId,
      contentTypes: selectedTypes,
      customInstructions,
      targetAudience,
      brandVoice,
      includeDesignSpecs,
      includeAnalytics,
      includeScheduling,
    });
  };

  const formatJobTitle = (job: Job) => {
    // ✅ Add safety checks
    if (!job || !job.id) {
      return 'Unknown Job';
    }
    return job.result?.seo?.title || `Job ${job.id.slice(0, 8)}`;
  };

  const formatJobDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
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
              Content Repurposing
            </h3>
            <p className="text-sm text-gray-600">
              Transform your content into multiple formats
            </p>
          </div>
        </div>
        
        {mode === 'sidebar' && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            <span className="animate-pulse">🚀</span>
            Most Popular Feature
          </div>
        )}
      </div>

      {/* ✅ Source Job Selection (only show if no propSourceJobId or in sidebar mode) */}
      {(mode === 'sidebar' || !propSourceJobId) && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Source Content
          </label>
          
          {loadingJobs ? (
            <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Loading your content...</span>
            </div>
          ) : availableJobs.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚠️</span>
                <span className="font-medium text-yellow-800">No Content Available</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                You need to process some audio content first before you can repurpose it.
              </p>
              <button
                type="button"
                onClick={() => window.location.href = '#audio'}
                className="text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Go to Audio Content tab to upload content
              </button>
            </div>
          ) : (
            <select
              value={sourceJobId}
              onChange={(e) => setSourceJobId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              required
            >
              <option value="">Select content to repurpose...</option>
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
                  Source selected: {(() => {
                    const selectedJob = availableJobs.find(j => j.id === sourceJobId);
                    if (selectedJob) {
                      return formatJobTitle(selectedJob);
                    }
                    return `Job ${sourceJobId.slice(0, 8)}`;
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
          Content Types ({selectedTypes.length} selected)
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
        <label className="block text-sm font-semibold text-gray-700">Advanced Options</label>
        
        <div className={`grid gap-4 ${mode === 'standalone' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., entrepreneurs, marketers..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Voice</label>
            <select
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="humorous">Humorous</option>
              <option value="inspirational">Inspirational</option>
              <option value="educational">Educational</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Any specific requirements or style preferences..."
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
              <span className="text-sm text-gray-700">Include design specifications</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeAnalytics}
                onChange={(e) => setIncludeAnalytics(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Include analytics predictions</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeScheduling}
                onChange={(e) => setIncludeScheduling(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Include scheduling recommendations</span>
            </label>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || selectedTypes.length === 0 || !(propSourceJobId || sourceJobId)}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
          mode === 'standalone' ? 'text-lg py-4' : ''
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating Content...</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>Generate {selectedTypes.length} Content Type{selectedTypes.length !== 1 ? 's' : ''}</span>
          </>
        )}
      </button>

      {/* Info */}
      <div className="text-xs text-gray-500 text-center">
        Cost: {selectedTypes.length} minute{selectedTypes.length !== 1 ? 's' : ''} from your quota
      </div>

      {selectedTypes.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          Select at least one content type to continue
        </p>
      )}
    </form>
  );
}
