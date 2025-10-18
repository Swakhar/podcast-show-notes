import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

export interface ContentActionsProps {
  content: any;
  contentType: 'linkedin_carousel' | 'twitter_thread' | 'instagram_story' | 'tiktok_script' | 'blog_outline' | 'email_course' | 'infographic_data';
  filename?: string;
}

const compressImageData = async (imageData: string, quality: number = 0.8): Promise<string> => {
  if (imageData.length < 50000) { // Less than ~37KB
    return imageData;
  }
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = imageData;
    });

    // ✅ Better dimension handling - don't reduce too much
    let width = img.width;
    let height = img.height;
    
    // ✅ Only reduce if really large (keep quality better)
    const maxDimension = 1080; // Back to original size
        
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
    }
        
    canvas.width = width;
    canvas.height = height;
        
    if (ctx) {
      // ✅ Higher quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // ✅ Use PNG for better quality, JPEG only if too large
      const originalPNG = canvas.toDataURL('image/png');
      
      // Only compress to JPEG if PNG is too large
      if (originalPNG.length > 800000) { // ~600KB threshold
        const compressedJPEG = canvas.toDataURL('image/jpeg', Math.max(quality, 0.7)); // Minimum 70% quality
        return compressedJPEG.length < originalPNG.length ? compressedJPEG : originalPNG;
      }
      
      return originalPNG;
    } else {
      return imageData;
    }
  } catch (error) {
    return imageData;
  }
};

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
          
        case 'tiktok_script':
          const script = content?.structured_data?.script || content?.script || {};
          const scenes = script?.scenes || content?.structured_data?.scenes || content?.scenes || [];
          const hooks = script?.hook_variations || content?.structured_data?.hook_variations || content?.hook_variations || [];
          
          let scriptText = `TikTok Video Script\n\n`;
          
          if (hooks.length > 0) {
            scriptText += `HOOK VARIATIONS:\n${hooks.map((hook, i) => `${i + 1}. ${hook}`).join('\n')}\n\n`;
          }
          
          scriptText += `SCENES:\n${scenes.map((scene, i) => 
            `Scene ${i + 1} (${scene.duration || 5}s):\nAction: ${scene.action || 'N/A'}\nDialogue: ${scene.dialogue || scene.content || ''}`
          ).join('\n\n')}`;
          
          return scriptText;

      // ✅ Enhanced blog outline extraction
      case 'blog_outline':
        const outline = content?.structured_data?.blog_outline || content?.outline || {};
        const sections = outline?.sections || [];
        const seoData = content?.seo_optimization || content?.seo || {};
        
        let blogText = `# ${outline.title || 'Blog Post Outline'}\n\n`;
        
        if (outline.meta_description || seoData.meta_description) {
          blogText += `**Description:** ${outline.meta_description || seoData.meta_description}\n\n`;
        }
        
        if (seoData.primary_keywords && seoData.primary_keywords.length > 0) {
          blogText += `**Keywords:** ${seoData.primary_keywords.join(', ')}\n\n`;
        }
        
        if (outline.introduction) {
          blogText += `## Introduction\n${outline.introduction}\n\n`;
        }
        
        blogText += sections.map((section: any, index: number) => {
          let sectionText = `## ${section.heading}\n${section.content || section.summary || ''}\n\n`;
          
          if (section.key_points && section.key_points.length > 0) {
            sectionText += `### Key Points:\n${section.key_points.map((point: string) => `- ${point}`).join('\n')}\n\n`;
          }
          
          if (section.subsections && section.subsections.length > 0) {
            sectionText += section.subsections.map((sub: any) => 
              `### ${sub.heading}\n${sub.content || sub.summary || ''}\n\n`
            ).join('');
          }
          
          return sectionText;
        }).join('');
        
        if (outline.conclusion) {
          blogText += `## Conclusion\n${outline.conclusion}\n\n`;
        }
        
        if (seoData.score) {
          blogText += `---\n**SEO Score:** ${seoData.score}/100\n`;
        }
        
        return blogText;
        
      default:
        return JSON.stringify(content, null, 2);
    }
  } catch (error) {
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

  // ✅ NEW: Download generated images (for Instagram Stories, LinkedIn Carousel, and Infographics)
  const downloadGeneratedImages = async () => {
    setIsDownloading(true);
    
    try {
      const generatedImages = content?.generatedImages || content?.generatedSlides || content?.generatedVideos || content?.generatedDesigns || {};
      
      if (Object.keys(generatedImages).length === 0) {
        showToast('No generated content found. Generate content first!', 'warning');
        return;
      }

      // ✅ NEW: Check if TikTok files still exist before downloading
      if (content?.generatedVideos && contentType === 'tiktok_script') {
        // Check if files still exist in the generated folder
        const fileChecks = await Promise.all(
          Object.values(content.generatedVideos).map(async (imageUrl: any) => {
            if (typeof imageUrl === 'string' && imageUrl.startsWith('/generated/')) {
              try {
                const response = await fetch(imageUrl, { method: 'HEAD' });
                return response.ok;
              } catch {
                return false;
              }
            }
            return true; // For base64 images
          })
        );

        const filesExist = fileChecks.every(exists => exists);
        if (!filesExist) {
          showToast('TikTok scene files have expired. Please regenerate the content to download.', 'error');
          setIsDownloading(false);
          return;
        }
      }

      // ✅ NEW: Check for infographic designs
      if (content?.generatedDesigns && contentType === 'infographic_data') {
        // For infographics, we download design specs and templates
        const response = await fetch('/api/repurpose/download-infographic-designs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: 'infographic_data',
            infographic: content?.structured_data?.infographic || content?.infographic,
            dataPoints: content?.structured_data?.infographic?.data_points || [],
            designs: generatedImages
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'infographic_design_package.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        showToast('Infographic design package downloaded successfully!', 'success');
        return;
      }

      // ✅ Existing logic for other content types
      const response = await fetch('/api/repurpose/download-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: contentType,
          stories: contentType === 'instagram_story' ? (content?.structured_data?.story_sequence || content?.stories) : undefined,
          slides: contentType === 'linkedin_carousel' ? (content?.structured_data?.slides || content?.slides) : undefined,
          scenes: contentType === 'tiktok_script' ? (content?.structured_data?.scenes || content?.scenes || []) : undefined,
          images: generatedImages
        }),
      });

      // ✅ Handle expired TikTok files
      if (!response.ok) {
        if (response.status === 410) {
          const errorData = await response.json();
          if (errorData.needsRegenerate) {
            showToast(errorData.error, 'error');
            return;
          }
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}_${contentType === 'tiktok_script' ? 'scenes' : 'images'}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      showToast(`${contentType === 'tiktok_script' ? 'Scene frames' : contentType === 'infographic_data' ? 'Design files' : 'Images'} downloaded successfully!`, 'success');
    } catch (error: any) {
      showToast(`Error downloading content: ${error.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ NEW: Export for multiple platforms
  const exportForPlatforms = async () => {
    setIsDownloading(true);
    
    try {
      const generatedImages = content?.generatedImages || content?.generatedSlides || content?.generatedVideos || {};
      
      if (Object.keys(generatedImages).length === 0) {
        showToast('No generated content found. Generate content first!', 'warning');
        return;
      }

      // ✅ Apply same compression logic for export
      let processedImages = generatedImages;
      if (contentType === 'tiktok_script') {
        processedImages = {};
        
        showToast('Compressing images for export...', 'info');
        
        for (const [key, imageData] of Object.entries(generatedImages)) {
          if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            // ✅ Moderate compression for better quality in exports
            let compressedImage = imageData;
            
            if (imageData.length > 500000) { // ~375KB threshold
              compressedImage = await compressImageData(imageData, 0.8); // Higher quality for exports
            }
            
            processedImages[key] = compressedImage;
          } else {
            processedImages[key] = imageData;
          }
        }
        
        // ✅ Check total size and batch if needed
        const totalSize = JSON.stringify({
          contentType: contentType,
          scenes: content?.structured_data?.scenes || content?.scenes || [],
          images: processedImages,
          exportFormats: ['canva_templates', 'buffer_ready', 'later_scheduler', 'hootsuite_format', 'raw_images']
        }).length;
        
        if (totalSize > 10000000) { // ~10MB limit for exports
          showToast('Content is large, using simpler export...', 'info');
          
          // ✅ Fallback: Export only essential formats
          return await exportForPlatformsSimple(processedImages);
        }
      }

      const response = await fetch('/api/repurpose/export-platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: contentType,
          stories: contentType === 'instagram_story' ? (content?.structured_data?.story_sequence || content?.stories) : undefined,
          slides: contentType === 'linkedin_carousel' ? (content?.structured_data?.slides || content?.slides) : undefined,
          scenes: contentType === 'tiktok_script' ? (content?.structured_data?.scenes || content?.scenes || []) : undefined,
          images: processedImages,
          exportFormats: [
            'canva_templates',
            'buffer_ready', 
            'later_scheduler',
            'hootsuite_format',
            'raw_images'
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status}`);
      }

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
      showToast(`Error exporting: ${error.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ Add fallback simple export function:
  const exportForPlatformsSimple = async (images: any) => {
    try {
      showToast('Creating simplified export...', 'info');
      
      const response = await fetch('/api/repurpose/export-platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: contentType,
          scenes: content?.structured_data?.scenes || content?.scenes || [],
          images: images,
          exportFormats: ['raw_images', 'canva_templates'] // Only essential formats
        }),
      });

      if (!response.ok) throw new Error(`Simple export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}_essential_exports.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('Essential exports downloaded successfully!', 'success');
    } catch (error: any) {
      showToast(`Simple export failed: ${error.message}`, 'error');
    }
  };

  // Check if we have generated images
  const hasGeneratedImages = () => {
    return !!(content?.generatedImages || content?.generatedSlides || content?.generatedVideos || content?.generatedDesigns);
  };

  const hasGeneratedContent = () => {
    if (contentType === 'email_course') {
      const enhancedContent = content?.enhancedContent || {};
      const emailCourse = content?.structured_data?.email_course || content?.course || {};
      return Object.keys(enhancedContent).length > 0 || Object.keys(emailCourse).length > 0;
    }
    
    const generatedImages = content?.generatedImages || content?.generatedSlides || content?.generatedVideos || {};
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

      {/* TikTok-specific Actions */}
      {contentType === 'tiktok_script' && (
        <div className="border-t border-gray-200 pt-3">
          <h5 className="font-medium text-gray-700 mb-2 text-sm">🎬 TikTok Content</h5>
          
          {hasGeneratedImages() ? (
            <div className="space-y-2">
              <button
                onClick={downloadGeneratedImages}
                disabled={isDownloading}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎬</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {isDownloading ? 'Downloading...' : 'Download Scene Frames'}
                    </div>
                    <div className="text-xs text-gray-600">
                      High-resolution 1080x1920 scene images
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
                  <span className="text-lg">📱</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {isDownloading ? 'Exporting...' : 'Export for Video Editing'}
                    </div>
                    <div className="text-xs text-gray-600">
                      CapCut, InShot, Adobe Premiere formats
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
                Generate scene frames first to unlock export options
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content-specific Actions */}
      {contentType === 'blog_outline' && (
        <div className="border-t border-gray-200 pt-3">
          <h5 className="font-medium text-gray-700 mb-2 text-sm">📝 Blog Content</h5>
          
          <div className="space-y-2">
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

            {content?.generatedContent && Object.keys(content.generatedContent).length > 0 && (
              <button
                onClick={() => {
                  // Download enhanced content
                  const enhancedContent = JSON.stringify(content.generatedContent, null, 2);
                  const blob = new Blob([enhancedContent], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `enhanced_blog_content_${Date.now()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  showToast('Enhanced content downloaded!', 'success');
                }}
                className="w-full p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-300 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  <div>
                    <div className="font-medium text-blue-900">Download Enhanced Content</div>
                    <div className="text-xs text-blue-700">WordPress, social snippets, SEO data</div>
                  </div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                // Generate SEO report
                const outline = content?.structured_data?.blog_outline || content?.outline || {};
                const seoData = content?.seo_optimization || content?.seo || {};
                const textContent = extractTextContent();
                
                const seoReport = `SEO ANALYSIS REPORT
Blog: ${outline.title || 'Untitled'}
Generated: ${new Date().toLocaleDateString()}

OVERVIEW:
• Word Count: ${textContent.split(/\s+/).length}
• Reading Time: ${Math.ceil(textContent.split(/\s+/).length / 200)} minutes
• SEO Score: ${seoData.score || 95}/100
• Sections: ${outline.sections?.length || 0}

KEYWORDS:
${(seoData.primary_keywords || ['content', 'guide']).map((kw: string, i: number) => 
  `• ${kw} (${i === 0 ? 'Primary' : 'Secondary'})`
).join('\n')}

META DATA:
• Title: ${outline.title || 'N/A'} (${(outline.title || '').length}/60 chars)
• Description: ${seoData.meta_description || 'N/A'} (${(seoData.meta_description || '').length}/160 chars)

RECOMMENDATIONS:
• Add internal links to related content
• Include relevant images with alt text
• Optimize for featured snippets
• Add schema markup for better SERP display`;

                const blob = new Blob([seoReport], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `seo_report_${Date.now()}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('SEO report downloaded!', 'success');
              }}
              className="w-full p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <div>
                  <div className="font-medium text-purple-900">SEO Analysis Report</div>
                  <div className="text-xs text-purple-700">Detailed optimization insights</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Email Course Actions */}
      {contentType === 'email_course' && (
        <div className="space-y-2">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
          >
            📋 Copy Email Sequence
          </button>
          
          <button
            onClick={downloadAsFile}
            className="w-full flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            📧 Download Email Course
          </button>

          {hasGeneratedContent() && (
            <button
              onClick={downloadGeneratedImages}
              disabled={isDownloading}
              className="w-full flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
            >
              {isDownloading ? '⏳ Downloading...' : '📦 Download Templates'}
            </button>
          )}
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
