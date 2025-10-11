import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentActions from '../ContentActions';
import { useToast } from "../../../contexts/ToastContext";

interface LinkedInCarouselPreviewProps {
  data: any;
}

export default function LinkedInCarouselPreview({ data }: LinkedInCarouselPreviewProps) {
  const { showToast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<{ [key: number]: string }>({});
  
  const slides = data?.structured_data?.slides || data?.slides || [];
  const title = data?.structured_data?.title || data?.title || 'LinkedIn Carousel';
  const hashtags = data?.structured_data?.hashtags || data?.hashtags || [];
  const designSpecs = data?.design_specs || {};

  // ✅ Generate carousel slide images
  const generateCarouselSlides = async () => {
    setIsGeneratingSlides(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'linkedin_carousel',
          slides: [{ title, content: 'Cover slide' }, ...slides],
          designSpecs: {
            dimensions: '1080x1080',
            format: 'carousel',
            background_color: designSpecs.background_color || '#1B365D',
            text_color: designSpecs.text_color || '#FFFFFF',
            font_family: designSpecs.font_family || 'Inter',
            brand_colors: designSpecs.brand_colors || ['#1B365D', '#4A90E2'],
            ...designSpecs
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate slide images');

      const result = await response.json();
      setGeneratedSlides(result.images || {});
      showToast('Carousel slides generated successfully!', 'success');
    } catch (error: any) {
      console.error('Error generating carousel slides:', error);
      showToast(`Error generating slides: ${error.message}`, 'error');
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  const allSlides = [{ title, content: 'Cover slide', type: 'cover' }, ...slides];

  return (
    <div className="p-6">
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">LinkedIn Carousel</h3>
            <p className="text-sm text-gray-600">{allSlides.length} slides • Professional format</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Generate Slides Button */}
          <button
            onClick={generateCarouselSlides}
            disabled={isGeneratingSlides}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isGeneratingSlides ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                🎨 Generate Slides
              </>
            )}
          </button>
        </div>
      </div>

      {/* LinkedIn UI Mockup */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* LinkedIn Post Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">YP</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Your Name</div>
                  <div className="text-sm text-gray-500">Founder at Your Company • 1st</div>
                  <div className="text-xs text-gray-400">2h • 🌍</div>
                </div>
              </div>
            </div>

            {/* Carousel with Generated Images */}
            <div className="relative">
              <div 
                className="aspect-square text-white relative overflow-hidden"
                style={{
                  backgroundImage: generatedSlides[currentSlide] 
                    ? `url(${generatedSlides[currentSlide]})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: generatedSlides[currentSlide] 
                    ? 'transparent' 
                    : (designSpecs?.background_color || '#1B365D')
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col justify-center p-6"
                    style={{
                      fontFamily: designSpecs?.font_family || 'Inter',
                      color: designSpecs?.text_color || '#FFFFFF',
                      backgroundColor: generatedSlides[currentSlide] 
                        ? 'rgba(0,0,0,0.3)' 
                        : 'transparent'
                    }}
                  >
                    {generatedSlides[currentSlide] ? (
                      <div className="text-center">
                        <div className="text-lg font-bold mb-2">✨ Generated Slide</div>
                        <div className="text-sm opacity-80">Ready for LinkedIn</div>
                      </div>
                    ) : (
                      <>
                        {currentSlide === 0 ? (
                          <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">{title}</h2>
                            <div className="text-blue-100">Swipe to see insights →</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm mb-2 opacity-80">
                              {currentSlide}/{allSlides.length - 1}
                            </div>
                            <h3 className="text-lg font-bold mb-3">
                              {allSlides[currentSlide]?.title}
                            </h3>
                            <p className="text-base leading-relaxed">
                              {allSlides[currentSlide]?.content}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Generation Status */}
                {generatedSlides[currentSlide] && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>

              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {allSlides.map((_, index) => (
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

      {/* Slide Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {allSlides.map((slide: any, index: number) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentSlide(index)}
            className={`aspect-square rounded-lg cursor-pointer overflow-hidden border-2 transition-all relative ${
              currentSlide === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
            style={{
              backgroundImage: generatedSlides[index] 
                ? `url(${generatedSlides[index]})` 
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: generatedSlides[index] 
                ? 'transparent' 
                : (designSpecs?.background_color || '#1B365D')
            }}
          >
            {generatedSlides[index] && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            
            <div className="p-2 text-white h-full flex flex-col justify-between">
              <div className="text-center">
                <p className="text-xs leading-tight">
                  {index === 0 ? 'Cover' : `Slide ${index}`}
                </p>
              </div>
              <div className="text-center">
                <div className="text-xs opacity-70">
                  {generatedSlides[index] ? 'Ready' : 'Text'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics & ContentActions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">📊 Performance Predictions</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                👁️ Expected impressions: {Math.floor(Math.random() * 10000) + 5000}
              </div>
            </div>
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                💬 Expected engagement: {Math.floor(Math.random() * 15) + 10}%
              </div>
            </div>
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                🎨 Slides generated: {Object.keys(generatedSlides).length}/{allSlides.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">🚀 Export Options</h4>
          <ContentActions 
            content={{
              ...data,
              generatedSlides: generatedSlides // Pass generated slides to ContentActions
            }}
            contentType="linkedin_carousel"
            filename="linkedin_carousel.txt"
          />
        </div>
      </div>
    </div>
  );
}
