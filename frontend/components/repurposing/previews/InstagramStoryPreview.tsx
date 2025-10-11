import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentActions from '../ContentActions';
import { useToast } from "../../../contexts/ToastContext";

interface InstagramStoryPreviewProps {
  data: any;
}

export default function InstagramStoryPreview({ data }: InstagramStoryPreviewProps) {
  const { showToast } = useToast();
  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ [key: number]: string }>({});
  
  const stories = data?.structured_data?.story_sequence || data?.stories || [];
  const designSpecs = data?.design_automation || data?.design_specs || {};
  
  // Generate different story types
  const storyTypes = ['quote', 'stat', 'tip', 'question', 'behind_scenes'];
  
  const enhancedStories = stories.map((story: any, index: number) => ({
    ...story,
    type: storyTypes[index % storyTypes.length],
    background: designSpecs.story_backgrounds?.[index] || 'gradient',
    engagement: {
      views: Math.floor(Math.random() * 1000) + 500,
      likes: Math.floor(Math.random() * 100) + 20,
      replies: Math.floor(Math.random() * 20) + 2
    }
  }));

  // ✅ NEW: Generate story images
  const generateStoryImages = async () => {
    setIsGeneratingImages(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: 'instagram_story',
          stories: enhancedStories,
          designSpecs: {
            dimensions: '1080x1920',
            format: 'story',
            brand_colors: designSpecs.brand_colors || ['#667eea', '#764ba2'],
            font_family: designSpecs.font_family || 'Inter',
            ...designSpecs
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const result = await response.json();
      setGeneratedImages(result.images || {});
      
      // Show success message
      showToast('Story images generated successfully!', 'success');
    } catch (error: any) {
      console.error('Error generating story images:', error);
      showToast(`Error generating images: ${error.message}`, 'error');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // ✅ NEW: Download all story images
  const downloadStoryImages = async () => {
    try {
      const response = await fetch('/api/repurpose/download-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: 'instagram_story',
          stories: enhancedStories,
          images: generatedImages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to prepare download');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'instagram_stories.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('Story images downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error downloading images:', error);
      showToast(`Error downloading images: ${error.message}`, 'error');
    }
  };

  const getBackgroundStyle = (story: any) => {
    const backgrounds = {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      solid: designSpecs.brand_colors?.[0] || '#E91E63',
      pattern: 'linear-gradient(45deg, #FF6B6B 25%, transparent 25%, transparent 75%, #FF6B6B 75%, #FF6B6B), linear-gradient(45deg, #FF6B6B 25%, transparent 25%, transparent 75%, #FF6B6B 75%, #FF6B6B)',
    };
    
    return story.background_type && backgrounds[story.background_type as keyof typeof backgrounds] 
      ? backgrounds[story.background_type as keyof typeof backgrounds]
      : backgrounds.gradient;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">📱</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Instagram Stories</h3>
            <p className="text-sm text-gray-600">{enhancedStories.length} stories • Interactive format</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Preview Stories'}
          </button>
          
          {/* ✅ NEW: Generate Images Button */}
          <button
            onClick={generateStoryImages}
            disabled={isGeneratingImages}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isGeneratingImages ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                🎨 Generate Images
              </>
            )}
          </button>

          {/* ✅ NEW: Download Images Button */}
          {Object.keys(generatedImages).length > 0 && (
            <button
              onClick={downloadStoryImages}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              📥 Download Images
            </button>
          )}
        </div>
      </div>

      {/* Instagram Phone Mockup */}
      <div className="bg-gray-100 rounded-3xl p-6 mb-6">
        <div className="max-w-sm mx-auto">
          {/* Phone Frame */}
          <div className="bg-black rounded-3xl p-2">
            <div className="bg-white rounded-3xl overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 bg-black bg-opacity-20 text-white p-2">
                <div className="flex items-center justify-between text-sm">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-1 bg-white rounded"></div>
                    <div className="w-4 h-1 bg-white bg-opacity-50 rounded"></div>
                    <div className="w-4 h-1 bg-white bg-opacity-30 rounded"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📶</span>
                    <span>🔋</span>
                  </div>
                </div>
              </div>

              {/* Story Progress Bars */}
              <div className="absolute top-6 left-0 right-0 z-20 p-2">
                <div className="flex gap-1">
                  {enhancedStories.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-white rounded-full transition-all duration-300 ${
                          index < currentStory ? 'w-full' 
                          : index === currentStory ? 'w-1/2' 
                          : 'w-0'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Header */}
              <div className="absolute top-12 left-0 right-0 z-20 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">YP</span>
                  </div>
                  <span className="text-white text-sm font-medium">yourprofile</span>
                  <span className="text-white text-sm opacity-70">2h</span>
                </div>
              </div>

              {/* Story Content */}
              <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStory}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center text-white p-6"
                    style={{
                      background: generatedImages[currentStory] 
                        ? `url(${generatedImages[currentStory]}) center/cover` 
                        : getBackgroundStyle(enhancedStories[currentStory])
                    }}
                  >
                    {/* ✅ Show generated image or fallback to text */}
                    {generatedImages[currentStory] ? (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold mb-2">✨ Generated Story</div>
                          <div className="text-sm opacity-80">Ready for Instagram</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        {enhancedStories[currentStory]?.type === 'quote' && (
                          <div>
                            <div className="text-6xl mb-4">💭</div>
                            <p className="text-xl font-bold leading-tight mb-4">
                              "{enhancedStories[currentStory]?.content}"
                            </p>
                            <div className="text-sm opacity-80">Swipe up for more insights</div>
                          </div>
                        )}
                        
                        {enhancedStories[currentStory]?.type === 'stat' && (
                          <div>
                            <div className="text-6xl mb-4">📊</div>
                            <div className="text-4xl font-bold mb-2">
                              {Math.floor(Math.random() * 90) + 10}%
                            </div>
                            <p className="text-lg mb-4">
                              {enhancedStories[currentStory]?.content}
                            </p>
                            <div className="text-sm opacity-80">Source: Our podcast research</div>
                          </div>
                        )}
                        
                        {enhancedStories[currentStory]?.type === 'tip' && (
                          <div>
                            <div className="text-6xl mb-4">💡</div>
                            <div className="text-lg font-bold mb-2">Pro Tip</div>
                            <p className="text-lg leading-relaxed">
                              {enhancedStories[currentStory]?.content}
                            </p>
                          </div>
                        )}
                        
                        {enhancedStories[currentStory]?.type === 'question' && (
                          <div>
                            <div className="text-6xl mb-4">❓</div>
                            <p className="text-xl font-bold leading-tight mb-4">
                              {enhancedStories[currentStory]?.content}
                            </p>
                            <div className="flex gap-2 justify-center">
                              <div className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">
                                Yes
                              </div>
                              <div className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">
                                No
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {(!enhancedStories[currentStory]?.type || enhancedStories[currentStory]?.type === 'behind_scenes') && (
                          <div>
                            <div className="text-6xl mb-4">🎬</div>
                            <p className="text-lg leading-relaxed">
                              {enhancedStories[currentStory]?.content}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Story Navigation */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStory(prev => prev > 0 ? prev - 1 : enhancedStories.length - 1)}
                    className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-colors"
                  >
                    ←
                  </button>
                  
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span className="text-sm">{formatNumber(enhancedStories[currentStory]?.engagement?.views || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span className="text-sm">{formatNumber(enhancedStories[currentStory]?.engagement?.likes || 0)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCurrentStory(prev => prev < enhancedStories.length - 1 ? prev + 1 : 0)}
                    className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ENHANCED: Story Grid Overview with Image Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {enhancedStories.map((story: any, index: number) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentStory(index)}
            className={`aspect-[9/16] rounded-lg cursor-pointer overflow-hidden border-2 transition-all relative ${
              currentStory === index ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'
            }`}
            style={{
              background: generatedImages[index] 
                ? `url(${generatedImages[index]}) center/cover` 
                : getBackgroundStyle(story)
            }}
          >
            {/* ✅ Image status indicator */}
            {generatedImages[index] && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            
            <div className="p-3 text-white h-full flex flex-col justify-between">
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {story.type === 'quote' && '💭'}
                  {story.type === 'stat' && '📊'}
                  {story.type === 'tip' && '💡'}
                  {story.type === 'question' && '❓'}
                  {story.type === 'behind_scenes' && '🎬'}
                </div>
                <p className="text-xs leading-tight">
                  {story.content?.substring(0, 50)}...
                </p>
              </div>
              <div className="text-center">
                <div className="text-xs opacity-70">
                  Story {index + 1} {generatedImages[index] && '• Image Ready'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ✅ ENHANCED: Action Buttons with Image Features */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">📊 Story Analytics</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                📈 Expected reach: {Math.floor(Math.random() * 5000) + 2000} views
              </div>
            </div>
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                💬 Expected engagement: {Math.floor(Math.random() * 20) + 15}%
              </div>
            </div>
            {/* ✅ NEW: Image generation status */}
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                🎨 Images generated: {Object.keys(generatedImages).length}/{enhancedStories.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4">
          <h4 className="font-medium text-pink-900 mb-3">🚀 Publishing Tools</h4>
          <div className="space-y-3">
            <ContentActions 
              content={data}
              contentType="instagram_story"
              filename="instagram_stories.txt"
            />
            
            {/* ✅ NEW: Image-specific actions */}
            {Object.keys(generatedImages).length > 0 && (
              <div className="pt-3 border-t border-pink-200">
                <h5 className="font-medium text-pink-800 mb-2">📱 Ready for Instagram</h5>
                <button
                  onClick={downloadStoryImages}
                  className="w-full p-3 bg-white border border-pink-200 rounded-lg hover:border-pink-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📥</span>
                    <div>
                      <div className="font-medium text-pink-900">Download Story Images</div>
                      <div className="text-xs text-pink-700">1080x1920 PNG files</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
