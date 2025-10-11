import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentActions from '../ContentActions';
import { useToast } from "../../../contexts/ToastContext";

interface TwitterThreadPreviewProps {
  data: any;
}

export default function TwitterThreadPreview({ data }: TwitterThreadPreviewProps) {
  const { showToast } = useToast();
  const [expandedTweet, setExpandedTweet] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'thread' | 'individual'>('thread');
  const [currentTweet, setCurrentTweet] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const hookTweet = data?.structured_data?.hook_tweet || data?.hook_tweet || '';
  const threadTweets = data?.structured_data?.thread_tweets || data?.thread_tweets || [];
  const hashtags = data?.structured_data?.hashtags || data?.hashtags || [];
  const designSpecs = data?.design_automation || data?.design_specs || {};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  // ✅ Export thread in multiple formats
  const exportThread = () => {
    const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
    return allTweets.map((tweet, index) => `${index + 1}/${allTweets.length} ${tweet}`).join('\n\n');
  };

  // ✅ NEW: Download formatted text files
  const downloadFormattedFiles = () => {
    setIsExporting(true);
    
    try {
      const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Format 1: Simple numbered thread
      const simpleFormat = allTweets.map((tweet, index) => 
        `${index + 1}/${allTweets.length} ${tweet}`
      ).join('\n\n');
      
      // Format 2: Thread with hashtags
      const hashtagFormat = allTweets.map((tweet, index) => {
        const hashtagsStr = index === allTweets.length - 1 ? `\n\n${hashtags.join(' ')}` : '';
        return `${index + 1}/${allTweets.length} ${tweet}${hashtagsStr}`;
      }).join('\n\n');
      
      // Format 3: Twitter scheduler format (Buffer/Hootsuite)
      const schedulerFormat = allTweets.map((tweet, index) => 
        `TWEET ${index + 1}:\n${tweet}\n\nSTATUS: ${index === 0 ? 'MAIN TWEET' : 'REPLY TO PREVIOUS'}\nCHARACTERS: ${tweet.length}/280\n\n${'='.repeat(50)}\n`
      ).join('\n');
      
      // Format 4: Analytics format with metadata
      const analyticsFormat = `TWITTER THREAD ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}
Total Tweets: ${allTweets.length}
Estimated Reach: ${data?.optimization?.engagement_predictions?.estimated_reach || '5.2K'}
Estimated Engagement: ${data?.optimization?.engagement_predictions?.estimated_engagement_rate || '4.8'}%

THREAD CONTENT:
${allTweets.map((tweet, index) => {
  return `\nTWEET ${index + 1}:
Content: ${tweet}
Character Count: ${tweet.length}/280
Type: ${index === 0 ? 'Hook Tweet' : 'Thread Tweet'}
${index === 0 ? 'Viral Potential: High 🔥' : 'Follow-up Score: Good ✅'}`;
}).join('\n')}

HASHTAGS:
${hashtags.join(', ')}

OPTIMIZATION NOTES:
• Best posting time: 9:00 AM EST
• Hook tweet optimized for engagement
• Thread length optimized for retention
• Hashtags selected for maximum reach`;

      // Download each format
      const formats = {
        [`twitter_thread_simple_${timestamp}.txt`]: simpleFormat,
        [`twitter_thread_with_hashtags_${timestamp}.txt`]: hashtagFormat,
        [`twitter_thread_scheduler_${timestamp}.txt`]: schedulerFormat,
        [`twitter_thread_analytics_${timestamp}.txt`]: analyticsFormat
      };
      
      Object.entries(formats).forEach(([filename, content]) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      });

      showToast('📄 Thread files downloaded successfully!', 'success');
    } catch (error: any) {
      console.error('Error downloading thread files:', error);
      showToast(`Error downloading files: ${error.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ NEW: Export single tweet file
  const downloadSingleTweet = (tweetContent: string, index: number) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `tweet_${index + 1}_${timestamp}.txt`;
    const content = `TWEET ${index + 1} OF ${allTweets.length}

${tweetContent}

---
Character Count: ${tweetContent.length}/280
Generated: ${new Date().toLocaleDateString()}
Type: ${index === 0 ? 'Hook Tweet' : 'Thread Tweet'}
${hashtags.length > 0 ? `\nSuggested Hashtags: ${hashtags.join(' ')}` : ''}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
    showToast(`Tweet ${index + 1} downloaded!`, 'success');
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
      {/* Enhanced Header with Export Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">🧵</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Twitter Thread</h3>
            <p className="text-sm text-gray-600">{allTweets.length} tweets • Optimized for engagement</p>
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
              Thread View
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'individual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Individual
            </button>
          </div>
          
          <button
            onClick={() => copyToClipboard(exportThread())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            📋 Copy Thread
          </button>
          
          {/* ✅ NEW: Download Files Button */}
          <button
            onClick={downloadFormattedFiles}
            disabled={isExporting}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Downloading...
              </>
            ) : (
              <>
                📄 Download Files
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thread View with Individual Download Buttons */}
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
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-white">Your Profile</span>
                          <span className="text-blue-400">@yourhandle</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">now</span>
                          {tweet.type === 'hook' && (
                            <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-xs font-medium">
                              HOOK
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
                            {index + 1}/{allTweets.length}
                          </span>
                        </div>
                        
                        <div className="text-white leading-relaxed mb-3">
                          {isLong && !isExpanded ? (
                            <>
                              {content.substring(0, 200)}...
                              <button
                                onClick={() => setExpandedTweet(index)}
                                className="text-blue-400 hover:text-blue-300 ml-1"
                              >
                                Show more
                              </button>
                            </>
                          ) : (
                            <>
                              {content}
                              {isLong && isExpanded && (
                                <button
                                  onClick={() => setExpandedTweet(null)}
                                  className="text-blue-400 hover:text-blue-300 ml-1"
                                >
                                  Show less
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
                          
                          {/* ✅ Individual Tweet Actions */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => copyToClipboard(content)}
                              className="flex items-center gap-1 hover:text-blue-400 transition-colors text-xs px-2 py-1 bg-gray-800 rounded"
                            >
                              📋 Copy
                            </button>
                            <button 
                              onClick={() => downloadSingleTweet(content, index)}
                              className="flex items-center gap-1 hover:text-green-400 transition-colors text-xs px-2 py-1 bg-gray-800 rounded"
                            >
                              📄 Download
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

      {/* Individual View - Keep existing code */}
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
                    <span className="font-bold text-white">Your Profile</span>
                    <span className="text-blue-400">@yourhandle</span>
                  </div>
                  <div className="text-gray-500 text-sm">now</div>
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
              
              <div className="flex items-center justify-between">
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
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTweet(prev => prev > 0 ? prev - 1 : allTweets.length - 1)}
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    ←
                  </button>
                  <span className="text-gray-400 text-sm">{currentTweet + 1}/{allTweets.length}</span>
                  <button
                    onClick={() => setCurrentTweet(prev => prev < allTweets.length - 1 ? prev + 1 : 0)}
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Individual Tweet Actions */}
            <div className="mt-4 flex gap-2 justify-center">
              <button 
                onClick={() => copyToClipboard(allTweets[currentTweet]?.content || '')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                📋 Copy This Tweet
              </button>
              <button 
                onClick={() => downloadSingleTweet(allTweets[currentTweet]?.content || '', currentTweet)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                📄 Download This Tweet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics & Actions - Keep existing code */}
      <div className="grid md:grid-cols-2 gap-6">
        {data?.optimization && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">📊 Performance Predictions</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {data.optimization.engagement_predictions?.estimated_reach || '5.2K'}
                </div>
                <div className="text-blue-600">Est. Reach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {data.optimization.engagement_predictions?.estimated_engagement_rate || '4.8'}%
                </div>
                <div className="text-blue-600">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {data.optimization.engagement_predictions?.estimated_shares || '187'}
                </div>
                <div className="text-blue-600">Retweets</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎯</span>
                <span className="font-medium text-blue-900">Optimization Tips</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Best time to post: 9:00 AM EST</li>
                <li>• Hook tweet has 85% viral potential</li>
                <li>• Add 2-3 relevant hashtags for discovery</li>
              </ul>
            </div>
          </div>
        )}

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">🚀 Twitter Tools</h4>
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
