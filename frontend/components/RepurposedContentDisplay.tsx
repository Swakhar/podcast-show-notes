import React from 'react';
import { useTranslation } from 'next-i18next';
import RepurposingResults from './RepurposingResults';

interface RepurposedContent {
  linkedin_carousel?: any;
  twitter_thread?: any;
  instagram_story?: any;
  tiktok_script?: any;
  blog_outline?: any;
  email_course?: any;
  infographic_data?: any;
  [key: string]: any;
}

interface RepurposedContentDisplayProps {
  content: RepurposedContent;
}

export default function RepurposedContentDisplay({ content }: RepurposedContentDisplayProps) {
  const { t } = useTranslation('common');

  if (!content || Object.keys(content).length === 0) {
    return null;
  }

  // Use the professional RepurposingResults component we created earlier
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <h2 className="text-xl font-semibold text-gray-900">🔄 Repurposed Content</h2>
        <p className="text-gray-600 text-sm mt-1">Content adapted for different platforms and audiences</p>
      </div>
      
      <div className="p-0">
        {/* Use the professional RepurposingResults component */}
        <RepurposingResults results={content} jobId="current" />
      </div>
    </div>
  );
}
