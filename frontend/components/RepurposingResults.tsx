import { useState } from 'react';
import { motion } from 'framer-motion';

interface RepurposingResultsProps {
  results: any;
  jobId: string;
}

// LinkedIn Carousel Preview Component
function LinkedInCarouselPreview({ data }: { data: any }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = data?.slides || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">LinkedIn Carousel</h3>
        <span className="text-sm text-gray-500">{slides.length} slides</span>
      </div>
      
      {/* Carousel Preview */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="bg-white rounded-lg shadow-sm border aspect-square max-w-md mx-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              <div>
                <div className="font-semibold text-sm">Your Brand</div>
                <div className="text-xs text-gray-500">Professional Services</div>
              </div>
            </div>
            
            {slides[currentSlide] && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">{slides[currentSlide].headline}</h4>
                <p className="text-gray-700 text-sm">{slides[currentSlide].content}</p>
              </div>
            )}
            
            {/* Slide Navigation */}
            <div className="flex justify-center gap-1 mt-6">
              {slides.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${
                    currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">All Slides</h4>
        {slides.map((slide: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                {index + 1}
              </span>
              <h5 className="font-medium">{slide.headline}</h5>
            </div>
            <p className="text-gray-600 text-sm">{slide.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Twitter Thread Preview Component
function TwitterThreadPreview({ data }: { data: any }) {
  const tweets = data?.thread_tweets || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Twitter Thread</h3>
        <span className="text-sm text-gray-500">{tweets.length} tweets</span>
      </div>

      {/* Thread Preview */}
      <div className="space-y-3">
        {tweets.map((tweet: any, index: number) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                YB
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Your Brand</span>
                  <span className="text-gray-500">@yourbrand</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500 text-sm">now</span>
                </div>
                <p className="text-gray-900">{tweet.content}</p>
                <div className="flex items-center justify-between mt-3 text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm">💬 {Math.floor(Math.random() * 50) + 5}</span>
                    <span className="flex items-center gap-1 text-sm">🔄 {Math.floor(Math.random() * 100) + 10}</span>
                    <span className="flex items-center gap-1 text-sm">❤️ {Math.floor(Math.random() * 200) + 20}</span>
                  </div>
                  <span className="text-xs">{tweet.character_count}/280</span>
                </div>
              </div>
            </div>
            {index < tweets.length - 1 && (
              <div className="ml-5 mt-2">
                <div className="w-0.5 h-4 bg-gray-300"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Instagram Story Preview Component
function InstagramStoryPreview({ data }: { data: any }) {
  const [currentStory, setCurrentStory] = useState(0);
  const stories = data?.story_sequence || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Instagram Stories</h3>
        <span className="text-sm text-gray-500">{stories.length} stories</span>
      </div>

      {/* Story Preview */}
      <div className="bg-black rounded-lg p-4 max-w-sm mx-auto">
        <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg aspect-[9/16] p-6 text-white relative">
          {/* Story Progress Bars */}
          <div className="flex gap-1 mb-4">
            {stories.map((_: any, index: number) => (
              <div
                key={index}
                className={`h-0.5 flex-1 rounded-full ${
                  index <= currentStory ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {stories[currentStory] && (
            <div className="h-full flex flex-col justify-center text-center">
              <h4 className="text-xl font-bold mb-4">{stories[currentStory].content}</h4>
              {stories[currentStory].interactive_elements && (
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-full py-2 px-4">
                    <span className="text-sm">📊 Poll: What do you think?</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <button
              onClick={() => setCurrentStory(Math.max(0, currentStory - 1))}
              disabled={currentStory === 0}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center disabled:opacity-50"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentStory(Math.min(stories.length - 1, currentStory + 1))}
              disabled={currentStory === stories.length - 1}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center disabled:opacity-50"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">All Stories</h4>
        {stories.map((story: any, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                {index + 1}
              </span>
              <h5 className="font-medium">Story {index + 1}</h5>
            </div>
            <p className="text-gray-600 text-sm">{story.content}</p>
            {story.interactive_elements && (
              <div className="mt-2 text-xs text-purple-600">
                Interactive: {story.interactive_elements}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Design Preview Component
function DesignPreview({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Design Specifications</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Color Palette */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Color Palette</h4>
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-blue-500 rounded-lg"></div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg"></div>
            <div className="w-12 h-12 bg-green-400 rounded-lg"></div>
            <div className="w-12 h-12 bg-gray-900 rounded-lg"></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <div>Primary: #3B82F6</div>
            <div>Secondary: #8B5CF6</div>
            <div>Accent: #9CEE69</div>
            <div>Text: #1F2937</div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Typography</h4>
          <div className="space-y-2">
            <div className="text-2xl font-bold">Heading - Inter Bold</div>
            <div className="text-lg font-semibold">Subheading - Inter Semibold</div>
            <div className="text-base">Body Text - Inter Regular</div>
            <div className="text-sm text-gray-600">Caption - Inter Medium</div>
          </div>
        </div>
      </div>

      {/* Design Templates */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Design Templates</h4>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((template) => (
            <div key={template} className="bg-white rounded-lg p-4 border">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-2"></div>
              <div className="text-sm font-medium">Template {template}</div>
              <div className="text-xs text-gray-500">1080x1080px</div>
            </div>
          ))}
        </div>
      </div>

      {/* Canva Integration */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            C
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Ready for Canva</h4>
            <p className="text-blue-700 text-sm">Templates are automatically optimized for Canva editing</p>
          </div>
          <button className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Open in Canva
          </button>
        </div>
      </div>
    </div>
  );
}

// Analytics Preview Component
function AnalyticsPreview({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Performance Analytics</h3>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">85%</div>
          <div className="text-sm text-green-700">Engagement Score</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">5.2K</div>
          <div className="text-sm text-blue-700">Expected Reach</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">High</div>
          <div className="text-sm text-purple-700">Viral Potential</div>
        </div>
      </div>

      {/* Best Posting Times */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Optimal Posting Schedule</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700">Best Days</div>
            <div className="text-sm text-gray-600">Tuesday, Wednesday, Thursday</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Best Times</div>
            <div className="text-sm text-gray-600">9:00 AM, 1:00 PM, 5:00 PM EST</div>
          </div>
        </div>
      </div>

      {/* Hashtag Suggestions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Recommended Hashtags</h4>
        <div className="flex flex-wrap gap-2">
          {['#podcast', '#contentcreator', '#marketing', '#socialmedia', '#entrepreneur', '#business'].map((tag) => (
            <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* A/B Testing Suggestions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-3">A/B Testing Opportunities</h4>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• Test different opening hooks for engagement</li>
          <li>• Try posting at different times of day</li>
          <li>• Experiment with emoji usage in headlines</li>
          <li>• Test question vs. statement formats</li>
        </ul>
      </div>
    </div>
  );
}

// Generic Content Preview Component
function GenericContentPreview({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Content Preview</h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Copy Content
        </button>
        <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
          Download
        </button>
      </div>
    </div>
  );
}

export default function RepurposingResults({ results, jobId }: RepurposingResultsProps) {
  const [activeTab, setActiveTab] = useState(Object.keys(results)[0]);
  const [previewMode, setPreviewMode] = useState<'content' | 'design' | 'analytics'>('content');

  const contentTypeIcons: { [key: string]: string } = {
    linkedin_carousel: '📊',
    twitter_thread: '🧵',
    instagram_story: '📱',
    tiktok_script: '🎬',
    blog_outline: '📝',
    email_course: '📧',
    infographic_data: '📈'
  };

  const renderContentPreview = (contentType: string, data: any) => {
    switch (contentType) {
      case 'linkedin_carousel':
        return <LinkedInCarouselPreview data={data} />;
      case 'twitter_thread':
        return <TwitterThreadPreview data={data} />;
      case 'instagram_story':
        return <InstagramStoryPreview data={data} />;
      default:
        return <GenericContentPreview data={data} />;
    }
  };

  // Handle empty results
  if (!results || Object.keys(results).length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Available</h2>
          <p className="text-gray-600">Content repurposing results will appear here once generated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Repurposing Results</h1>
        <p className="text-gray-600">Your content has been transformed into {Object.keys(results).length} different formats</p>
      </div>

      {/* Results Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.keys(results).map(contentType => (
          <button
            key={contentType}
            onClick={() => setActiveTab(contentType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === contentType
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {contentTypeIcons[contentType]} {contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Preview Mode Toggle */}
      <div className="flex gap-2 mb-6">
        {['content', 'design', 'analytics'].map(mode => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              previewMode === mode
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Display */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab + previewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            {previewMode === 'content' && renderContentPreview(activeTab, results[activeTab])}
            {previewMode === 'design' && <DesignPreview data={results[activeTab]} />}
            {previewMode === 'analytics' && <AnalyticsPreview data={results[activeTab]} />}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                📋 Copy Content
              </button>
              <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                📱 Schedule Post
              </button>
              <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                🎨 Open in Canva
              </button>
              <button className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                📥 Download All
              </button>
            </div>
          </div>

          {/* Performance Predictions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Predictions</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expected Reach:</span>
                <span className="font-medium text-green-600">5.2K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Engagement Rate:</span>
                <span className="font-medium text-blue-600">4.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Viral Potential:</span>
                <span className="font-medium text-purple-600">High</span>
              </div>
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Optimization Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✅ Post on Tuesday at 2 PM EST</li>
              <li>✅ Add trending hashtags</li>
              <li>✅ Engage with comments quickly</li>
              <li>✅ Cross-promote on other platforms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
