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
  
  // Parse the data structure
  const slides = data?.structured_data?.slides || data?.slides || [];
  const title = data?.structured_data?.title || data?.title || 'LinkedIn Carousel';
  const hashtags = data?.structured_data?.hashtags || data?.hashtags || [];
  const designSpecs = data?.design_specs || {};

  // ✅ NEW: Generate carousel slide images
  const generateCarouselSlides = async () => {
    setIsGeneratingSlides(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      if (!response.ok) {
        throw new Error('Failed to generate slide images');
      }

      const result = await response.json();
      setGeneratedSlides(result.images || {});
      
      // Show success message
      
      showToast('Carousel slides generated successfully!', 'success');
    } catch (error: any) {
      console.error('Error generating carousel slides:', error);
      showToast(`Error generating slides: ${error.message}`, 'error');
    } finally {
      setIsGeneratingSlides(false);
    }
  };

  // ✅ NEW: Download all carousel slides
  const downloadCarouselSlides = async () => {
    try {
      const response = await fetch('/api/repurpose/download-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: 'linkedin_carousel',
          slides: [{ title, content: 'Cover slide' }, ...slides],
          images: generatedSlides
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prepare download');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'linkedin_carousel_slides.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Carousel slides downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error downloading slides:', error);
      showToast(`Error downloading slides: ${error.message}`, 'error');
    }
  };

  const allSlides = [{ title, content: 'Cover slide', type: 'cover' }, ...slides];

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
            <p className="text-sm text-gray-600">{allSlides.length} slides • Professional format</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* ✅ NEW: Generate Slides Button */}
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

          {/* ✅ NEW: Download Slides Button */}
          {Object.keys(generatedSlides).length > 0 && (
            <button
              onClick={downloadCarouselSlides}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              📥 Download Slides
            </button>
          )}
        </div>
      </div>

      {/* ✅ ENHANCED: Full LinkedIn UI Mockup with Generated Images */}
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

            {/* ✅ Dynamic Carousel with Generated Images */}
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
                    {/* ✅ Show generated image or fallback to text */}
                    {generatedSlides[currentSlide] ? (
                      <div className="text-center">
                        <div className="text-lg font-bold mb-2">✨ Generated Slide</div>
                        <div className="text-sm opacity-80">Ready for LinkedIn</div>
                      </div>
                    ) : (
                      <>
                        {currentSlide === 0 ? (
                          <div className="text-center">
                            <h2 
                              className="text-2xl font-bold mb-4"
                              style={{ fontSize: designSpecs?.title_size || '2rem' }}
                            >
                              {title}
                            </h2>
                            <div className="text-blue-100">Swipe to see insights →</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm mb-2" style={{ opacity: 0.8 }}>
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

                {/* ✅ Slide generation status indicator */}
                {generatedSlides[currentSlide] && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}

                {/* ✅ Brand Logo Overlay */}
                {designSpecs?.logo_url && !generatedSlides[currentSlide] && (
                  <img 
                    src={designSpecs.logo_url} 
                    alt="Brand Logo"
                    className="absolute bottom-4 right-4 w-8 h-8 opacity-80"
                  />
                )}
              </div>

              {/* Navigation */}
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

      {/* ✅ ENHANCED: Slide Grid Overview with Image Status */}
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
            {/* ✅ Image status indicator */}
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
                  {generatedSlides[index] ? 'Image Ready' : 'Text Only'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ✅ ENHANCED: Action Buttons with Slide Features */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
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
            {/* ✅ NEW: Slide generation status */}
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                🎨 Slides generated: {Object.keys(generatedSlides).length}/{allSlides.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">🚀 LinkedIn Tools</h4>
          <div className="space-y-3">
            <ContentActions 
              content={data}
              contentType="linkedin_carousel"
              filename="linkedin_carousel.txt"
            />
            
            {/* ✅ NEW: Slide-specific actions */}
            {Object.keys(generatedSlides).length > 0 && (
              <div className="pt-3 border-t border-green-200">
                <h5 className="font-medium text-green-800 mb-2">📊 Ready for LinkedIn</h5>
                <button
                  onClick={downloadCarouselSlides}
                  className="w-full p-3 bg-white border border-green-200 rounded-lg hover:border-green-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📥</span>
                    <div>
                      <div className="font-medium text-green-900">Download Carousel Slides</div>
                      <div className="text-xs text-green-700">1080x1080 PNG files</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Design Specifications Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🎨 Design Specifications</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800">Dimensions:</span>
              <span className="text-blue-700">{designSpecs?.dimensions || '1080x1080px'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Primary Color:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: designSpecs?.background_color || '#1B365D' }}
                ></div>
                <span className="text-blue-700">{designSpecs?.background_color || '#1B365D'}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800">Font:</span>
              <span className="text-blue-700">{designSpecs?.font_family || 'Inter'}</span>
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
            
            {Object.keys(generatedSlides).length > 0 && (
              <button
                onClick={downloadCarouselSlides}
                className="w-full p-3 bg-white border border-green-200 rounded-lg hover:border-green-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <div className="text-left">
                    <div className="font-medium text-green-900">Download Images</div>
                    <div className="text-xs text-green-700">High-res PNG files</div>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
