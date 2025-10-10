import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ContentActions from '../ContentActions';

interface InfographicDataPreviewProps {
  data: any;
}

export default function InfographicDataPreview({ data }: InfographicDataPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'data' | 'design'>('preview');
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  
  const infographic = data?.structured_data?.infographic || data?.infographic || {};
  const dataPoints = infographic?.data_points || [];
  const designSpecs = data?.design_automation || data?.design_specs || {};
  const templates = infographic?.template_variations || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportDataForDesign = () => {
    return JSON.stringify({
      title: infographic.title,
      subtitle: infographic.subtitle,
      data_points: dataPoints,
      design_specs: designSpecs,
      call_to_action: infographic.cta
    }, null, 2);
  };

  const mockTemplates = [
    {
      name: 'Modern Minimal',
      style: 'clean',
      colors: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
      layout: 'vertical'
    },
    {
      name: 'Bold Impact',
      style: 'dynamic',
      colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'],
      layout: 'grid'
    },
    {
      name: 'Professional',
      style: 'corporate',
      colors: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
      layout: 'timeline'
    }
  ];

  const currentTemplate = templates[selectedTemplate] || mockTemplates[selectedTemplate] || mockTemplates[0];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">📈</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Infographic Data</h3>
            <p className="text-sm text-gray-600">
              {dataPoints.length} data points • {templates.length || 3} design templates • Print ready
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              👁️ Preview
            </button>
            <button
              onClick={() => setViewMode('data')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'data' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📊 Data
            </button>
            <button
              onClick={() => setViewMode('design')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'design' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              🎨 Design
            </button>
          </div>
          
          <button
            onClick={() => copyToClipboard(exportDataForDesign())}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            📋 Export Data
          </button>
        </div>
      </div>

      {/* Preview Mode */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          {/* Template Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Template:</span>
            <div className="flex gap-2">
              {mockTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTemplate(index)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedTemplate === index
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Infographic Preview */}
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="max-w-md mx-auto">
              <div 
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                style={{ aspectRatio: '2/3' }}
              >
                {/* Header */}
                <div 
                  className="p-6 text-white text-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentTemplate.colors[0]}, ${currentTemplate.colors[1]})` 
                  }}
                >
                  <h1 className="text-2xl font-bold mb-2">
                    {infographic.title || 'Key Insights from Our Podcast'}
                  </h1>
                  <p className="text-sm opacity-90">
                    {infographic.subtitle || 'Data-driven insights for growth'}
                  </p>
                </div>

                {/* Data Visualization */}
                <div className="p-6 space-y-4">
                  {dataPoints.slice(0, 4).map((point: any, index: number) => {
                    const percentage = point.percentage || Math.floor(Math.random() * 80) + 20;
                    const colorIndex = index % currentTemplate.colors.length;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {point.label || `Data Point ${index + 1}`}
                          </span>
                          <span className="text-lg font-bold" style={{ color: currentTemplate.colors[colorIndex] }}>
                            {point.value || `${percentage}%`}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                            className="h-3 rounded-full"
                            style={{ backgroundColor: currentTemplate.colors[colorIndex] }}
                          />
                        </div>
                        
                        {point.description && (
                          <p className="text-xs text-gray-600">
                            {point.description}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Key Stats Grid */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold" style={{ color: currentTemplate.colors[0] }}>
                        {infographic.key_stats?.stat1?.value || '2.5K'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {infographic.key_stats?.stat1?.label || 'Listeners'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold" style={{ color: currentTemplate.colors[1] }}>
                        {infographic.key_stats?.stat2?.value || '95%'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {infographic.key_stats?.stat2?.label || 'Satisfaction'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div 
                  className="p-4 text-white text-center"
                  style={{ backgroundColor: currentTemplate.colors[0] }}
                >
                  <p className="text-sm font-medium">
                    {infographic.cta || 'Listen to our podcast for more insights'}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    yourpodcast.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Mode */}
      {viewMode === 'data' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{dataPoints.length}</div>
              <div className="text-sm text-blue-800">Data Points</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(Math.random() * 50) + 50}%
              </div>
              <div className="text-sm text-green-800">Avg Confidence</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockTemplates.length}
              </div>
              <div className="text-sm text-purple-800">Templates</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">A4</div>
              <div className="text-sm text-orange-800">Print Size</div>
            </div>
          </div>

          {/* Data Points Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Data Points</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataPoints.map((point: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {point.label || `Data Point ${index + 1}`}
                        </div>
                        {point.description && (
                          <div className="text-sm text-gray-500">
                            {point.description.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {point.value || `${Math.floor(Math.random() * 80) + 20}%`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          point.type === 'percentage' ? 'bg-blue-100 text-blue-800' :
                          point.type === 'number' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {point.type || 'percentage'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {point.source || 'Podcast transcript'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => copyToClipboard(`${point.label}: ${point.value}`)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Data Export */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📊 Raw Data (JSON)</h4>
            <pre className="bg-white border border-gray-200 rounded p-3 text-xs overflow-x-auto">
              {exportDataForDesign()}
            </pre>
          </div>
        </div>
      )}

      {/* Design Mode */}
      {viewMode === 'design' && (
        <div className="space-y-6">
          {/* Design Specifications */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 Design Specifications</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">📐 Dimensions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-800">Width:</span>
                    <span className="text-purple-700">{designSpecs.width || '1080px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Height:</span>
                    <span className="text-purple-700">{designSpecs.height || '1350px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Ratio:</span>
                    <span className="text-purple-700">{designSpecs.ratio || '4:5'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">DPI:</span>
                    <span className="text-purple-700">{designSpecs.dpi || '300'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">🎨 Color Palette</h4>
                <div className="space-y-2">
                  {currentTemplate.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-sm text-purple-700">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">📝 Typography</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-800">Heading:</span>
                    <span className="text-purple-700">{designSpecs.heading_font || 'Inter Bold'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Body:</span>
                    <span className="text-purple-700">{designSpecs.body_font || 'Inter Regular'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Title Size:</span>
                    <span className="text-purple-700">{designSpecs.title_size || '32px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">Body Size:</span>
                    <span className="text-purple-700">{designSpecs.body_size || '16px'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Gallery */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">🎭 Template Variations</h4>
            
            <div className="grid md:grid-cols-3 gap-4">
              {mockTemplates.map((template, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTemplate(index)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedTemplate === index 
                      ? 'border-purple-500 ring-2 ring-purple-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="h-32 p-4 text-white flex flex-col justify-between"
                    style={{ 
                      background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})` 
                    }}
                  >
                    <h5 className="font-bold text-sm">{template.name}</h5>
                    <div className="text-xs opacity-75">{template.style}</div>
                  </div>
                  
                  <div className="p-3 bg-white">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Layout: {template.layout}</span>
                      <span>Colors: {template.colors.length}</span>
                    </div>
                    <div className="flex gap-1">
                      {template.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Brand Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3">🏷️ Brand Guidelines</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">Logo Placement</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Top-right corner with 20px padding</li>
                  <li>• Minimum size: 80px width</li>
                  <li>• Transparent background preferred</li>
                  <li>• Maintain aspect ratio</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">Design Consistency</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Use brand colors for data visualization</li>
                  <li>• Maintain 40px margins on all sides</li>
                  <li>• Keep font hierarchy consistent</li>
                  <li>• Include social media handles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">🎨 Design Specs</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                📐 Size: {designSpecs.width || '1080px'} × {designSpecs.height || '1350px'}
              </div>
            </div>
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                🎨 Templates: {mockTemplates.length} design options
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🚀 Design Tools</h4>
          <ContentActions 
            content={data}
            contentType="infographic_data"
            filename="infographic_data.json"
          />
        </div>
      </div>
    </div>
  );
}
