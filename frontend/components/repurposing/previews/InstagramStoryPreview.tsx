import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import ContentActions from '../ContentActions';
import { useToast } from "../../../contexts/ToastContext";

interface InstagramStoryPreviewProps {
  data: any;
}

export default function InstagramStoryPreview({ data }: InstagramStoryPreviewProps) {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ [key: number]: string }>({});
  const [storyProgress, setStoryProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // ✅ AUTO-PLAY FUNCTIONALITY
  const STORY_DURATION = 4000;
  const PROGRESS_UPDATE_INTERVAL = 50;

  const startStoryPlayback = () => {
    setIsPlaying(true);
    setStoryProgress(0);
    
    progressRef.current = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) return 0;
        return prev + (100 / (STORY_DURATION / PROGRESS_UPDATE_INTERVAL));
      });
    }, PROGRESS_UPDATE_INTERVAL);

    intervalRef.current = setInterval(() => {
      setCurrentStory(prev => {
        const nextStory = prev + 1;
        if (nextStory >= enhancedStories.length) {
          stopStoryPlayback();
          return 0;
        }
        setStoryProgress(0);
        return nextStory;
      });
    }, STORY_DURATION);
  };

  const stopStoryPlayback = () => {
    setIsPlaying(false);
    setStoryProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopStoryPlayback();
    } else {
      startStoryPlayback();
    }
  };

  useEffect(() => {
    return () => stopStoryPlayback();
  }, []);

  const goToStory = (index: number) => {
    if (isPlaying) stopStoryPlayback();
    setCurrentStory(index);
    setStoryProgress(0);
  };

  // ✅ GENERATE IMAGES ONLY
  const generateStoryImages = async () => {
    setIsGeneratingImages(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (!response.ok) throw new Error('Failed to generate images');

      const result = await response.json();
      setGeneratedImages(result.images || {});
      showToast(t('instagramStoryPreview.messages.imageGenerationSuccess'), 'success');
    } catch (error: any) {
      console.error('Error generating story images:', error);
      showToast(t('instagramStoryPreview.messages.imageGenerationError', { message: error.message }), 'error');
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const getBackgroundStyle = (story: any) => {
    const backgrounds = {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      solid: designSpecs.brand_colors?.[0] || '#E91E63',
      pattern: 'linear-gradient(45deg, #FF6B6B 25%, transparent 25%, transparent 75%, #FF6B6B 75%)',
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
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">📱</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('instagramStoryPreview.header.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('instagramStoryPreview.header.subtitle', { count: enhancedStories.length })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayback}
            className={`px-4 py-2 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-pink-500 hover:bg-pink-600'
            }`}
          >
            {isPlaying ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                ⏸️ {t('instagramStoryPreview.buttons.pause')}
              </>
            ) : (
              <>
                ▶️ {t('instagramStoryPreview.buttons.preview')}
              </>
            )}
          </button>
          
          {/* Generate Images Button */}
          <button
            onClick={generateStoryImages}
            disabled={isGeneratingImages}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isGeneratingImages ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('instagramStoryPreview.buttons.generating')}
              </>
            ) : (
              <>
                🎨 {t('instagramStoryPreview.buttons.generateImages')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instagram Phone Mockup */}
      <div className="bg-gray-100 rounded-3xl p-6 mb-6">
        <div className="max-w-sm mx-auto">
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
                        className="h-full bg-white rounded-full transition-all duration-75"
                        style={{
                          width: index === currentStory ? `${storyProgress}%` : 
                                index < currentStory ? '100%' : '0%'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Story Header */}
              <div className="absolute top-12 left-0 right-0 z-20 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center relative">
                    <span className="text-white text-xs font-bold">YP</span>
                    {isPlaying && (
                      <div className="absolute -inset-1 border-2 border-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span className="text-white text-sm font-medium">{t('instagramStoryPreview.mockup.profileName')}</span>
                  <span className="text-white text-sm opacity-70">{t('instagramStoryPreview.mockup.timeAgo')}</span>
                  {isPlaying && (
                    <div className="ml-auto flex items-center gap-1 text-white text-xs bg-black bg-opacity-30 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      {t('instagramStoryPreview.mockup.live')}
                    </div>
                  )}
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
                    {generatedImages[currentStory] ? (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold mb-2">✨ {t('instagramStoryPreview.storyContent.generatedStory')}</div>
                          <div className="text-sm opacity-80">{t('instagramStoryPreview.storyContent.readyForInstagram')}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        {/* Story Type Content */}
                        {enhancedStories[currentStory]?.type === 'quote' && (
                          <div>
                            <div className="text-6xl mb-4">💭</div>
                            <p className="text-xl font-bold leading-tight mb-4">
                              "{enhancedStories[currentStory]?.content}"
                            </p>
                            <div className="text-sm opacity-80">{t('instagramStoryPreview.storyTypes.quote.cta')}</div>
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
                            <div className="text-sm opacity-80">{t('instagramStoryPreview.storyTypes.stat.source')}</div>
                          </div>
                        )}
                        
                        {enhancedStories[currentStory]?.type === 'tip' && (
                          <div>
                            <div className="text-6xl mb-4">💡</div>
                            <div className="text-lg font-bold mb-2">{t('instagramStoryPreview.storyTypes.tip.title')}</div>
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
                                {t('instagramStoryPreview.storyTypes.question.yes')}
                              </div>
                              <div className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm">
                                {t('instagramStoryPreview.storyTypes.question.no')}
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
                    onClick={() => goToStory(currentStory > 0 ? currentStory - 1 : enhancedStories.length - 1)}
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
                    {isPlaying && (
                      <div className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                        {t('instagramStoryPreview.mockup.autoPlaying')}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => goToStory(currentStory < enhancedStories.length - 1 ? currentStory + 1 : 0)}
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

      {/* Story Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {enhancedStories.map((story: any, index: number) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            onClick={() => goToStory(index)}
            className={`aspect-[9/16] rounded-lg cursor-pointer overflow-hidden border-2 transition-all relative ${
              currentStory === index ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200'
            }`}
            style={{
              background: generatedImages[index] 
                ? `url(${generatedImages[index]}) center/cover` 
                : getBackgroundStyle(story)
            }}
          >
            {generatedImages[index] && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            
            {currentStory === index && isPlaying && (
              <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs">▶</span>
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
                  {t('instagramStoryPreview.storyGrid.storyNumber', { number: index + 1 })} {generatedImages[index] && t('instagramStoryPreview.storyGrid.ready')}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics & ContentActions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">📊 {t('instagramStoryPreview.analytics.title')}</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                📈 {t('instagramStoryPreview.analytics.expectedReach', { views: Math.floor(Math.random() * 5000) + 2000 })}
              </div>
            </div>
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                💬 {t('instagramStoryPreview.analytics.expectedEngagement', { percentage: Math.floor(Math.random() * 20) + 15 })}
              </div>
            </div>
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                🎨 {t('instagramStoryPreview.analytics.imagesGenerated', { 
                  generated: Object.keys(generatedImages).length, 
                  total: enhancedStories.length 
                })}
              </div>
            </div>
            {isPlaying && (
              <div className="p-3 bg-white border border-purple-200 rounded-lg">
                <div className="text-sm text-purple-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {t('instagramStoryPreview.analytics.currentlyAutoPlaying')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4">
          <h4 className="font-medium text-pink-900 mb-3">🚀 {t('instagramStoryPreview.exportOptions.title')}</h4>
          <ContentActions 
            content={{
              ...data,
              generatedImages: generatedImages // Pass generated images to ContentActions
            }}
            contentType="instagram_story"
            filename="instagram_stories.txt"
          />
        </div>
      </div>
    </div>
  );
}
