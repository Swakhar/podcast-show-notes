import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Job {
  id: string;
  created_at: string;
  result?: {
    seo?: { title: string };
    summary?: string;
  };
  billed_minutes?: number;
}

interface RepurposingSidebarFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  me: any;
}

export default function RepurposingSidebarForm({ onSubmit, isSubmitting, me }: RepurposingSidebarFormProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['linkedin_carousel']);
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('professional');
  const [customInstructions, setCustomInstructions] = useState('');
  const [sourceJobId, setSourceJobId] = useState<string>(''); // ✅ Add source job selection
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]); // ✅ Store available jobs
  const [loadingJobs, setLoadingJobs] = useState(false);

  // ✅ Fetch user's completed jobs
  useEffect(() => {
    if (me?.email) {
      fetchUserJobs();
    }
  }, [me?.email]);

  // Update the fetchUserJobs function:
  const fetchUserJobs = async () => {
    try {
      setLoadingJobs(true);
      console.log('🔍 Fetching user jobs...');
      
      // ✅ Use the frontend API endpoint that handles auth
      const response = await fetch('/api/jobs/completed');
      
      console.log(`🔍 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Received ${data.jobs?.length || 0} jobs`);
        setAvailableJobs(data.jobs || []);
        
        // Auto-select the most recent job
        if (data.jobs && data.jobs.length > 0) {
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

  const contentTypes = [
    { id: 'linkedin_carousel', name: 'LinkedIn Carousel', icon: '📊' },
    { id: 'twitter_thread', name: 'Twitter Thread', icon: '🧵' },
    { id: 'instagram_story', name: 'Instagram Stories', icon: '📱' },
    { id: 'tiktok_script', name: 'TikTok Script', icon: '🎬' },
    { id: 'blog_outline', name: 'Blog Outline', icon: '📝' },
    { id: 'email_course', name: 'Email Course', icon: '📧' },
    { id: 'infographic_data', name: 'Infographic Data', icon: '📈' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTypes.length === 0) {
      alert('Please select at least one content type');
      return;
    }

    if (!sourceJobId) {
      alert('Please select a source job to repurpose');
      return;
    }

    await onSubmit({
      sourceJobId, // ✅ Pass the selected source job ID
      contentTypes: selectedTypes,
      targetAudience,
      brandVoice,
      customInstructions,
      includeDesignSpecs: true,
      includeAnalytics: true,
      includeScheduling: true
    });
  };

  const toggleContentType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const formatJobTitle = (job: Job) => {
    return job.result?.seo?.title || `Job ${job.id.slice(0, 8)}`;
  };

  const formatJobDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!me) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Content Repurposing</h3>
          <p className="text-sm text-gray-600">
            Transform your podcast into multiple content formats
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Please sign in to access repurposing features
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🔄</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Content Repurposing</h3>
            <p className="text-sm text-gray-600">Transform your content into multiple formats</p>
          </div>
        </div>
        
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          <span className="animate-pulse">🚀</span>
          Most Popular Feature
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ Source Job Selection */}
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
                  Source selected: {formatJobTitle(availableJobs.find(j => j.id === sourceJobId) || {} as Job)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content Types Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Content Types ({selectedTypes.length} selected)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {contentTypes.map(type => (
              <label
                key={type.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedTypes.includes(type.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => toggleContentType(type.id)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-lg">{type.icon}</span>
                <span className="text-sm font-medium text-gray-900">{type.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Target Audience (Optional)
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., entrepreneurs, marketers..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
          />
        </div>

        {/* Brand Voice */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Brand Voice
          </label>
          <select
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="educational">Educational</option>
            <option value="inspirational">Inspirational</option>
          </select>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Custom Instructions (Optional)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Any specific requirements..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || selectedTypes.length === 0 || !sourceJobId}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Content...
            </span>
          ) : (
            `🚀 Generate ${selectedTypes.length} Content Types`
          )}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 text-center">
          Cost: {selectedTypes.length} minute{selectedTypes.length !== 1 ? 's' : ''} from your quota
        </div>
      </form>
    </div>
  );
}
