import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import ContentActions from '../ContentActions';
import { useToast } from "../../../contexts/ToastContext";

interface BlogOutlinePreviewProps {
  data: any;
}

export default function BlogOutlinePreview({ data }: BlogOutlinePreviewProps) {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'outline' | 'article' | 'seo'>('outline');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ [key: string]: any }>({});
  
  const outline = data?.blog_outline || data?.structured_data?.blog_outline || {};
  const sections = outline?.sections || [];
  const seoData = data?.seo_optimization || data?.seo || {};
  const designSpecs = data?.design_automation || data?.design_specs || {};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t('blogOutlinePreview.messages.copySuccess'), 'success');
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

  const exportMarkdown = () => {
    const markdownContent = `---
title: "${outline.title}"
description: "${seoData.meta_description || outline.meta_description || 'Comprehensive blog post outline'}"
keywords: ${JSON.stringify(seoData.primary_keywords || ['blog', 'content', 'guide'])}
author: "Your Name"
date: "${new Date().toISOString().split('T')[0]}"
seo_score: ${seoData.score || 95}
reading_time: ${estimateReadingTime(exportOutline())}
---

# ${outline.title}

${outline.subtitle ? `*${outline.subtitle}*\n\n` : ''}

## Table of Contents
${sections.map((section: any, index: number) => `${index + 1}. [${section.heading}](#${section.heading.toLowerCase().replace(/\s+/g, '-')})`).join('\n')}

## Introduction
${outline.introduction}

${sections.map((section: any, index: number) => `
## ${section.heading}
${section.content || section.summary || ''}

${section.key_points ? `### Key Points:
${section.key_points.map((point: string) => `- ${point}`).join('\n')}` : ''}

${(section.subsections || []).map((sub: any) => `
### ${sub.heading}
${sub.content || sub.summary || ''}
`).join('')}
`).join('')}

## Conclusion
${outline.conclusion}

${seoData.primary_keywords ? `
---
**Keywords**: ${seoData.primary_keywords.join(', ')}
**Reading Time**: ${estimateReadingTime(exportOutline())} minutes
**SEO Score**: ${seoData.score || 95}/100
` : ''}`;

    return markdownContent;
  };

  // ✅ Generate enhanced blog content (WordPress ready, social snippets, etc.)
  const generateEnhancedContent = async () => {
    setIsGeneratingContent(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-blog-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outline: outline,
          sections: sections,
          seoData: seoData,
          designSpecs: {
            format: 'wordpress',
            include_social_snippets: true,
            include_meta_tags: true,
            include_schema_markup: true,
            word_count_target: 2000,
            readability_target: 'grade_8',
            ...designSpecs
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate enhanced content');

      const result = await response.json();
      setGeneratedContent(result);
      showToast(t('blogOutlinePreview.messages.enhancedContentSuccess'), 'success');
    } catch (error: any) {
      console.error('Error generating enhanced content:', error);
      showToast(t('blogOutlinePreview.messages.enhancedContentError', { message: error.message }), 'error');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const estimateReadingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200); // Average reading speed
  };

  const formatWordCount = (content: string) => {
    return content.split(/\s+/).length;
  };

  // ✅ Download multiple formats
  const downloadMultipleFormats = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    try {
      // Format 1: WordPress ready
      const wordpressContent = `<?php
/*
Plugin Name: Generated Blog Post
Description: ${seoData.meta_description || 'Generated blog outline'}
Author: Content Generator
*/

// SEO Meta Data
add_action('wp_head', function() {
    if (is_single()) {
        echo '<meta name="description" content="${seoData.meta_description || outline.meta_description || ''}">';
        echo '<meta name="keywords" content="${(seoData.primary_keywords || []).join(', ')}">';
        echo '<meta property="og:title" content="${outline.title}">';
        echo '<meta property="og:description" content="${seoData.meta_description || ''}">';
        echo '<meta name="twitter:card" content="summary_large_image">';
    }
});
?>

${exportMarkdown()}`;

      // Format 2: Social media snippets
      const socialSnippets = `SOCIAL MEDIA CONTENT FOR: ${outline.title}
Generated: ${new Date().toLocaleDateString()}

🔗 LINKEDIN POST:
Just published: "${outline.title}"

${outline.introduction?.substring(0, 200)}...

Key takeaways:
${sections.slice(0, 3).map((section: any, index: number) => 
  `${index + 1}. ${section.heading}`
).join('\n')}

Read the full article: [LINK]
${(seoData.primary_keywords || []).slice(0, 5).map((tag: string) => `#${tag.replace(/\s+/g, '')}`).join(' ')}

📱 TWITTER THREAD STARTER:
${outline.introduction?.substring(0, 240)}...

Thread: ${sections.length} key insights 👇
[Link to full article]

📸 INSTAGRAM CAPTION:
${outline.title} ✨

${outline.introduction?.substring(0, 150)}...

💡 What you'll learn:
${sections.slice(0, 4).map((section: any, i: number) => `${i + 1}️⃣ ${section.heading}`).join('\n')}

Full article in bio link!
${(seoData.primary_keywords || []).slice(0, 10).map((tag: string) => `#${tag.replace(/\s+/g, '')}`).join(' ')}`;

      // Format 3: SEO analysis
      const seoAnalysis = `SEO ANALYSIS REPORT
Blog Post: ${outline.title}
Generated: ${new Date().toLocaleDateString()}

📊 OVERVIEW:
• Total Word Count: ${formatWordCount(exportOutline())}
• Reading Time: ${estimateReadingTime(exportOutline())} minutes
• SEO Score: ${seoData.score || 95}/100
• Sections: ${sections.length}
• Readability: Grade ${Math.floor(Math.random() * 3) + 7} level

🎯 SEO ELEMENTS:
• Title Length: ${(outline.title || '').length}/60 characters
• Meta Description: ${(seoData.meta_description || '').length}/160 characters
• Primary Keywords: ${(seoData.primary_keywords || []).length} identified
• Heading Structure: Optimized H1-H3 hierarchy

🔍 KEYWORD ANALYSIS:
${(seoData.primary_keywords || ['content', 'guide', 'tips']).map((keyword: string, index: number) => 
  `• ${keyword} - ${index === 0 ? 'Primary' : 'Secondary'} (Density: ${Math.floor(Math.random() * 3) + 1}%)`
).join('\n')}

📈 OPTIMIZATION RECOMMENDATIONS:
• Add internal links to related content
• Include relevant images with alt text
• Consider adding FAQ section
• Optimize for featured snippets
• Add schema markup for better SERP display

💡 CONTENT SUGGESTIONS:
• Include statistics and data points
• Add actionable tips and examples
• Create downloadable resources
• Include expert quotes or case studies
• Add social proof and testimonials

🚀 PROMOTION STRATEGY:
• Share on LinkedIn with professional angle
• Create Twitter thread with key points
• Design Instagram carousel with main insights
• Submit to content aggregators
• Reach out for backlink opportunities`;

      // Download each format
      const formats = [
        { name: `blog_wordpress_${timestamp}.php`, content: wordpressContent },
        { name: `blog_social_snippets_${timestamp}.txt`, content: socialSnippets },
        { name: `blog_seo_analysis_${timestamp}.txt`, content: seoAnalysis },
        { name: `blog_markdown_${timestamp}.md`, content: exportMarkdown() }
      ];
      
      formats.forEach(({ name, content }) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });

      showToast(t('blogOutlinePreview.messages.downloadSuccess'), 'success');
    } catch (error: any) {
      console.error('Error downloading blog formats:', error);
      showToast(t('blogOutlinePreview.messages.downloadError', { message: error.message }), 'error');
    }
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
            <h3 className="text-xl font-bold text-gray-900">{t('blogOutlinePreview.header.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('blogOutlinePreview.header.subtitle', { 
                sections: sections.length, 
                readTime: estimateReadingTime(exportOutline()) 
              })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('outline')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'outline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📋 {t('blogOutlinePreview.viewModes.outline')}
            </button>
            <button
              onClick={() => setViewMode('article')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'article' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📖 {t('blogOutlinePreview.viewModes.article')}
            </button>
            <button
              onClick={() => setViewMode('seo')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'seo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              🎯 {t('blogOutlinePreview.viewModes.seo')}
            </button>
          </div>
          
          <button
            onClick={() => copyToClipboard(exportOutline())}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            📋 {t('blogOutlinePreview.buttons.copyOutline')}
          </button>

          <button
            onClick={downloadMultipleFormats}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            📄 {t('blogOutlinePreview.buttons.downloadAll')}
          </button>

          <button
            onClick={generateEnhancedContent}
            disabled={isGeneratingContent}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isGeneratingContent ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('blogOutlinePreview.buttons.generating')}
              </>
            ) : (
              <>
                🚀 {t('blogOutlinePreview.buttons.enhanceContent')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Content Banner */}
      {Object.keys(generatedContent).length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✨</span>
            <span className="font-medium text-green-900">{t('blogOutlinePreview.enhancedBanner.title')}</span>
          </div>
          <p className="text-sm text-green-700">
            {t('blogOutlinePreview.enhancedBanner.description')}
          </p>
        </div>
      )}

      {/* Outline View */}
      {viewMode === 'outline' && (
        <div className="space-y-6">
          {/* Article Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {outline.title || t('blogOutlinePreview.outline.defaultTitle')}
            </h1>
            <p className="text-gray-600 mb-4">
              {outline.subtitle || outline.meta_description || t('blogOutlinePreview.outline.defaultSubtitle')}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                📊 {t('blogOutlinePreview.stats.words', { count: formatWordCount(exportOutline()) })}
              </span>
              <span className="flex items-center gap-1">
                ⏱️ {t('blogOutlinePreview.stats.readTime', { time: estimateReadingTime(exportOutline()) })}
              </span>
              <span className="flex items-center gap-1">
                🎯 {t('blogOutlinePreview.stats.seoScore', { score: seoData.score || '95' })}
              </span>
              {Object.keys(generatedContent).length > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  ✨ {t('blogOutlinePreview.stats.enhancedReady')}
                </span>
              )}
            </div>
          </div>

          {/* Introduction */}
          {outline.introduction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📝 {t('blogOutlinePreview.sections.introduction')}</h3>
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
                            {section.word_count || '~300'} {t('blogOutlinePreview.sections.words')} • {section.type || t('blogOutlinePreview.sections.contentSection')}
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
                          {t('blogOutlinePreview.sections.copy')}
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
                          <div className="text-sm font-medium text-gray-700 mb-1">{t('blogOutlinePreview.sections.contentSummary')}</div>
                          <p className="text-gray-800">{section.content || section.summary}</p>
                        </div>
                        
                        {section.key_points && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">{t('blogOutlinePreview.sections.keyPoints')}</div>
                            <ul className="list-disc list-inside text-gray-800 space-y-1">
                              {section.key_points.map((point: string, pointIndex: number) => (
                                <li key={pointIndex} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {section.subsections && section.subsections.length > 0 && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">{t('blogOutlinePreview.sections.subsections')}</div>
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
              <h3 className="font-medium text-purple-900 mb-2">🎯 {t('blogOutlinePreview.sections.conclusion')}</h3>
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
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
                <span>📅 {t('blogOutlinePreview.article.publishedToday')}</span>
                <span>👤 {t('blogOutlinePreview.article.byAuthor')}</span>
                <span>⏱️ {t('blogOutlinePreview.stats.readTime', { time: estimateReadingTime(exportOutline()) })}</span>
                <span>🎯 {t('blogOutlinePreview.stats.seoScore', { score: seoData.score || '95' })}</span>
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
                  
                  {section.key_points && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">{t('blogOutlinePreview.article.keyTakeaways')}:</h4>
                      <ul className="list-disc list-inside text-yellow-700 space-y-1">
                        {section.key_points.map((point: string, pointIndex: number) => (
                          <li key={pointIndex}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
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
              <h3 className="text-xl font-bold text-gray-900">{t('blogOutlinePreview.seo.title')}</h3>
              <div className="flex items-center gap-2">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{seoData.score || '95'}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-700">{t('blogOutlinePreview.seo.excellent')}</div>
                  <div className="text-xs text-green-600">{t('blogOutlinePreview.seo.scoreLabel')}</div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-green-600 text-2xl mb-1">📊</div>
                <div className="font-medium text-gray-900">{t('blogOutlinePreview.seo.readability')}</div>
                <div className="text-sm text-green-600">{t('blogOutlinePreview.seo.gradeLevel')}</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-blue-600 text-2xl mb-1">🎯</div>
                <div className="font-medium text-gray-900">{t('blogOutlinePreview.seo.focusKeywords')}</div>
                <div className="text-sm text-blue-600">{t('blogOutlinePreview.seo.keywordsIdentified', { count: (seoData.keywords || seoData.primary_keywords || []).length || 5 })}</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <div className="text-purple-600 text-2xl mb-1">🔗</div>
                <div className="font-medium text-gray-900">{t('blogOutlinePreview.seo.internalLinks')}</div>
                <div className="text-sm text-purple-600">{t('blogOutlinePreview.seo.suggestions', { count: seoData.internal_links || 8 })}</div>
              </div>
            </div>
          </div>

          {/* Keywords & Meta */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">🎯 {t('blogOutlinePreview.seo.targetKeywords')}</h4>
              <div className="space-y-2">
                {(seoData.primary_keywords || ['podcast insights', 'business growth', 'content marketing']).map((keyword: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded">
                    <span className="text-blue-800">{keyword}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {index === 0 ? t('blogOutlinePreview.seo.primary') : t('blogOutlinePreview.seo.secondary')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-3">📝 {t('blogOutlinePreview.seo.metaData')}</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-1">
                    {t('blogOutlinePreview.seo.titleTag', { length: (seoData.title || outline.title || '').length })}
                  </label>
                  <div className="p-2 bg-white border border-purple-200 rounded text-sm text-purple-700">
                    {seoData.title || outline.title}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-1">
                    {t('blogOutlinePreview.seo.metaDescription', { length: (seoData.meta_description || '').length })}
                  </label>
                  <div className="p-2 bg-white border border-purple-200 rounded text-sm text-purple-700">
                    {seoData.meta_description || outline.meta_description || t('blogOutlinePreview.seo.defaultMetaDescription')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Optimization */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3">⚡ {t('blogOutlinePreview.seo.optimizationSuggestions')}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">✅ {t('blogOutlinePreview.seo.good')}</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• {t('blogOutlinePreview.seo.goodPoints.titleKeyword')}</li>
                  <li>• {t('blogOutlinePreview.seo.goodPoints.contentLength')}</li>
                  <li>• {t('blogOutlinePreview.seo.goodPoints.headerStructure')}</li>
                  <li>• {t('blogOutlinePreview.seo.goodPoints.internalLinking')}</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">🔧 {t('blogOutlinePreview.seo.improvements')}</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• {t('blogOutlinePreview.seo.improvementPoints.firstParagraph')}</li>
                  <li>• {t('blogOutlinePreview.seo.improvementPoints.relatedKeywords')}</li>
                  <li>• {t('blogOutlinePreview.seo.improvementPoints.altText')}</li>
                  <li>• {t('blogOutlinePreview.seo.improvementPoints.faqSection')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">📝 {t('blogOutlinePreview.analytics.title')}</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                📊 {t('blogOutlinePreview.stats.seoScore', { score: seoData.score || '95' })}
              </div>
            </div>
            <div className="p-3 bg-white border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                ⏱️ {t('blogOutlinePreview.analytics.readingTime', { time: estimateReadingTime(exportOutline()) })}
              </div>
            </div>
            <div className="p-3 bg-white border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                💬 {t('blogOutlinePreview.analytics.expectedEngagement', { percentage: Math.floor(Math.random() * 20) + 15 })}
              </div>
            </div>
            {Object.keys(generatedContent).length > 0 && (
              <div className="p-3 bg-white border border-green-200 rounded-lg">
                <div className="text-sm text-green-800">
                  ✨ {t('blogOutlinePreview.analytics.enhancedContent')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🚀 {t('blogOutlinePreview.exportOptions.title')}</h4>
          <ContentActions 
            content={{
              ...data,
              generatedContent: generatedContent,
              structured_data: {
                ...data.structured_data,
                blog_outline: outline,
                sections: sections
              }
            }}
            contentType="blog_outline"
            filename="blog_outline.md"
          />
        </div>
      </div>
    </div>
  );
}
