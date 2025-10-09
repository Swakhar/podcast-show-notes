import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useToast } from '../contexts/ToastContext';

interface ContentRepurposingPanelProps {
  jobId: string;
  onRepurposeStart: (repurposingJobId: string) => void;
}

export default function ContentRepurposingPanel({ jobId, onRepurposeStart }: ContentRepurposingPanelProps) {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(['linkedin_carousel']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('professional');

  const contentTypes = [
    { id: 'linkedin_carousel', label: 'LinkedIn Carousel', icon: '📊', description: 'Professional carousel posts with auto-generated designs' },
    { id: 'twitter_thread', label: 'Twitter Thread', icon: '🧵', description: 'Viral thread with optimal timing suggestions' },
    { id: 'instagram_story', label: 'Instagram Stories', icon: '📱', description: 'Interactive story templates with engagement features' },
    { id: 'tiktok_script', label: 'TikTok Script', icon: '🎬', description: 'Viral video scripts with production notes' },
    { id: 'blog_outline', label: 'Blog Post Outline', icon: '📝', description: 'SEO-optimized blog outlines with keyword strategy' },
    { id: 'email_course', label: 'Email Course', icon: '📧', description: '7-part email sequence with automation setup' },
    { id: 'infographic_data', label: 'Infographic Data', icon: '📈', description: 'Data points and design specs for infographics' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedContentTypes.length === 0) {
      showToast('Please select at least one content type', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceJobId: jobId,
          contentTypes: selectedContentTypes,
          customInstructions,
          targetAudience,
          brandVoice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start repurposing');
      }

      const data = await response.json();
      showToast('Content repurposing started!', 'success');
      onRepurposeStart(data.jobId);
      
    } catch (error: any) {
      console.error('Repurposing error:', error);
      showToast(error.message || 'Failed to start repurposing. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleContentType = (typeId: string) => {
    setSelectedContentTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🔄 Repurpose Content</h3>
        <p className="text-gray-600">Transform your podcast content into multiple formats for different platforms</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Types Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Content Types:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleContentType(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedContentTypes.includes(type.id)
                    ? 'border-purple-500 bg-purple-100 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Options */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label htmlFor="target-audience" className="block text-sm font-semibold text-gray-700 mb-2">
              Target Audience (Optional):
            </label>
            <input
              id="target-audience"
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., startup founders, marketing professionals"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label htmlFor="brand-voice" className="block text-sm font-semibold text-gray-700 mb-2">
              Brand Voice:
            </label>
            <select
              id="brand-voice"
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="conversational">Conversational</option>
            </select>
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label htmlFor="custom-instructions" className="block text-sm font-semibold text-gray-700 mb-2">
            Custom Instructions (Optional):
          </label>
          <textarea
            id="custom-instructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Any specific requirements, focus areas, or style guidelines..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || selectedContentTypes.length === 0}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            `Start Repurposing (${selectedContentTypes.length} formats)`
          )}
        </button>
      </form>
    </div>
  );
}
