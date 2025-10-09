import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentType {
  id: string;
  name: string;
  icon: string;
  description: string;
  estimatedTime: string;
  popularity: 'high' | 'medium' | 'low';
  category: 'social' | 'long-form' | 'visual';
}

const CONTENT_TYPES: ContentType[] = [
  {
    id: 'linkedin_carousel',
    name: 'LinkedIn Carousel',
    icon: '📊',
    description: 'Professional carousel posts with auto-generated designs',
    estimatedTime: '2-3 min',
    popularity: 'high',
    category: 'social'
  },
  {
    id: 'twitter_thread',
    name: 'Twitter Thread',
    icon: '🧵',
    description: 'Viral thread with optimal timing suggestions',
    estimatedTime: '1-2 min',
    popularity: 'high',
    category: 'social'
  },
  {
    id: 'instagram_story',
    name: 'Instagram Stories',
    icon: '📱',
    description: 'Interactive story templates with engagement features',
    estimatedTime: '2-3 min',
    popularity: 'high',
    category: 'visual'
  },
  {
    id: 'tiktok_script',
    name: 'TikTok Script',
    icon: '🎬',
    description: 'Viral video scripts with production notes',
    estimatedTime: '3-4 min',
    popularity: 'medium',
    category: 'visual'
  },
  {
    id: 'blog_outline',
    name: 'Blog Post Outline',
    icon: '📝',
    description: 'SEO-optimized blog outlines with keyword strategy',
    estimatedTime: '4-5 min',
    popularity: 'medium',
    category: 'long-form'
  },
  {
    id: 'email_course',
    name: 'Email Course',
    icon: '📧',
    description: '7-part email sequence with automation setup',
    estimatedTime: '5-7 min',
    popularity: 'medium',
    category: 'long-form'
  },
  {
    id: 'infographic_data',
    name: 'Infographic Data',
    icon: '📈',
    description: 'Data points and design specs for infographics',
    estimatedTime: '3-4 min',
    popularity: 'low',
    category: 'visual'
  }
];

interface ContentRepurposingStudioProps {
  jobId: string;
  originalContent: {
    title: string;
    duration: string;
    type: 'transcript' | 'show_notes';
  };
}

export default function ContentRepurposingStudio({ jobId, originalContent }: ContentRepurposingStudioProps) {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customInstructions, setCustomInstructions] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);

  const categories = [
    { id: 'all', name: 'All Content', icon: '🎯' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'long-form', name: 'Long-form', icon: '📝' },
    { id: 'visual', name: 'Visual', icon: '🎨' }
  ];

  const brandVoices = [
    { id: 'professional', name: 'Professional', description: 'Formal, authoritative, business-focused' },
    { id: 'casual', name: 'Casual', description: 'Friendly, conversational, approachable' },
    { id: 'energetic', name: 'Energetic', description: 'Enthusiastic, motivational, dynamic' },
    { id: 'educational', name: 'Educational', description: 'Informative, clear, teaching-focused' },
    { id: 'humorous', name: 'Humorous', description: 'Fun, witty, entertaining' }
  ];

  const filteredTypes = activeCategory === 'all' 
    ? CONTENT_TYPES 
    : CONTENT_TYPES.filter(type => type.category === activeCategory);

  useEffect(() => {
    const total = selectedTypes.reduce((acc, typeId) => {
      const type = CONTENT_TYPES.find(t => t.id === typeId);
      return acc + (type ? parseInt(type.estimatedTime.split('-')[1]) : 0);
    }, 0);
    setEstimatedTime(total);
  }, [selectedTypes]);

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          contentTypes: selectedTypes,
          customInstructions,
          targetAudience,
          brandVoice
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/results/${data.jobId}?type=repurposing`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">🎯</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Repurposing Studio</h1>
            <p className="text-gray-600">Transform your podcast into multiple content formats</p>
          </div>
        </div>
        
        {/* Original Content Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎤</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{originalContent.title}</h3>
              <p className="text-blue-700 text-sm">
                {originalContent.duration} • {originalContent.type === 'transcript' ? 'Transcript' : 'Show Notes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Content Selection */}
        <div className="lg:col-span-2">
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content Types Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredTypes.map(type => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedTypes.includes(type.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handleTypeToggle(type.id)}
                >
                  {/* Popularity Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full ${
                    type.popularity === 'high' 
                      ? 'bg-green-100 text-green-700'
                      : type.popularity === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {type.popularity === 'high' ? '🔥 Hot' : type.popularity === 'medium' ? '⭐ Popular' : '💎 Niche'}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>⏱️ {type.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedTypes.includes(type.id) && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-xl bg-blue-500 bg-opacity-10 flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Generation Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Generation Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Selected Content Types:</span>
                <span className="font-medium">{selectedTypes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Time:</span>
                <span className="font-medium">{estimatedTime} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Pieces:</span>
                <span className="font-medium text-blue-600">{selectedTypes.length * 5}+ assets</span>
              </div>
            </div>

            {selectedTypes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">You'll get:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✅ Ready-to-publish content</li>
                  <li>✅ Design templates & specifications</li>
                  <li>✅ Optimal posting schedules</li>
                  <li>✅ Engagement optimization tips</li>
                  <li>✅ A/B testing variations</li>
                </ul>
              </div>
            )}
          </div>

          {/* Brand Voice */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Brand Voice</h3>
            <div className="space-y-2">
              {brandVoices.map(voice => (
                <label key={voice.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="brandVoice"
                    value={voice.id}
                    checked={brandVoice === voice.id}
                    onChange={(e) => setBrandVoice(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{voice.name}</div>
                    <div className="text-xs text-gray-600">{voice.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Target Audience</h3>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Entrepreneurs, content creators, podcast enthusiasts..."
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Custom Instructions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Custom Instructions</h3>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Any specific requirements, tone adjustments, or focus areas..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={selectedTypes.length === 0 || isGenerating}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
              selectedTypes.length === 0 || isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Content...
              </div>
            ) : (
              `Generate ${selectedTypes.length} Content Type${selectedTypes.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
