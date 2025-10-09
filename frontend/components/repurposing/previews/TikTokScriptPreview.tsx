import React from 'react';

interface TikTokScriptPreviewProps {
  data: any;
}

export default function TikTokScriptPreview({ data }: TikTokScriptPreviewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <span className="text-xl">🎬</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">TikTok Script</h3>
            <p className="text-sm text-gray-600">60-second viral video script</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
          🎬 Production Notes
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {data?.content || data?.script || JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
