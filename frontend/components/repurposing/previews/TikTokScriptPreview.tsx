import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentActions from '../ContentActions';

interface TikTokScriptPreviewProps {
  data: any;
}

export default function TikTokScriptPreview({ data }: TikTokScriptPreviewProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'script' | 'video' | 'production'>('script');
  
  const script = data?.structured_data?.script || data?.script || {};
  const scenes = script?.scenes || [];
  const hooks = script?.hook_variations || [];
  const designSpecs = data?.design_automation || data?.design_specs || {};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportFullScript = () => {
    const fullScript = scenes.map((scene: any, index: number) => {
      return `SCENE ${index + 1}:\n${scene.action || ''}\n\nDIALOGUE:\n${scene.dialogue || scene.content || ''}`;
    }).join('\n\n---\n\n');
    return fullScript;
  };

  const formatDuration = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
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
        
        <div className="flex gap-2">
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
              📱 Video Preview
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
          
          <button
            onClick={() => copyToClipboard(exportFullScript())}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            📋 Copy Script
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
            {/* TikTok Phone Mockup */}
            <div className="bg-black rounded-3xl p-2">
              <div className="bg-black rounded-3xl overflow-hidden relative" style={{ aspectRatio: '9/16' }}>
                {/* TikTok Interface */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Following</span>
                      <span className="text-sm font-bold">For You</span>
                    </div>
                    <span className="text-lg">🔍</span>
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
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center text-white p-6"
                    >
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
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-20 left-4 right-20 z-20">
                    <div className="w-full h-1 bg-white bg-opacity-30 rounded-full">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
                      />
                    </div>
                  </div>
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

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">YP</span>
                      </div>
                      <span className="font-bold">@yourprofile</span>
                    </div>
                    <p className="text-sm">{script.description || 'Key insights from our latest podcast episode! 🎙️'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentScene(prev => prev > 0 ? prev - 1 : scenes.length - 1)}
                      className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                    >
                      ←
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                      >
                        {isPlaying ? '⏸️' : '▶️'}
                      </button>
                      <span className="text-sm">{currentScene + 1}/{scenes.length}</span>
                    </div>
                    
                    <button
                      onClick={() => setCurrentScene(prev => prev < scenes.length - 1 ? prev + 1 : 0)}
                      className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
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

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-3">🎬 Production Tips</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                📱 Optimal duration: {script.estimated_duration || 30} seconds
              </div>
            </div>
            <div className="p-3 bg-white border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                🎯 Hook success rate: 85% with first 3 seconds
              </div>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4">
          <h4 className="font-medium text-pink-900 mb-3">🚀 Production Tools</h4>
          <ContentActions 
            content={data}
            contentType="tiktok_script"
            filename="tiktok_script.txt"
          />
        </div>
      </div>
    </div>
  );
}
