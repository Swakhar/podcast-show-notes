import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkedInCarouselPreviewProps {
  data: any;
}

export default function LinkedInCarouselPreview({ data }: LinkedInCarouselPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Parse the data structure
  const slides = data?.structured_data?.slides || data?.slides || [];
  const title = data?.structured_data?.title || data?.title || 'LinkedIn Carousel';
  const hashtags = data?.structured_data?.hashtags || data?.hashtags || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportText = () => {
    const slideTexts = slides.map((slide: any, index: number) => 
      `Slide ${index + 1}: ${slide.content || slide.text || slide}`
    ).join('\n\n');
    
    return `${title}\n\n${slideTexts}\n\n${hashtags.join(' ')}`;
  };

  return (
    <div className="p-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">LinkedIn Carousel</h3>
            <p className="text-sm text-gray-600">{slides.length} slides • Professional format</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            📱 Mobile Preview
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            🎨 Edit in Canva
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            📤 Export Images
          </button>
        </div>
      </div>

      {/* ✅ ENHANCED: Full LinkedIn UI Mockup */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* LinkedIn Post Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img 
                  src="/api/placeholder/48/48" 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900">Your Name</div>
                  <div className="text-sm text-gray-500">Founder at Your Company • 1st</div>
                  <div className="text-xs text-gray-400">2h • 🌍</div>
                </div>
              </div>
            </div>

            {/* ✅ Dynamic Carousel with Actual Design */}
            <div className="relative">
              <div 
                className="aspect-square p-6 text-white relative overflow-hidden"
                style={{
                  backgroundColor: data.design_specs?.background_color || '#1B365D',
                  backgroundImage: data.design_specs?.background_pattern ? `url(${data.design_specs.background_pattern})` : 'none'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col justify-center"
                    style={{
                      fontFamily: data.design_specs?.font_family || 'Inter',
                      color: data.design_specs?.text_color || '#FFFFFF'
                    }}
                  >
                    {currentSlide === 0 ? (
                      <div className="text-center">
                        <h2 
                          className="text-2xl font-bold mb-4"
                          style={{ fontSize: data.design_specs?.title_size || '2rem' }}
                        >
                          {data.title}
                        </h2>
                        <div className="text-blue-100">Swipe to see insights →</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm mb-2" style={{ opacity: 0.8 }}>
                          {currentSlide}/{slides.length}
                        </div>
                        <h3 className="text-lg font-bold mb-3">
                          {slides[currentSlide - 1]?.title}
                        </h3>
                        <p className="text-base leading-relaxed">
                          {slides[currentSlide - 1]?.content}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* ✅ Brand Logo Overlay */}
                {data.design_specs?.logo_url && (
                  <img 
                    src={data.design_specs.logo_url} 
                    alt="Brand Logo"
                    className="absolute bottom-4 right-4 w-8 h-8 opacity-80"
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {[0, ...slides].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* LinkedIn Engagement */}
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>👍 You and 47 others</span>
                <span>12 comments • 8 shares</span>
              </div>
              <div className="flex gap-4 text-gray-600">
                <button className="flex items-center gap-1 hover:text-blue-600">
                  👍 Like
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600">
                  💬 Comment
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600">
                  🔄 Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Design Specifications Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🎨 Design Specifications</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800">Dimensions:</span>
              <span className="text-blue-700">{data.design_specs?.dimensions || '1080x1080px'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Primary Color:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: data.design_specs?.background_color || '#1B365D' }}
                ></div>
                <span className="text-blue-700">{data.design_specs?.background_color || '#1B365D'}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Font:</span>
              <span className="text-blue-700">{data.design_specs?.font_family || 'Inter'}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">🚀 Ready-to-Use Assets</h4>
          <div className="space-y-3">
            <button className="w-full p-3 bg-white border border-green-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <div className="text-left">
                  <div className="font-medium text-green-900">Edit in Canva</div>
                  <div className="text-xs text-green-700">Pre-made template ready</div>
                </div>
              </div>
            </button>
            
            <button className="w-full p-3 bg-white border border-green-200 rounded-lg hover:border-green-300 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <div className="text-left">
                  <div className="font-medium text-green-900">Download Images</div>
                  <div className="text-xs text-green-700">High-res PNG files</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
