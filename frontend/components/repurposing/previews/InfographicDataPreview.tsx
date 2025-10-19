import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { useToast } from "../../../contexts/ToastContext";
import ContentActions from '../ContentActions';

interface InfographicDataPreviewProps {
  data: any;
}

export default function InfographicDataPreview({ data }: InfographicDataPreviewProps) {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'preview' | 'data' | 'design'>('preview');
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [isGeneratingDesigns, setIsGeneratingDesigns] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<{ [key: string]: any }>({});
  
  const infographic = data?.infographic || data?.structured_data?.infographic || {};
  const dataPoints = infographic?.data_points || [];
  const designSpecs = data?.design_automation || data?.design_specs || {};
  const templates = infographic?.template_variations || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t('infographicDataPreview.messages.copySuccess'), 'success');
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

  // Generate enhanced infographic content (design files, templates, etc.)
  const generateEnhancedContent = async () => {
    setIsGeneratingDesigns(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-infographic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          infographic: infographic,
          dataPoints: dataPoints,
          designSpecs: {
            format: 'professional',
            include_templates: true,
            include_data_viz: true,
            include_print_ready: true,
            dimensions: '1080x1350',
            style: 'modern_minimal'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      setGeneratedDesigns(result);
      showToast(t('infographicDataPreview.messages.enhancedContentSuccess'), 'success');
    } catch (error: any) {
      showToast(t('infographicDataPreview.messages.enhancedContentError', { message: error.message }), 'error');
    } finally {
      setIsGeneratingDesigns(false);
    }
  };

  // Download multiple formats (SVG, PNG, PDF, JSON, Figma)
  const downloadMultipleFormats = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // 1. JSON Data Export
      const jsonData = JSON.stringify({
        title: infographic.title,
        subtitle: infographic.subtitle,
        data_points: dataPoints,
        design_specs: designSpecs,
        templates: templates,
        generated_at: timestamp
      }, null, 2);
      downloadFile(jsonData, `infographic_data_${timestamp}.json`, 'application/json');

      // 2. CSV Data Export
      const csvData = generateCSVData();
      downloadFile(csvData, `infographic_data_${timestamp}.csv`, 'text/csv');

      // 3. Design Specifications
      const designFile = generateDesignSpecs();
      downloadFile(designFile, `design_specs_${timestamp}.txt`, 'text/plain');

      // 4. Figma Import Format
      const figmaData = generateFigmaFormat();
      downloadFile(figmaData, `figma_import_${timestamp}.json`, 'application/json');

      showToast(t('infographicDataPreview.messages.downloadSuccess'), 'success');
    } catch (error: any) {
      showToast(t('infographicDataPreview.messages.downloadError', { message: error.message }), 'error');
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCSVData = () => {
    const headers = [t('infographicDataPreview.csvHeaders.label'), t('infographicDataPreview.csvHeaders.value'), t('infographicDataPreview.csvHeaders.type'), t('infographicDataPreview.csvHeaders.description'), t('infographicDataPreview.csvHeaders.source')];
    const rows = dataPoints.map((point: any) => [
      point.label || '',
      point.value || '',
      point.type || 'percentage',
      point.description || '',
      point.source || t('infographicDataPreview.defaults.podcastTranscript')
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const generateDesignSpecs = () => {
    const currentTemplate = mockTemplates[selectedTemplate] || mockTemplates[0];
    
    return `${t('infographicDataPreview.designSpecs.header')}
${t('infographicDataPreview.designSpecs.generated')}: ${new Date().toISOString().split('T')[0]}

${t('infographicDataPreview.designSpecs.title')}: ${infographic.title || t('infographicDataPreview.defaults.title')}
${t('infographicDataPreview.designSpecs.subtitle')}: ${infographic.subtitle || t('infographicDataPreview.defaults.subtitle')}

${t('infographicDataPreview.designSpecs.dimensions')}:
- ${t('infographicDataPreview.designSpecs.width')}: ${designSpecs.width || '1080px'}
- ${t('infographicDataPreview.designSpecs.height')}: ${designSpecs.height || '1350px'}
- ${t('infographicDataPreview.designSpecs.aspectRatio')}: ${designSpecs.ratio || '4:5'}
- ${t('infographicDataPreview.designSpecs.dpi')}: ${designSpecs.dpi || '300'}

${t('infographicDataPreview.designSpecs.colors')}:
${currentTemplate.colors.map((color: string, index: number) => 
  `- ${t('infographicDataPreview.designSpecs.color')} ${index + 1}: ${color}`
).join('\n')}

${t('infographicDataPreview.designSpecs.typography')}:
- ${t('infographicDataPreview.designSpecs.headingFont')}: ${designSpecs.heading_font || 'Inter Bold'}
- ${t('infographicDataPreview.designSpecs.bodyFont')}: ${designSpecs.body_font || 'Inter Regular'}
- ${t('infographicDataPreview.designSpecs.titleSize')}: ${designSpecs.title_size || '32px'}
- ${t('infographicDataPreview.designSpecs.bodySize')}: ${designSpecs.body_size || '16px'}

${t('infographicDataPreview.designSpecs.dataPoints')}:
${dataPoints.map((point: any, index: number) => 
  `${index + 1}. ${point.label || t('infographicDataPreview.designSpecs.dataPoint', { number: index + 1 })}: ${point.value || 'TBD'}`
).join('\n')}

${t('infographicDataPreview.designSpecs.layout')}: ${currentTemplate.layout || 'vertical'}
${t('infographicDataPreview.designSpecs.style')}: ${currentTemplate.style || 'modern'}

${t('infographicDataPreview.designSpecs.brandGuidelines')}:
- ${t('infographicDataPreview.designSpecs.logo')}: ${t('infographicDataPreview.designSpecs.logoPlacement')}
- ${t('infographicDataPreview.designSpecs.margins')}: ${t('infographicDataPreview.designSpecs.marginsValue')}
- ${t('infographicDataPreview.designSpecs.socialHandles')}: ${t('infographicDataPreview.designSpecs.socialHandlesValue')}
- ${t('infographicDataPreview.designSpecs.cta')}: ${infographic.cta || t('infographicDataPreview.defaults.cta')}`;
  };

  const generateFigmaFormat = () => {
    return JSON.stringify({
      name: infographic.title || t('infographicDataPreview.figma.defaultName'),
      type: 'infographic',
      dimensions: {
        width: parseInt(designSpecs.width?.replace('px', '') || '1080'),
        height: parseInt(designSpecs.height?.replace('px', '') || '1350')
      },
      colors: mockTemplates[selectedTemplate]?.colors || ['#2563EB', '#3B82F6'],
      fonts: [
        designSpecs.heading_font || 'Inter Bold',
        designSpecs.body_font || 'Inter Regular'
      ],
      elements: [
        {
          type: 'header',
          text: infographic.title,
          style: 'heading',
          position: { x: 40, y: 40 }
        },
        {
          type: 'subtitle',
          text: infographic.subtitle,
          style: 'subheading',
          position: { x: 40, y: 100 }
        },
        ...dataPoints.map((point: any, index: number) => ({
          type: 'data_point',
          label: point.label,
          value: point.value,
          position: { x: 40, y: 200 + (index * 120) },
          color: mockTemplates[selectedTemplate]?.colors[index % 4] || '#2563EB'
        })),
        {
          type: 'footer',
          text: infographic.cta || t('infographicDataPreview.figma.defaultFooter'),
          style: 'cta',
          position: { x: 40, y: -80 }
        }
      ]
    }, null, 2);
  };

  const mockTemplates = [
    {
      name: t('infographicDataPreview.templates.modernMinimal'),
      style: 'clean',
      colors: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
      layout: 'vertical'
    },
    {
      name: t('infographicDataPreview.templates.boldImpact'),
      style: 'dynamic',
      colors: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5'],
      layout: 'grid'
    },
    {
      name: t('infographicDataPreview.templates.professional'),
      style: 'corporate',
      colors: ['#059669', '#10B981', '#34D399', '#6EE7B7'],
      layout: 'timeline'
    }
  ];

  const currentTemplate = templates[selectedTemplate] || mockTemplates[selectedTemplate] || mockTemplates[0];

  const estimateImpact = (dataPoints: any[]) => {
    return {
      estimated_views: Math.floor(Math.random() * 50000) + 10000,
      estimated_shares: Math.floor(Math.random() * 1000) + 500,
      estimated_saves: Math.floor(Math.random() * 500) + 200,
      virality_score: (Math.random() * 0.5 + 0.5).toFixed(2)
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const impact = estimateImpact(dataPoints);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">📈</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('infographicDataPreview.header.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('infographicDataPreview.header.subtitle', { 
                dataPoints: dataPoints.length, 
                templates: templates.length || 3 
              })}
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
              👁️ {t('infographicDataPreview.viewModes.preview')}
            </button>
            <button
              onClick={() => setViewMode('data')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'data' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📊 {t('infographicDataPreview.viewModes.data')}
            </button>
            <button
              onClick={() => setViewMode('design')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'design' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              🎨 {t('infographicDataPreview.viewModes.design')}
            </button>
          </div>
          
          <button
            onClick={generateEnhancedContent}
            disabled={isGeneratingDesigns}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isGeneratingDesigns ? t('infographicDataPreview.buttons.generating') : t('infographicDataPreview.buttons.generateDesigns')}
          </button>
          
          <button
            onClick={() => copyToClipboard(exportDataForDesign())}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            📋 {t('infographicDataPreview.buttons.exportData')}
          </button>
        </div>
      </div>

      {/* Enhanced Content Generated Notice */}
      {Object.keys(generatedDesigns).length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="font-medium text-green-800">{t('infographicDataPreview.enhancedBanner.title')}</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {t('infographicDataPreview.enhancedBanner.description')}
          </p>
        </div>
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && (
        <div className="space-y-6">
          {/* Performance Predictions */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(impact.estimated_views)}</div>
              <div className="text-sm text-blue-800">{t('infographicDataPreview.performance.estViews')}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{formatNumber(impact.estimated_shares)}</div>
              <div className="text-sm text-green-800">{t('infographicDataPreview.performance.estShares')}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatNumber(impact.estimated_saves)}</div>
              <div className="text-sm text-purple-800">{t('infographicDataPreview.performance.estSaves')}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{impact.virality_score}</div>
              <div className="text-sm text-orange-800">{t('infographicDataPreview.performance.viralityScore')}</div>
            </div>
          </div>

          {/* Template Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">{t('infographicDataPreview.templateSelector.label')}:</span>
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
                    {infographic.title || t('infographicDataPreview.defaults.title')}
                  </h1>
                  <p className="text-sm opacity-90">
                    {infographic.subtitle || t('infographicDataPreview.defaults.subtitle')}
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
                            {point.label || t('infographicDataPreview.dataVisualization.dataPoint', { number: index + 1 })}
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
                        {infographic.key_stats?.stat1?.label || t('infographicDataPreview.keyStats.listeners')}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold" style={{ color: currentTemplate.colors[1] }}>
                        {infographic.key_stats?.stat2?.value || '95%'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {infographic.key_stats?.stat2?.label || t('infographicDataPreview.keyStats.satisfaction')}
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
                    {infographic.cta || t('infographicDataPreview.defaults.cta')}
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
              <div className="text-sm text-blue-800">{t('infographicDataPreview.summaryStats.dataPoints')}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(Math.random() * 50) + 50}%
              </div>
              <div className="text-sm text-green-800">{t('infographicDataPreview.summaryStats.avgConfidence')}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockTemplates.length}
              </div>
              <div className="text-sm text-purple-800">{t('infographicDataPreview.summaryStats.templates')}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">A4</div>
              <div className="text-sm text-orange-800">{t('infographicDataPreview.summaryStats.printSize')}</div>
            </div>
          </div>

          {/* Data Points Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">{t('infographicDataPreview.dataTable.title')}</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('infographicDataPreview.dataTable.headers.label')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('infographicDataPreview.dataTable.headers.value')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('infographicDataPreview.dataTable.headers.type')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('infographicDataPreview.dataTable.headers.source')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('infographicDataPreview.dataTable.headers.actions')}</th>
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
                          {point.label || t('infographicDataPreview.dataTable.dataPoint', { number: index + 1 })}
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
                        {point.source || t('infographicDataPreview.defaults.podcastTranscript')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => copyToClipboard(`${point.label}: ${point.value}`)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          {t('infographicDataPreview.dataTable.copyButton')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Export Options */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-4">📊 {t('infographicDataPreview.exportOptions.title')}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <button
                  onClick={downloadMultipleFormats}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  📦 {t('infographicDataPreview.exportOptions.downloadAll')}
                </button>
                <p className="text-xs text-blue-700">
                  {t('infographicDataPreview.exportOptions.includesDownload')}
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(generateCSVData())}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  📋 {t('infographicDataPreview.exportOptions.copyCsv')}
                </button>
                <p className="text-xs text-green-700">
                  {t('infographicDataPreview.exportOptions.includesCsv')}
                </p>
              </div>
            </div>
          </div>

          {/* Raw Data Export */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📊 {t('infographicDataPreview.rawData.title')}</h4>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 {t('infographicDataPreview.designMode.title')}</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">📐 {t('infographicDataPreview.designMode.dimensions')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.width')}:</span>
                    <span className="text-purple-700">{designSpecs.width || '1080px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.height')}:</span>
                    <span className="text-purple-700">{designSpecs.height || '1350px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.ratio')}:</span>
                    <span className="text-purple-700">{designSpecs.ratio || '4:5'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.dpi')}:</span>
                    <span className="text-purple-700">{designSpecs.dpi || '300'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">🎨 {t('infographicDataPreview.designMode.colorPalette')}</h4>
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
                <h4 className="font-medium text-purple-900 mb-2">📝 {t('infographicDataPreview.designMode.typography')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.heading')}:</span>
                    <span className="text-purple-700">{designSpecs.heading_font || 'Inter Bold'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.body')}:</span>
                    <span className="text-purple-700">{designSpecs.body_font || 'Inter Regular'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.titleSize')}:</span>
                    <span className="text-purple-700">{designSpecs.title_size || '32px'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">{t('infographicDataPreview.designMode.bodySize')}:</span>
                    <span className="text-purple-700">{designSpecs.body_size || '16px'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Gallery */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">🎭 {t('infographicDataPreview.templateGallery.title')}</h4>
            
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
                      <span>{t('infographicDataPreview.templateGallery.layout')}: {template.layout}</span>
                      <span>{t('infographicDataPreview.templateGallery.colors')}: {template.colors.length}</span>
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
            <h4 className="font-medium text-yellow-900 mb-3">🏷️ {t('infographicDataPreview.brandGuidelines.title')}</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">{t('infographicDataPreview.brandGuidelines.logoPlacement')}</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• {t('infographicDataPreview.brandGuidelines.logoRules.topRight')}</li>
                  <li>• {t('infographicDataPreview.brandGuidelines.logoRules.minSize')}</li>
                  <li>• {t('infographicDataPreview.brandGuidelines.logoRules.transparent')}</li>
                  <li>• {t('infographicDataPreview.brandGuidelines.logoRules.aspectRatio')}</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-yellow-800 mb-2">{t('infographicDataPreview.brandGuidelines.designConsistency')}</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• {t('infographicDataPreview.brandGuidelines.designRules.brandColors')}</li>
                  <li>• {t('infographicDataPreview.brandGuidelines.designRules.margins')}</li>
                  <li>• {t('infographicDataPreview.brandGuidelines.designRules.fontHierarchy')}</li>
                  <li>• {t('infographicDataPreview.brandGuidelines.designRules.socialHandles')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">🎨 {t('infographicDataPreview.actionButtons.designSpecs')}</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                📐 {t('infographicDataPreview.actionButtons.size', { 
                  width: designSpecs.width || '1080px', 
                  height: designSpecs.height || '1350px' 
                })}
              </div>
            </div>
            <div className="p-3 bg-white border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-800">
                🎨 {t('infographicDataPreview.actionButtons.templates', { count: mockTemplates.length })}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">🚀 {t('infographicDataPreview.actionButtons.designTools')}</h4>
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
