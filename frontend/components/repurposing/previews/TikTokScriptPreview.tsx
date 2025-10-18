import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentActions from '../ContentActions';
import { useToast } from "../../../contexts/ToastContext";

interface TikTokScriptPreviewProps {
  data: any;
}

export default function TikTokScriptPreview({ data }: TikTokScriptPreviewProps) {
  const { showToast } = useToast();
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'script' | 'video' | 'production'>('script');
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<{ [key: number]: string }>({});
  const [sceneProgress, setSceneProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  
  const script = data?.structured_data?.script || data?.script || {};
  const scenes = script?.scenes || [];
  const hooks = script?.hook_variations || [];
  const designSpecs = data?.design_automation || data?.design_specs || {};

  // ✅ AUTO-PLAY FUNCTIONALITY for Video Preview
  const SCENE_DURATION = 3000; // 3 seconds per scene
  const PROGRESS_UPDATE_INTERVAL = 50;

  const startVideoPlayback = () => {
    setIsPlaying(true);
    setSceneProgress(0);
    
    progressRef.current = setInterval(() => {
      setSceneProgress(prev => {
        if (prev >= 100) return 0;
        return prev + (100 / (SCENE_DURATION / PROGRESS_UPDATE_INTERVAL));
      });
    }, PROGRESS_UPDATE_INTERVAL);

    intervalRef.current = setInterval(() => {
      setCurrentScene(prev => {
        const nextScene = prev + 1;
        if (nextScene >= scenes.length) {
          stopVideoPlayback();
          return 0;
        }
        setSceneProgress(0);
        return nextScene;
      });
    }, SCENE_DURATION);
  };

  const stopVideoPlayback = () => {
    setIsPlaying(false);
    setSceneProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  const toggleVideoPlayback = () => {
    if (isPlaying) {
      stopVideoPlayback();
    } else {
      startVideoPlayback();
    }
  };

  useEffect(() => {
    return () => stopVideoPlayback();
  }, []);

  const goToScene = (index: number) => {
    if (isPlaying) stopVideoPlayback();
    setCurrentScene(index);
    setSceneProgress(0);
  };

  // ✅ GENERATE VIDEO PREVIEWS
  const generateVideoContent = async () => {
    setIsGeneratingVideos(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'tiktok_script',
          scenes: scenes,
          designSpecs: {
            dimensions: '1080x1920',
            format: 'video_frames',
            brand_colors: designSpecs.brand_colors || ['#ff0050', '#00f2ea'],
            font_family: designSpecs.font_family || 'Inter',
            style: 'tiktok',
            ...designSpecs
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate video content');

      const result = await response.json();
      setGeneratedVideos(result.images || {});
      showToast('TikTok video content generated successfully!', 'success');
    } catch (error: any) {
      console.error('Error generating video content:', error);
      showToast(`Error generating content: ${error.message}`, 'error');
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const exportFullScript = () => {
    const fullScript = scenes.map((scene: any, index: number) => {
      return `SCENE ${index + 1}:\n${scene.action || ''}\n\nDIALOGUE:\n${scene.dialogue || scene.content || ''}`;
    }).join('\n\n---\n\n');
    return fullScript;
  };

  return (
    <div className="p-6">
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">🎬</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">TikTok Script</h3>
            <p className="text-sm text-gray-600">{scenes.length} scenes • {formatDuration(script.estimated_duration || 30)} video</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('script')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'script' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📝 Script
            </button>
            <button
              onClick={() => setViewMode('video')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'video' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📱 Preview
            </button>
            <button
              onClick={() => setViewMode('production')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'production' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              🎭 Production
            </button>
          </div>

          {/* Generate Video Content Button */}
          <button
            onClick={generateVideoContent}
            disabled={isGeneratingVideos}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isGeneratingVideos ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                🎨 Generate Content
              </>
            )}
          </button>
        </div>
      </div>

      {/* Script View */}
      {viewMode === 'script' && (
        <div className="space-y-6">
          {/* Hook Variations */}
          {hooks.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-3">🎯 Hook Variations (Test These)</h4>
              <div className="space-y-3">
                {hooks.slice(0, 3).map((hook: string, index: number) => (
                  <div key={index} className="bg-white border border-yellow-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-yellow-800 mb-1">Hook {index + 1}</div>
                        <p className="text-yellow-900">{hook}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(hook)}
                        className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scene-by-Scene Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Scene Breakdown</h4>
            </div>
            
            <div className="divide-y divide-gray-200">
              {scenes.map((scene: any, index: number) => (
                <div key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-red-600">{index + 1}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Scene {index + 1}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {formatDuration(scene.duration || 5)}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {scene.type || 'dialogue'}
                        </span>
                        {generatedVideos[index] && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ✓ Generated
                          </span>
                        )}
                      </div>
                      
                      {scene.action && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm font-medium text-blue-900 mb-1">📋 ACTION</div>
                          <p className="text-blue-800 text-sm">{scene.action}</p>
                        </div>
                      )}
                      
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-900 mb-1">🎤 DIALOGUE</div>
                        <p className="text-gray-800">{scene.dialogue || scene.content}</p>
                      </div>
                      
                      {scene.visual_cues && (
                        <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="text-sm font-medium text-purple-900 mb-1">🎨 VISUAL CUES</div>
                          <p className="text-purple-800 text-sm">{scene.visual_cues}</p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(scene.dialogue || scene.content)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Preview */}
      {viewMode === 'video' && (
        <div className="bg-black rounded-xl p-6">
          <div className="max-w-sm mx-auto">
            {/* Play Controls */}
            <div className="flex justify-center gap-3 mb-4">
              <button
                onClick={toggleVideoPlayback}
                className={`px-4 py-2 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                  isPlaying 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                {isPlaying ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    ⏸️ Pause
                  </>
                ) : (
                  <>
                    ▶️ Play Preview
                  </>
                )}
              </button>
            </div>

            {/* TikTok Phone Mockup */}
            <div className="bg-black rounded-3xl p-2">
              <div className="bg-black rounded-3xl overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
                {/* TikTok Interface */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-70">Following</span>
                      <span className="text-sm font-bold">For You</span>
                    </div>
                    <span className="text-lg">🔍</span>
                  </div>
                </div>

                {/* Scene Progress Bars */}
                <div className="absolute top-12 left-0 right-0 z-20 p-2">
                  <div className="flex gap-1">
                    {scenes.map((_, index) => (
                      <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-75"
                          style={{
                            width: index === currentScene ? `${sceneProgress}%` : 
                                  index < currentScene ? '100%' : '0%'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Content Area */}
                <div className="relative w-full h-full bg-gradient-to-br from-purple-900 to-pink-900">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScene}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center text-white p-6"
                      style={{
                        background: generatedVideos[currentScene] 
                          ? `url(${generatedVideos[currentScene]}) center/cover` 
                          : 'linear-gradient(135deg, #ff0050 0%, #00f2ea 100%)'
                      }}
                    >
                      {generatedVideos[currentScene] ? (
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold mb-2">✨ Generated Frame</div>
                            <div className="text-sm opacity-80">Ready for TikTok</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-4">🎬</div>
                          <p className="text-lg font-bold leading-tight mb-2">
                            Scene {currentScene + 1}
                          </p>
                          <p className="text-base leading-relaxed">
                            {scenes[currentScene]?.dialogue || scenes[currentScene]?.content || 'No content available'}
                          </p>
                          
                          {scenes[currentScene]?.action && (
                            <div className="mt-4 p-2 bg-black bg-opacity-40 rounded-lg">
                              <p className="text-sm opacity-80">
                                {scenes[currentScene].action}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Generation Status */}
                  {generatedVideos[currentScene] && (
                    <div className="absolute top-16 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>

                {/* TikTok Side Actions */}
                <div className="absolute right-4 bottom-20 z-20 space-y-6">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-1">
                      ❤️
                    </div>
                    <span className="text-xs">12.5K</span>
                  </div>
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-1">
                      💬
                    </div>
                    <span className="text-xs">432</span>
                  </div>
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-1">
                      📤
                    </div>
                    <span className="text-xs">89</span>
                  </div>
                </div>

                {/* Bottom Navigation & Info */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">YP</span>
                      </div>
                      <span className="font-bold">@yourprofile</span>
                      {isPlaying && (
                        <div className="ml-auto flex items-center gap-1 text-xs bg-black bg-opacity-50 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          AUTO-PLAYING
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{script.description || 'Key insights from our latest podcast episode! 🎙️'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => goToScene(currentScene > 0 ? currentScene - 1 : scenes.length - 1)}
                      className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      ←
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{currentScene + 1}/{scenes.length}</span>
                      {isPlaying && (
                        <div className="text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                          Auto-playing
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => goToScene(currentScene < scenes.length - 1 ? currentScene + 1 : 0)}
                      className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Notes */}
      {viewMode === 'production' && (
        <div className="space-y-6">
          {/* Production Checklist */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">🎭 Production Checklist</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Set up lighting</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Test audio quality</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Prepare props/visual aids</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Practice hook delivery</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Check camera angle</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Rehearse scene transitions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Prepare captions/text overlay</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-green-800">Plan engagement elements</span>
                </label>
              </div>
            </div>
          </div>

          {/* Equipment & Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">📱 Recommended Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-800">Resolution:</span>
                  <span className="text-blue-700">1080x1920 (9:16)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Frame Rate:</span>
                  <span className="text-blue-700">30fps or 60fps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Duration:</span>
                  <span className="text-blue-700">{formatDuration(script.estimated_duration || 30)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-800">Format:</span>
                  <span className="text-blue-700">MP4 or MOV</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3">🎨 Visual Guidelines</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-800">Lighting:</span>
                  <span className="text-purple-700">Natural or ring light</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Background:</span>
                  <span className="text-purple-700">Clean, minimal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Text Overlay:</span>
                  <span className="text-purple-700">Large, readable font</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-800">Colors:</span>
                  <span className="text-purple-700">High contrast</span>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Strategy */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3">🚀 Engagement Strategy</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">Hook Optimization</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• First 3 seconds are crucial</li>
                  <li>• Use pattern interrupts</li>
                  <li>• Ask compelling questions</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">Visual Elements</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Add text overlays for key points</li>
                  <li>• Use trending sounds/music</li>
                  <li>• Include quick cuts for pacing</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">Call-to-Action</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Like if you agree</li>
                  <li>• Comment your thoughts</li>
                  <li>• Follow for more tips</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scene Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {scenes.map((scene: any, index: number) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            onClick={() => goToScene(index)}
            className={`aspect-[9/16] rounded-lg cursor-pointer overflow-hidden border-2 transition-all relative ${
              currentScene === index ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
            }`}
            style={{
              background: generatedVideos[index] 
                ? `url(${generatedVideos[index]}) center/cover` 
                : 'linear-gradient(135deg, #ff0050 0%, #00f2ea 100%)'
            }}
          >
            {generatedVideos[index] && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            
            {currentScene === index && isPlaying && (
              <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs">▶</span>
              </div>
            )}
            
            <div className="p-3 text-white h-full flex flex-col justify-between">
              <div className="text-center">
                <div className="text-2xl mb-2">🎬</div>
                <p className="text-xs leading-tight">
                  {(scene.dialogue || scene.content || '').substring(0, 40)}...
                </p>
              </div>
              <div className="text-center">
                <div className="text-xs opacity-70">
                  Scene {index + 1} {generatedVideos[index] && '• Ready'}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics & ContentActions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-3">🎬 Production Tips</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                📱 Optimal duration: {formatDuration(script.estimated_duration || 30)}
              </div>
            </div>
            <div className="p-3 bg-white border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                🎯 Hook success rate: 85% with first 3 seconds
              </div>
            </div>
            <div className="p-3 bg-white border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                🎨 Content generated: {Object.keys(generatedVideos).length}/{scenes.length}
              </div>
            </div>
            {isPlaying && (
              <div className="p-3 bg-white border border-red-200 rounded-lg">
                <div className="text-sm text-red-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Currently auto-playing
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4">
          <h4 className="font-medium text-pink-900 mb-3">🚀 Export Options</h4>
          <ContentActions 
            content={{
              ...data,
              structured_data: {
                ...data.structured_data,
                scenes: scenes
              },
              generatedVideos: generatedVideos
            }}
            contentType="tiktok_script"
            filename="tiktok_script.txt"
          />
        </div>
      </div>
    </div>
  );
}
