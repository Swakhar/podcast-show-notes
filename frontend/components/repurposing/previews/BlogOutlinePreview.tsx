import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContentActions from '../ContentActions';

interface BlogOutlinePreviewProps {
  data: any;
}

export default function BlogOutlinePreview({ data }: BlogOutlinePreviewProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'outline' | 'article' | 'seo'>('outline');
  
  const outline = data?.structured_data?.blog_outline || data?.outline || {};
  const sections = outline?.sections || [];
  const seoData = data?.seo_optimization || data?.seo || {};
  const designSpecs = data?.design_automation || data?.design_specs || {};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportOutline = () => {
    const fullOutline = `# ${outline.title}\n\n## Introduction\n${outline.introduction}\n\n` +
      sections.map((section: any, index: number) => 
        `## ${section.heading}\n${section.content || section.summary || ''}\n\n` +
        (section.subsections || []).map((sub: any) => `### ${sub.heading}\n${sub.content || ''}`).join('\n\n')
      ).join('\n\n') +
      `\n\n## Conclusion\n${outline.conclusion}`;
    return fullOutline;
  };

  const estimateReadingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200); // Average reading speed
  };

  const formatWordCount = (content: string) => {
    return content.split(/\s+/).length;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">📝</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Blog Outline</h3>
            <p className="text-sm text-gray-600">
              {sections.length} sections • {estimateReadingTime(exportOutline())} min read • SEO optimized
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('outline')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'outline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📋 Outline
            </button>
            <button
              onClick={() => setViewMode('article')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'article' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📖 Article Preview
            </button>
            <button
              onClick={() => setViewMode('seo')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'seo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              🎯 SEO
            </button>
          </div>
          
          <button
            onClick={() => copyToClipboard(exportOutline())}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            📋 Copy Outline
          </button>
        </div>
      </div>

      {/* Outline View */}
      {viewMode === 'outline' && (
        <div className="space-y-6">
          {/* Article Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {outline.title || 'Blog Post Title'}
            </h1>
            <p className="text-gray-600 mb-4">
              {outline.subtitle || outline.meta_description || 'Engaging subtitle that draws readers in'}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                📊 {formatWordCount(exportOutline())} words
              </span>
              <span className="flex items-center gap-1">
                ⏱️ {estimateReadingTime(exportOutline())} min read
              </span>
              <span className="flex items-center gap-1">
                🎯 SEO Score: {seoData.score || '95'}/100
              </span>
            </div>
          </div>

          {/* Introduction */}
          {outline.introduction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📝 Introduction</h3>
              <p className="text-blue-800">{outline.introduction}</p>
            </div>
          )}

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section: any, index: number) => {
              const isExpanded = expandedSection === index;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedSection(isExpanded ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-green-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{section.heading}</h4>
                          <p className="text-sm text-gray-600">
                            {section.word_count || '~300'} words • {section.type || 'Content Section'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(section.content || section.summary || '');
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                        >
                          Copy
                        </button>
                        <span className="text-gray-400">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 p-4 bg-gray-50"
                    >
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Content Summary</div>
                          <p className="text-gray-800">{section.content || section.summary}</p>
                        </div>
                        
                        {section.key_points && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Key Points to Cover</div>
                            <ul className="list-disc list-inside text-gray-800 space-y-1">
                              {section.key_points.map((point: string, pointIndex: number) => (
                                <li key={pointIndex} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.subsections && section.subsections.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Subsections</div>
                            <div className="space-y-2">
                              {section.subsections.map((subsection: any, subIndex: number) => (
                                <div key={subIndex} className="p-3 bg-white border border-gray-200 rounded-lg">
                                  <h5 className="font-medium text-gray-900 mb-1">{subsection.heading}</h5>
                                  <p className="text-sm text-gray-700">{subsection.content || subsection.summary}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Conclusion */}
          {outline.conclusion && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">🎯 Conclusion</h3>
              <p className="text-purple-800">{outline.conclusion}</p>
            </div>
          )}
        </div>
      )}

      {/* Article Preview */}
      {viewMode === 'article' && (
        <div className="max-w-4xl mx-auto">
          <article className="bg-white border border-gray-200 rounded-lg p-8 prose prose-lg max-w-none">
            <header className="mb-8 text-center border-b border-gray-200 pb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {outline.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {outline.subtitle || outline.meta_description}
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span>📅 Published today</span>
                <span>👤 By Your Name</span>
                <span>⏱️ {estimateReadingTime(exportOutline())} min read</span>
              </div>
            </header>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-800 italic">{outline.introduction}</p>
              </div>
              
              {sections.map((section: any, index: number) => (
                <section key={index} className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                    {section.heading}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content || section.summary}
                  </p>
                  
                  {section.subsections && section.subsections.map((sub: any, subIndex: number) => (
                    <div key={subIndex} className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {sub.heading}
                      </h3>
                      <p className="text-gray-700">{sub.content}</p>
                    </div>
                  ))}
                </section>
              ))}
              
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-800 font-medium">{outline.conclusion}</p>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* SEO View */}
      {viewMode === 'seo' && (
        <div className="space-y-6">
          {/* SEO Score Card */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">SEO Analysis</h3>
              <div className="flex items-center gap-2">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{seoData.score || '95'}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-700">Excellent</div>
                  <div className="text-xs text-green-600">SEO Score</div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-green-600 text-2xl mb-1">📊</div>
                <div className="font-medium text-gray-900">Readability</div>
                <div className="text-sm text-green-600">Grade 8 level</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-blue-600 text-2xl mb-1">🎯</div>
                <div className="font-medium text-gray-900">Focus Keywords</div>
                <div className="text-sm text-blue-600">{(seoData.keywords || []).length || 5} identified</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-purple-600 text-2xl mb-1">🔗</div>
                <div className="font-medium text-gray-900">Internal Links</div>
                <div className="text-sm text-purple-600">{seoData.internal_links || 8} suggestions</div>
              </div>
            </div>
          </div>

          {/* Keywords & Meta */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">🎯 Target Keywords</h4>
              <div className="space-y-2">
                {(seoData.primary_keywords || ['podcast insights', 'business growth', 'content marketing']).map((keyword: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded">
                    <span className="text-blue-800">{keyword}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {index === 0 ? 'Primary' : 'Secondary'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3">📝 Meta Data</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-1">Title Tag ({(seoData.title || outline.title || '').length}/60)</label>
                  <div className="p-2 bg-white border border-purple-200 rounded text-sm text-purple-700">
                    {seoData.title || outline.title}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-1">Meta Description ({(seoData.meta_description || '').length}/160)</label>
                  <div className="p-2 bg-white border border-purple-200 rounded text-sm text-purple-700">
                    {seoData.meta_description || outline.meta_description || 'Compelling meta description...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Optimization */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3">⚡ Optimization Suggestions</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">✅ Good</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Title contains focus keyword</li>
                  <li>• Good content length (2000+ words)</li>
                  <li>• Headers use semantic structure</li>
                  <li>• Internal linking opportunities identified</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">🔧 Improvements</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Add focus keyword to first paragraph</li>
                  <li>• Include 2-3 related keywords naturally</li>
                  <li>• Add alt text for images</li>
                  <li>• Consider adding FAQ section</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">📝 SEO Insights</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                📊 SEO Score: {seoData.score || '95'}/100
              </div>
            </div>
            <div className="p-3 bg-white border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                ⏱️ Reading time: {estimateReadingTime(exportOutline())} minutes
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🚀 Content Tools</h4>
          <ContentActions 
            content={data}
            contentType="blog_outline"
            filename="blog_outline.md"
          />
        </div>
      </div>
    </div>
  );
}
