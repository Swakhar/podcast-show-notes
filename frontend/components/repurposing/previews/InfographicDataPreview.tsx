import React from 'react';

interface InfographicDataPreviewProps {
  data: any;
}

export default function InfographicDataPreview({ data }: InfographicDataPreviewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📈</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Infographic Data</h3>
            <p className="text-sm text-gray-600">Visual content specifications</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
          🎨 Create in Canva
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {data?.content || data?.data_points || JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
