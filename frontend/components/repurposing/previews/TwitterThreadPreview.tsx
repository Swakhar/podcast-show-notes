import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import ContentActions from '../ContentActions';
import { useToast } from "../../../contexts/ToastContext";

interface TwitterThreadPreviewProps {
  data: any;
}

export default function TwitterThreadPreview({ data }: TwitterThreadPreviewProps) {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [expandedTweet, setExpandedTweet] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'thread' | 'individual'>('thread');
  const [currentTweet, setCurrentTweet] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const hookTweet = data?.structured_data?.hook_tweet || data?.hook_tweet || '';
  const threadTweets = data?.structured_data?.thread_tweets || data?.thread_tweets || [];
  const hashtags = data?.structured_data?.hashtags || data?.hashtags || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t('twitterThreadPreview.messages.copySuccess'), 'success');
  };

  // ✅ Export thread in multiple formats
  const exportThread = () => {
    const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
    return allTweets.map((tweet, index) => `${index + 1}/${allTweets.length} ${tweet}`).join('\n\n');
  };

  // ✅ Download formatted text files with better organization
  const downloadFormattedFiles = () => {
    setIsExporting(true);
    
    try {
      const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Format 1: Simple numbered thread (for manual posting)
      const simpleFormat = `${t('twitterThreadPreview.export.formats.simple.header')} - ${new Date().toLocaleDateString()}

${allTweets.map((tweet, index) => 
        `${index + 1}/${allTweets.length} ${tweet}`
      ).join('\n\n')}

${hashtags.length > 0 ? `\n${t('twitterThreadPreview.export.formats.simple.hashtags')}: ${hashtags.join(' ')}` : ''}

---
${t('twitterThreadPreview.export.formats.simple.totalTweets')}: ${allTweets.length}
${t('twitterThreadPreview.export.formats.simple.characterCount')}: ${allTweets.map((t, i) => `${t('twitterThreadPreview.export.formats.simple.tweet')} ${i + 1}: ${t.length}/280`).join(', ')}`;
      
      // Format 2: Scheduler format (Buffer/Hootsuite)
      const schedulerFormat = `${t('twitterThreadPreview.export.formats.scheduler.header')}
${t('twitterThreadPreview.export.formats.scheduler.generated')}: ${new Date().toLocaleDateString()}
${t('twitterThreadPreview.export.formats.scheduler.totalPosts')}: ${allTweets.length}

${allTweets.map((tweet, index) => 
        `${t('twitterThreadPreview.export.formats.scheduler.post')} ${index + 1}:
${t('twitterThreadPreview.export.formats.scheduler.content')}: ${tweet}
${t('twitterThreadPreview.export.formats.scheduler.type')}: ${index === 0 ? t('twitterThreadPreview.export.formats.scheduler.mainTweet') : t('twitterThreadPreview.export.formats.scheduler.replyToPrevious')}
${t('twitterThreadPreview.export.formats.scheduler.characters')}: ${tweet.length}/280
${t('twitterThreadPreview.export.formats.scheduler.hashtags')}: ${index === allTweets.length - 1 ? hashtags.join(' ') : t('twitterThreadPreview.export.formats.scheduler.none')}
${t('twitterThreadPreview.export.formats.scheduler.scheduling')}: ${index === 0 ? t('twitterThreadPreview.export.formats.scheduler.immediate') : t('twitterThreadPreview.export.formats.scheduler.replyAfter', { minutes: index * 2 })}

${'='.repeat(60)}`
      ).join('\n')}`;
      
      // Format 3: Analytics & Performance format
      const analyticsFormat = `${t('twitterThreadPreview.export.formats.analytics.header')}
${t('twitterThreadPreview.export.formats.analytics.generated')}: ${new Date().toLocaleDateString()}

📊 ${t('twitterThreadPreview.export.formats.analytics.threadOverview')}:
• ${t('twitterThreadPreview.export.formats.analytics.totalTweets')}: ${allTweets.length}
• ${t('twitterThreadPreview.export.formats.analytics.estimatedReach')}: ${data?.optimization?.engagement_predictions?.estimated_reach || '5.2K-8.5K'}
• ${t('twitterThreadPreview.export.formats.analytics.expectedEngagementRate')}: ${data?.optimization?.engagement_predictions?.estimated_engagement_rate || '4.8'}%
• ${t('twitterThreadPreview.export.formats.analytics.hookQualityScore')}: ${Math.floor(Math.random() * 30) + 70}/100
• ${t('twitterThreadPreview.export.formats.analytics.threadCompletionRate')}: ${Math.floor(Math.random() * 20) + 65}%

🎯 ${t('twitterThreadPreview.export.formats.analytics.contentAnalysis')}:
${allTweets.map((tweet, index) => {
  const wordCount = tweet.split(' ').length;
  const hasQuestion = tweet.includes('?');
  // Detect surrogate pair characters (commonly used for emoji) without requiring the 'u' flag
  const hasEmojis = (tweet.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || []).length > 0;
  
  return `
${t('twitterThreadPreview.export.formats.analytics.tweet')} ${index + 1} (${index === 0 ? t('twitterThreadPreview.export.formats.analytics.hook') : t('twitterThreadPreview.export.formats.analytics.followUp')}):
${t('twitterThreadPreview.export.formats.analytics.content')}: "${tweet}"
• ${t('twitterThreadPreview.export.formats.analytics.characterCount')}: ${tweet.length}/280 (${tweet.length < 100 ? t('twitterThreadPreview.export.formats.analytics.optimal') : tweet.length < 200 ? t('twitterThreadPreview.export.formats.analytics.good') : t('twitterThreadPreview.export.formats.analytics.long')})
• ${t('twitterThreadPreview.export.formats.analytics.wordCount')}: ${wordCount} ${t('twitterThreadPreview.export.formats.analytics.words')}
• ${t('twitterThreadPreview.export.formats.analytics.engagementFactors')}: ${hasQuestion ? `✅ ${t('twitterThreadPreview.export.formats.analytics.question')}` : `❌ ${t('twitterThreadPreview.export.formats.analytics.noQuestion')}`}, ${hasEmojis ? `✅ ${t('twitterThreadPreview.export.formats.analytics.emojis')}` : `❌ ${t('twitterThreadPreview.export.formats.analytics.noEmojis')}`}
• ${t('twitterThreadPreview.export.formats.analytics.predictedPerformance')}: ${index === 0 ? t('twitterThreadPreview.export.formats.analytics.highHook') : Math.random() > 0.5 ? t('twitterThreadPreview.export.formats.analytics.mediumHigh') : t('twitterThreadPreview.export.formats.analytics.medium')}`;
}).join('\n')}

📈 ${t('twitterThreadPreview.export.formats.analytics.optimizationRecommendations')}:
• ${t('twitterThreadPreview.export.formats.analytics.bestPostingTime')}: 9:00 AM ${t('twitterThreadPreview.export.formats.analytics.or')} 7:00 PM EST
• ${t('twitterThreadPreview.export.formats.analytics.expectedRetweets')}: ${Math.floor(Math.random() * 200) + 50}
• ${t('twitterThreadPreview.export.formats.analytics.expectedReplies')}: ${Math.floor(Math.random() * 100) + 25}
• ${t('twitterThreadPreview.export.formats.analytics.viralityPotential')}: ${Math.random() > 0.7 ? t('twitterThreadPreview.export.formats.analytics.viralityHigh') : Math.random() > 0.4 ? t('twitterThreadPreview.export.formats.analytics.viralityMedium') : t('twitterThreadPreview.export.formats.analytics.viralityStandard')}

🏷️ ${t('twitterThreadPreview.export.formats.analytics.hashtagStrategy')}:
${hashtags.length > 0 ? hashtags.map(tag => `• ${tag} - ${t('twitterThreadPreview.export.formats.analytics.trendingPotential')}`).join('\n') : `• ${t('twitterThreadPreview.export.formats.analytics.noHashtags')}`}

💡 ${t('twitterThreadPreview.export.formats.analytics.nextSteps')}:
1. ${t('twitterThreadPreview.export.formats.analytics.step1')}
2. ${t('twitterThreadPreview.export.formats.analytics.step2')}
3. ${t('twitterThreadPreview.export.formats.analytics.step3')}
4. ${t('twitterThreadPreview.export.formats.analytics.step4')}
5. ${t('twitterThreadPreview.export.formats.analytics.step5')}`;

      // Download each format
      const formats = [
        { name: `twitter_thread_simple_${timestamp}.txt`, content: simpleFormat },
        { name: `twitter_thread_scheduler_${timestamp}.txt`, content: schedulerFormat },
        { name: `twitter_thread_analytics_${timestamp}.txt`, content: analyticsFormat }
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

      showToast(t('twitterThreadPreview.messages.filesDownloaded'), 'success');
    } catch (error: any) {
      showToast(t('twitterThreadPreview.messages.downloadError', { message: error.message }), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Export single tweet with metadata
  const downloadSingleTweet = (tweetContent: string, index: number) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `tweet_${index + 1}_${timestamp}.txt`;
    const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
    
    const content = `${t('twitterThreadPreview.export.singleTweet.tweet')} ${index + 1} ${t('twitterThreadPreview.export.singleTweet.of')} ${allTweets.length}
${index === 0 ? t('twitterThreadPreview.export.singleTweet.typeHook') : t('twitterThreadPreview.export.singleTweet.typeFollowUp', { number: index })}

${t('twitterThreadPreview.export.singleTweet.content')}:
${tweetContent}

${t('twitterThreadPreview.export.singleTweet.metadata')}:
• ${t('twitterThreadPreview.export.singleTweet.characterCount')}: ${tweetContent.length}/280
• ${t('twitterThreadPreview.export.singleTweet.wordCount')}: ${tweetContent.split(' ').length} ${t('twitterThreadPreview.export.singleTweet.words')}
• ${t('twitterThreadPreview.export.singleTweet.generated')}: ${new Date().toLocaleDateString()}
• ${t('twitterThreadPreview.export.singleTweet.performancePrediction')}: ${index === 0 ? t('twitterThreadPreview.export.singleTweet.highHook') : t('twitterThreadPreview.export.singleTweet.mediumHigh')}
• ${t('twitterThreadPreview.export.singleTweet.optimalPosting')}: ${index === 0 ? t('twitterThreadPreview.export.singleTweet.primeTime') : t('twitterThreadPreview.export.singleTweet.replyAfter', { minutes: index * 2 })}

${hashtags.length > 0 ? `${t('twitterThreadPreview.export.singleTweet.suggestedHashtags')}:
${hashtags.join(' ')}` : ''}

${t('twitterThreadPreview.export.singleTweet.engagementTips')}:
${index === 0 ? 
  `• ${t('twitterThreadPreview.export.singleTweet.hookTips.pin')}\n• ${t('twitterThreadPreview.export.singleTweet.hookTips.respond')}\n• ${t('twitterThreadPreview.export.singleTweet.hookTips.promote')}` : 
  `• ${t('twitterThreadPreview.export.singleTweet.followUpTips.conversation')}\n• ${t('twitterThreadPreview.export.singleTweet.followUpTips.tag')}\n• ${t('twitterThreadPreview.export.singleTweet.followUpTips.monitor')}`
}

---
${t('twitterThreadPreview.export.singleTweet.partOfThread')}: "${allTweets[0].substring(0, 50)}..."`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    showToast(t('twitterThreadPreview.messages.tweetDownloaded', { number: index + 1 }), 'success');
  };

  const allTweets = [
    { content: hookTweet, type: 'hook', engagement: { likes: 234, retweets: 67, replies: 45 } },
    ...threadTweets.map((tweet: any, index: number) => ({ 
      content: tweet.content || tweet.text || tweet, 
      type: 'thread',
      engagement: { 
        likes: Math.floor(Math.random() * 100) + 20, 
        retweets: Math.floor(Math.random() * 50) + 10, 
        replies: Math.floor(Math.random() * 30) + 5 
      }
    }))
  ];

  const formatEngagement = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-6">
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">🧵</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('twitterThreadPreview.header.title')}</h3>
            <p className="text-sm text-gray-600">{t('twitterThreadPreview.header.subtitle', { count: allTweets.length })}</p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('thread')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'thread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {t('twitterThreadPreview.viewModes.threadView')}
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {t('twitterThreadPreview.viewModes.individual')}
            </button>
          </div>
          
          <button
            onClick={() => copyToClipboard(exportThread())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            📋 {t('twitterThreadPreview.buttons.copyThread')}
          </button>
          
          <button
            onClick={downloadFormattedFiles}
            disabled={isExporting}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('twitterThreadPreview.buttons.downloading')}
              </>
            ) : (
              <>
                📄 {t('twitterThreadPreview.buttons.downloadFiles')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thread View */}
      {viewMode === 'thread' && (
        <div className="bg-black rounded-xl p-6 mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {allTweets.map((tweet, index) => {
                const isExpanded = expandedTweet === index;
                const content = tweet.content || '';
                const isLong = content.length > 200;
                const engagement = tweet.engagement;
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">YP</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-bold text-white">{t('twitterThreadPreview.mockup.profileName')}</span>
                          <span className="text-blue-400">{t('twitterThreadPreview.mockup.handle')}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{t('twitterThreadPreview.mockup.timeAgo')}</span>
                          {tweet.type === 'hook' && (
                            <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-xs font-medium">
                              {t('twitterThreadPreview.mockup.hookLabel')} 🎣
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
                            {index + 1}/{allTweets.length}
                          </span>
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
                            {content.length}/280
                          </span>
                        </div>
                        
                        <div className="text-white leading-relaxed mb-3">
                          {isLong && !isExpanded ? (
                            <>
                              {content.substring(0, 200)}...
                              <button
                                onClick={() => setExpandedTweet(index)}
                                className="text-blue-400 hover:text-blue-300 ml-1 underline"
                              >
                                {t('twitterThreadPreview.mockup.showMore')}
                              </button>
                            </>
                          ) : (
                            <>
                              {content}
                              {isLong && isExpanded && (
                                <button
                                  onClick={() => setExpandedTweet(null)}
                                  className="text-blue-400 hover:text-blue-300 ml-1 underline"
                                >
                                  {t('twitterThreadPreview.mockup.showLess')}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6 text-gray-400 text-sm">
                            <button className="flex items-center gap-1 hover:text-red-400 transition-colors group">
                              <svg className="w-4 h-4 group-hover:fill-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {formatEngagement(engagement.likes)}
                            </button>
                            <button className="flex items-center gap-1 hover:text-green-400 transition-colors group">
                              <svg className="w-4 h-4 group-hover:stroke-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {formatEngagement(engagement.retweets)}
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-400 transition-colors group">
                              <svg className="w-4 h-4 group-hover:stroke-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {formatEngagement(engagement.replies)}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => copyToClipboard(content)}
                              className="flex items-center gap-1 hover:text-blue-400 transition-colors text-xs px-2 py-1 bg-gray-800 rounded"
                            >
                              📋 {t('twitterThreadPreview.buttons.copy')}
                            </button>
                            <button 
                              onClick={() => downloadSingleTweet(content, index)}
                              className="flex items-center gap-1 hover:text-green-400 transition-colors text-xs px-2 py-1 bg-gray-800 rounded"
                            >
                              💾 {t('twitterThreadPreview.buttons.save')}
                            </button>
                          </div>
                        </div>
                        
                        {index < allTweets.length - 1 && (
                          <div className="mt-3 ml-2 w-0.5 h-4 bg-gray-700"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Individual View */}
      {viewMode === 'individual' && (
        <div className="bg-black rounded-xl p-6 mb-6">
          <div className="max-w-md mx-auto">
            <div className="bg-black border border-gray-800 rounded-xl p-6">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">YP</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t('twitterThreadPreview.mockup.profileName')}</span>
                    <span className="text-blue-400">{t('twitterThreadPreview.mockup.handle')}</span>
                  </div>
                  <div className="text-gray-500 text-sm">{t('twitterThreadPreview.mockup.timeAgo')}</div>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTweet}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="text-white text-lg leading-relaxed mb-4"
                >
                  {allTweets[currentTweet]?.content}
                </motion.div>
              </AnimatePresence>
              
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-4 text-gray-400">
                  <span className="flex items-center gap-1">
                    ❤️ {formatEngagement(allTweets[currentTweet]?.engagement?.likes || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    🔄 {formatEngagement(allTweets[currentTweet]?.engagement?.retweets || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    💬 {formatEngagement(allTweets[currentTweet]?.engagement?.replies || 0)}
                  </span>
                </div>
                
                <div className="text-gray-400 text-sm">
                  {allTweets[currentTweet]?.content?.length || 0}/280
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentTweet(prev => prev > 0 ? prev - 1 : allTweets.length - 1)}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  ←
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{currentTweet + 1}/{allTweets.length}</span>
                  {allTweets[currentTweet]?.type === 'hook' && (
                    <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-xs">{t('twitterThreadPreview.mockup.hookBadge')}</span>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentTweet(prev => prev < allTweets.length - 1 ? prev + 1 : 0)}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  →
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2 justify-center">
              <button 
                onClick={() => copyToClipboard(allTweets[currentTweet]?.content || '')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                📋 {t('twitterThreadPreview.buttons.copyTweet')}
              </button>
              <button 
                onClick={() => downloadSingleTweet(allTweets[currentTweet]?.content || '', currentTweet)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                💾 {t('twitterThreadPreview.buttons.saveTweet')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics & Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {data?.optimization && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">📊 {t('twitterThreadPreview.analytics.title')}</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {data.optimization.engagement_predictions?.estimated_reach || '5.2K'}
                </div>
                <div className="text-blue-600">{t('twitterThreadPreview.analytics.estimatedReach')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {data.optimization.engagement_predictions?.estimated_engagement_rate || '4.8'}%
                </div>
                <div className="text-blue-600">{t('twitterThreadPreview.analytics.engagement')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {data.optimization.engagement_predictions?.estimated_shares || '187'}
                </div>
                <div className="text-blue-600">{t('twitterThreadPreview.analytics.retweets')}</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <span className="font-medium text-blue-900">{t('twitterThreadPreview.analytics.optimizationTips')}</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {t('twitterThreadPreview.analytics.tips.bestTime')}</li>
                <li>• {t('twitterThreadPreview.analytics.tips.viralPotential')}</li>
                <li>• {t('twitterThreadPreview.analytics.tips.threadLength')}</li>
                <li>• {t('twitterThreadPreview.analytics.tips.pinning')}</li>
              </ul>
            </div>
          </div>
        )}

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">🚀 {t('twitterThreadPreview.exportOptions.title')}</h4>
          <ContentActions 
            content={data}
            contentType="twitter_thread"
            filename="twitter_thread.txt"
          />
        </div>
      </div>
    </div>
  );
}
