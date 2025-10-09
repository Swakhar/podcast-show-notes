import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ContentTypeSelector from './ContentTypeSelector';
import { useToast } from '../../contexts/ToastContext';

interface RepurposingTabProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  me: any;
}

export default function RepurposingTab({ onSubmit, isSubmitting, me }: RepurposingTabProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<'intro' | 'select' | 'configure' | 'processing'>('intro');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [configuration, setConfiguration] = useState({
    targetAudience: '',
    brandVoice: 'professional',
    customInstructions: '',
    includeDesignSpecs: true,
    includeAnalytics: true,
    includeScheduling: true
  });

  const handleStartRepurposing = () => {
    if (!me) {
      showToast('Please sign in to access repurposing features', 'error');
      return;
    }
    setStep('select');
  };

  const handleContinueToConfig = () => {
    if (selectedTypes.length === 0) {
      showToast('Please select at least one content type', 'error');
      return;
    }
    setStep('configure');
  };

  const handleSubmit = async () => {
    try {
      setStep('processing');
      await onSubmit({
        contentTypes: selectedTypes,
        ...configuration
      });
    } catch (error: any) {
      showToast(error.message || 'Failed to start repurposing', 'error');
      setStep('configure');
    }
  };

  // 🎯 Small Polish: Extract content formats data
  const contentFormats = [
    { icon: '📊', name: 'LinkedIn Carousel', platforms: 'LinkedIn' },
    { icon: '🧵', name: 'Twitter Thread', platforms: 'Twitter/X' },
    { icon: '📱', name: 'Instagram Stories', platforms: 'Instagram' },
    { icon: '🎬', name: 'TikTok Script', platforms: 'TikTok' },
    { icon: '📝', name: 'Blog Outline', platforms: 'Website' },
    { icon: '📧', name: 'Email Course', platforms: 'Email' },
    { icon: '📈', name: 'Infographic Data', platforms: 'Visual' },
    { icon: '🎨', name: 'Design Templates', platforms: 'Canva' }
  ];

  // 🎯 Small Polish: Extract feature toggles data
  const featureToggles = [
    { 
      key: 'includeDesignSpecs', 
      label: 'Include design specifications & Canva templates', 
      icon: '🎨' 
    },
    { 
      key: 'includeAnalytics', 
      label: 'Include performance analytics & optimization tips', 
      icon: '📊' 
    },
    { 
      key: 'includeScheduling', 
      label: 'Include optimal posting times & scheduling', 
      icon: '⏰' 
    }
  ];

  if (step === 'intro') {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium">
              <span className="animate-pulse">🚀</span>
              Most Popular Feature
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Content Repurposing Engine
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your podcast content into multiple professional formats optimized for different platforms and audiences
            </p>
          </motion.div>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 my-12"
          >
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">10x Faster</h3>
              <p className="text-gray-600 text-sm">Create weeks of content in minutes with AI-powered automation</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-bold text-gray-900 mb-2">Platform Optimized</h3>
              <p className="text-gray-600 text-sm">Each format tailored for maximum engagement on its platform</p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="font-bold text-gray-900 mb-2">Design Ready</h3>
              <p className="text-gray-600 text-sm">Includes Canva templates and design specifications</p>
            </div>
          </motion.div>

          {/* Content Types Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-gray-200 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Content Formats</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contentFormats.map((format, index) => (
                <motion.div
                  key={format.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="text-2xl mb-2">{format.icon}</div>
                  <div className="font-medium text-sm text-gray-900">{format.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{format.platforms}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            {me ? (
              <>
                <button
                  onClick={handleStartRepurposing}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all text-lg"
                >
                  🚀 Start Repurposing Content
                </button>
                
                <div className="text-sm text-gray-500">
                  First, upload and process your podcast content in the "Audio Content" tab
                </div>
              </>
            ) : (
              <>
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h3 className="font-semibold text-yellow-800 mb-2">Sign In Required</h3>
                  <p className="text-yellow-700 text-sm">
                    Please sign in to access our content repurposing features
                  </p>
                </div>
                
                <Link
                  href="/auth/signin"
                  className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Sign In to Continue
                </Link>
              </>
            )}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>500+ Hours Repurposed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>50+ Content Formats</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>10x Faster Creation</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="p-8">
        <ContentTypeSelector
          selectedTypes={selectedTypes}
          onSelectionChange={setSelectedTypes}
          maxSelections={4}
        />
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep('intro')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          
          <button
            onClick={handleContinueToConfig}
            disabled={selectedTypes.length === 0}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Configuration →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'configure') {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration</h2>
          <p className="text-gray-600">Customize your content generation settings</p>
        </div>

        <div className="space-y-6">
          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              value={configuration.targetAudience}
              onChange={(e) => setConfiguration(prev => ({ ...prev, targetAudience: e.target.value }))}
              placeholder="e.g., startup founders, marketing professionals, tech enthusiasts"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Brand Voice
            </label>
            <select
              value={configuration.brandVoice}
              onChange={(e) => setConfiguration(prev => ({ ...prev, brandVoice: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="professional">Professional & Authoritative</option>
              <option value="friendly">Friendly & Conversational</option>
              <option value="casual">Casual & Relatable</option>
              <option value="educational">Educational & Informative</option>
              <option value="inspirational">Inspirational & Motivating</option>
            </select>
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={configuration.customInstructions}
              onChange={(e) => setConfiguration(prev => ({ ...prev, customInstructions: e.target.value }))}
              placeholder="Any specific requirements, focus areas, or style guidelines..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Additional Features
            </label>
            
            {featureToggles.map(({ key, label, icon }) => (
              <div key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={configuration[key as keyof typeof configuration] as boolean}
                  onChange={(e) => setConfiguration(prev => ({ 
                    ...prev, 
                    [key]: e.target.checked 
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep('select')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Selection
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Content...
              </span>
            ) : (
              `🚀 Generate ${selectedTypes.length} Content Types`
            )}
          </button>
        </div>
      </div>
    );
  }

  // Processing state handled by parent component
  return null;
}
