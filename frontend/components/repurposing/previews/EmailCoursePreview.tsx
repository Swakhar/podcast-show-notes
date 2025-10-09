import React from 'react';

interface EmailCoursePreviewProps {
  data: any;
}

export default function EmailCoursePreview({ data }: EmailCoursePreviewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📧</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Email Course</h3>
            <p className="text-sm text-gray-600">7-part automated sequence</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          📧 Export to Mailchimp
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {data?.content || data?.emails || JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
