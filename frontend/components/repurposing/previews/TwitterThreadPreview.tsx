import React, { useState } from 'react';

interface TwitterThreadPreviewProps {
  data: any;
}

export default function TwitterThreadPreview({ data }: TwitterThreadPreviewProps) {
  const [expandedTweet, setExpandedTweet] = useState<number | null>(null);
  
  const hookTweet = data?.structured_data?.hook_tweet || data?.hook_tweet || '';
  const threadTweets = data?.structured_data?.thread_tweets || data?.thread_tweets || [];
  const hashtags = data?.structured_data?.hashtags || data?.hashtags || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportThread = () => {
    const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
    return allTweets.map((tweet, index) => `${index + 1}/${allTweets.length} ${tweet}`).join('\n\n');
  };

  const allTweets = [
    { content: hookTweet, type: 'hook' },
    ...threadTweets.map((tweet: any) => ({ 
      content: tweet.content || tweet.text || tweet, 
      type: 'thread' 
    }))
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🧵</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Twitter Thread</h3>
            <p className="text-sm text-gray-600">{allTweets.length} tweets • Optimized for engagement</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(exportThread())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            📋 Copy Thread
          </button>
          <button
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            📅 Schedule Posts
          </button>
        </div>
      </div>

      {/* Thread Preview */}
      <div className="space-y-4 mb-6">
        {allTweets.map((tweet, index) => {
          const isExpanded = expandedTweet === index;
          const content = tweet.content || '';
          const isLong = content.length > 200;
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">YP</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">Your Profile</span>
                    <span className="text-gray-500">@yourhandle</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">now</span>
                    {tweet.type === 'hook' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        HOOK
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {index + 1}/{allTweets.length}
                    </span>
                  </div>
                  
                  <div className="text-gray-900 leading-relaxed mb-3">
                    {isLong && !isExpanded ? (
                      <>
                        {content.substring(0, 200)}...
                        <button
                          onClick={() => setExpandedTweet(index)}
                          className="text-blue-500 hover:text-blue-600 ml-1"
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
                            className="text-blue-500 hover:text-blue-600 ml-1"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-gray-500 text-sm">
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      💬 {Math.floor(Math.random() * 50) + 10}
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                      🔄 {Math.floor(Math.random() * 100) + 20}
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                      ❤️ {Math.floor(Math.random() * 200) + 50}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(content)}
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    >
                      📋 Copy
                    </button>
                  </div>
                  
                  {index < allTweets.length - 1 && (
                    <div className="mt-3 ml-2 w-0.5 h-4 bg-gray-300"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Hashtags:</label>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={() => copyToClipboard(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Predictions */}
      {data?.optimization && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📊 Performance Predictions</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-800">
                {data.optimization.engagement_predictions?.estimated_reach || '5K'}
              </div>
              <div className="text-blue-600">Est. Reach</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-800">
                {data.optimization.engagement_predictions?.estimated_engagement_rate || '4.5'}%
              </div>
              <div className="text-blue-600">Engagement</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-800">
                {data.optimization.engagement_predictions?.estimated_shares || '150'}
              </div>
              <div className="text-blue-600">Retweets</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
