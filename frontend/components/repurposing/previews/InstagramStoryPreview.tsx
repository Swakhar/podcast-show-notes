import React from 'react';

interface InstagramStoryPreviewProps {
  data: any;
}

export default function InstagramStoryPreview({ data }: InstagramStoryPreviewProps) {
  const stories = data?.structured_data?.story_sequence || data?.stories || [];
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📱</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Instagram Stories</h3>
            <p className="text-sm text-gray-600">{stories.length} stories • Interactive format</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium">
          📱 Preview Stories
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stories.map((story: any, index: number) => (
          <div key={index} className="aspect-[9/16] bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-xs mb-2">Story {index + 1}</div>
            <p className="text-sm">{story.content || story.text || story}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
