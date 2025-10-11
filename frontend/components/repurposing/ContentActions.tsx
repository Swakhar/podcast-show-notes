import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

export interface ContentActionsProps {
  content: any;
  contentType: 'linkedin_carousel' | 'twitter_thread' | 'instagram_story' | 'tiktok_script' | 'blog_outline' | 'email_course' | 'infographic_data';
  filename?: string;
}

export default function ContentActions({ 
  content, 
  contentType, 
  filename
}: ContentActionsProps) {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  // Extract text content for basic operations
  const extractTextContent = (): string => {
    try {
      switch (contentType) {
        case 'instagram_story':
          const stories = content?.structured_data?.story_sequence || content?.stories || [];
          return stories.map((story: any, i: number) => 
            `Story ${i + 1}:\n${story.content || story.text || story}\n`
          ).join('\n') || '';
          
        case 'twitter_thread':
          const hookTweet = content?.structured_data?.hook_tweet || content?.hook_tweet || '';
          const threadTweets = content?.structured_data?.thread_tweets || content?.thread_tweets || [];
          const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
          return allTweets.map((tweet, index) => `${index + 1}/${allTweets.length} ${tweet}`).join('\n\n');
          
        case 'linkedin_carousel':
          const slides = content?.structured_data?.slides || content?.slides || [];
          const title = content?.structured_data?.title || content?.title || 'LinkedIn Carousel';
          const hashtags = content?.structured_data?.hashtags || content?.hashtags || [];
          const slideTexts = slides.map((slide: any, index: number) => 
            `Slide ${index + 1}: ${slide.content || slide.text || slide}`
          ).join('\n\n');
          return `${title}\n\n${slideTexts}\n\n${hashtags.join(' ')}`;
          
        default:
          return JSON.stringify(content, null, 2);
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      return JSON.stringify(content, null, 2);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      const textContent = extractTextContent();
      await navigator.clipboard.writeText(textContent);
      showToast('Content copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy content to clipboard', 'error');
    }
  };

  // Download as text file
  const downloadAsFile = async () => {
    try {
      const textContent = extractTextContent();
      const defaultFilename = filename || `${contentType}_${Date.now()}.txt`;
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Content downloaded successfully!', 'success');
    } catch (error) {
      showToast('Failed to download content', 'error');
    }
  };

  // ✅ NEW: Download generated images (for Instagram Stories and LinkedIn Carousel)
  const downloadGeneratedImages = async () => {
    setIsDownloading(true);
    
    try {
      // Check if we have generated images
      const generatedImages = content?.generatedImages || content?.generatedSlides || {};
      
      if (Object.keys(generatedImages).length === 0) {
        showToast('No generated images found. Generate images first!', 'warning');
        return;
      }

      const response = await fetch('/api/repurpose/download-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: contentType,
          stories: contentType === 'instagram_story' ? (content?.structured_data?.story_sequence || content?.stories) : undefined,
          slides: contentType === 'linkedin_carousel' ? (content?.structured_data?.slides || content?.slides) : undefined,
          images: generatedImages
        }),
      });

      if (!response.ok) throw new Error('Failed to prepare download');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}_images.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Images downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error downloading images:', error);
      showToast(`Error downloading images: ${error.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ NEW: Export for multiple platforms
  const exportForPlatforms = async () => {
    setIsDownloading(true);
    
    try {
      const generatedImages = content?.generatedImages || content?.generatedSlides || {};
      
      if (Object.keys(generatedImages).length === 0) {
        showToast('No generated images found. Generate images first!', 'warning');
        return;
      }

      const response = await fetch('/api/repurpose/export-platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: contentType,
          stories: contentType === 'instagram_story' ? (content?.structured_data?.story_sequence || content?.stories) : undefined,
          slides: contentType === 'linkedin_carousel' ? (content?.structured_data?.slides || content?.slides) : undefined,
          images: generatedImages,
          exportFormats: [
            'canva_templates',
            'buffer_ready',
            'later_scheduler',
            'hootsuite_format',
            'raw_images'
          ]
        }),
      });

      if (!response.ok) throw new Error('Failed to export for platforms');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}_platform_exports.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('Platform exports downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error exporting for platforms:', error);
      showToast(`Error exporting: ${error.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // Check if we have generated images
  const hasGeneratedImages = () => {
    const generatedImages = content?.generatedImages || content?.generatedSlides || {};
    return Object.keys(generatedImages).length > 0;
  };

  return (
    <div className="space-y-3">
      {/* Basic Actions */}
      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2 justify-center"
        >
          📋 Copy Text
        </button>
        
        <button
          onClick={downloadAsFile}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2 justify-center"
        >
          💾 Download Text
        </button>
      </div>

      {/* Image-specific Actions */}
      {(contentType === 'instagram_story' || contentType === 'linkedin_carousel') && (
        <div className="space-y-2">
          <div className="border-t border-gray-200 pt-3">
            <h5 className="font-medium text-gray-700 mb-2 text-sm">📱 Generated Images</h5>
            
            {hasGeneratedImages() ? (
              <div className="space-y-2">
                <button
                  onClick={downloadGeneratedImages}
                  disabled={isDownloading}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📥</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {isDownloading ? 'Downloading...' : 'Download Images'}
                      </div>
                      <div className="text-xs text-gray-600">
                        High-resolution {contentType === 'instagram_story' ? '1080x1920' : '1080x1080'} PNG files
                      </div>
                    </div>
                    {isDownloading && (
                      <div className="ml-auto w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={exportForPlatforms}
                  disabled={isDownloading}
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {isDownloading ? 'Exporting...' : 'Export for Platforms'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Canva, Buffer, Later, Hootsuite formats
                      </div>
                    </div>
                    {isDownloading && (
                      <div className="ml-auto w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <div className="text-sm text-gray-600">
                  Generate images first to unlock export options
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content-specific Actions */}
      {contentType === 'blog_outline' && (
        <div className="border-t border-gray-200 pt-3">
          <button
            onClick={downloadAsFile}
            className="w-full p-3 bg-white border border-green-200 rounded-lg hover:border-green-300 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <div>
                <div className="font-medium text-green-900">Export as Markdown</div>
                <div className="text-xs text-green-700">WordPress/CMS ready format</div>
              </div>
            </div>
          </button>
        </div>
      )}

      {contentType === 'twitter_thread' && (
        <div className="border-t border-gray-200 pt-3">
          <button
            onClick={downloadAsFile}
            className="w-full p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-300 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🧵</span>
              <div>
                <div className="font-medium text-blue-900">Export Thread</div>
                <div className="text-xs text-blue-700">Numbered tweets ready to post</div>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
