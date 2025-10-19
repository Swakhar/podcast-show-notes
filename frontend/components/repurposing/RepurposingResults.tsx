import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { RepurposingSectionMode } from './types';
import LinkedInCarouselPreview from './previews/LinkedInCarouselPreview';
import TwitterThreadPreview from './previews/TwitterThreadPreview';
import InstagramStoryPreview from './previews/InstagramStoryPreview';
import TikTokScriptPreview from './previews/TikTokScriptPreview';
import BlogOutlinePreview from './previews/BlogOutlinePreview';
import EmailCoursePreview from './previews/EmailCoursePreview';
import InfographicDataPreview from './previews/InfographicDataPreview';

interface RepurposingResultsProps {
  results: Record<string, any>;
  jobId: string;
  mode: RepurposingSectionMode;
}

export function RepurposingResults({ results, jobId, mode }: RepurposingResultsProps) {
  const { t } = useTranslation('common');
  const [activeContentType, setActiveContentType] = useState<string | null>(
    Object.keys(results)[0] || null
  );

  // Use translation for content type info
  const CONTENT_TYPE_INFO = {
    linkedin_carousel: { 
      label: t('repurposingResults.contentTypes.linkedinCarousel'), 
      icon: '📊', 
      color: 'blue' 
    },
    twitter_thread: { 
      label: t('repurposingResults.contentTypes.twitterThread'), 
      icon: '🧵', 
      color: 'blue' 
    },
    instagram_story: { 
      label: t('repurposingResults.contentTypes.instagramStory'), 
      icon: '📱', 
      color: 'pink' 
    },
    tiktok_script: { 
      label: t('repurposingResults.contentTypes.tiktokScript'), 
      icon: '🎬', 
      color: 'red' 
    },
    blog_outline: { 
      label: t('repurposingResults.contentTypes.blogOutline'), 
      icon: '📝', 
      color: 'green' 
    },
    email_course: { 
      label: t('repurposingResults.contentTypes.emailCourse'), 
      icon: '📧', 
      color: 'orange' 
    },
    infographic_data: { 
      label: t('repurposingResults.contentTypes.infographicData'), 
      icon: '📈', 
      color: 'purple' 
    },
  };

  const contentTypes = Object.keys(results).filter(key => results[key]);

  if (contentTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('repurposingResults.noContent.title')}</h3>
        <p className="text-gray-600">{t('repurposingResults.noContent.description')}</p>
      </div>
    );
  }

  const renderPreview = (contentType: string, data: any) => {
    switch (contentType) {
      case 'linkedin_carousel':
        return <LinkedInCarouselPreview data={data} />;
      case 'twitter_thread':
        return <TwitterThreadPreview data={data} />;
      case 'instagram_story':
        return <InstagramStoryPreview data={data} />;
      case 'tiktok_script':
        return <TikTokScriptPreview data={data} />;
      case 'blog_outline':
        return <BlogOutlinePreview data={data} />;
      case 'email_course':
        return <EmailCoursePreview data={data} />;
      case 'infographic_data':
        return <InfographicDataPreview data={data} />;
      default:
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600">{t('repurposingResults.previewNotAvailable', { contentType })}</p>
            <pre className="mt-4 text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
          </div>
        );
    }
  };

  const getContainerClasses = () => {
    switch (mode) {
      case 'sidebar':
        return 'space-y-4';
      case 'inline':
        return 'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden';
      case 'standalone':
        return 'max-w-7xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden';
      default:
        return 'space-y-4';
    }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Content Type Tabs */}
      {contentTypes.length > 1 && (
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {contentTypes.map((contentType) => {
              const info = CONTENT_TYPE_INFO[contentType as keyof typeof CONTENT_TYPE_INFO];
              if (!info) return null;
              
              return (
                <button
                  key={contentType}
                  onClick={() => setActiveContentType(contentType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeContentType === contentType
                      ? `bg-${info.color}-100 text-${info.color}-800 ring-2 ring-${info.color}-200`
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span className="text-sm">{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Content Preview */}
      {activeContentType && results[activeContentType] && (
        <div className={mode === 'sidebar' ? '' : 'min-h-[500px]'}>
          {renderPreview(activeContentType, results[activeContentType])}
        </div>
      )}

      {/* Summary Footer for Multiple Content Types */}
      {contentTypes.length > 1 && mode !== 'sidebar' && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('repurposingResults.summary.generated', { count: contentTypes.length })}
              </p>
              <p className="text-xs text-gray-600">
                {t('repurposingResults.summary.estimatedReach', { reach: contentTypes.length * 2500 })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {contentTypes.map((contentType) => {
                const info = CONTENT_TYPE_INFO[contentType as keyof typeof CONTENT_TYPE_INFO];
                return info ? (
                  <span key={contentType} className="text-lg" title={info.label}>
                    {info.icon}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
