import React from 'react';
import { motion } from 'framer-motion';
import { 
  LinkedInCarouselPreview,
  TwitterThreadPreview,
  InstagramStoryPreview,
  TikTokScriptPreview,
  BlogOutlinePreview,
  EmailCoursePreview,
  InfographicDataPreview 
} from './index';

interface ContentPreviewGridProps {
  results: Record<string, any>;
  jobId: string;
}

export default function ContentPreviewGrid({ results, jobId }: ContentPreviewGridProps) {
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
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(results).map(([contentType, data], index) => (
        <motion.div
          key={contentType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {renderPreview(contentType, data)}
        </motion.div>
      ))}
    </div>
  );
}
