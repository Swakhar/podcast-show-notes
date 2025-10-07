import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useToast } from '../../../contexts/ToastContext';

interface LandingFeature {
  id?: string;
  locale: string;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

export default function LandingFeaturesAdmin() {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const [features, setFeatures] = useState<Record<string, LandingFeature[]>>({
    en: [],
    de: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('en');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const [enRes, deRes] = await Promise.all([
        fetch('/api/admin/landing/features?locale=en'),
        fetch('/api/admin/landing/features?locale=de')
      ]);

      const [enData, deData] = await Promise.all([
        enRes.json(),
        deRes.json()
      ]);

      setFeatures({
        en: enData.features || getDefaultFeatures('en'),
        de: deData.features || getDefaultFeatures('de')
      });
    } catch (error) {
      console.error('Failed to fetch features:', error);
      // Set default features
      setFeatures({
        en: getDefaultFeatures('en'),
        de: getDefaultFeatures('de')
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFeatures = (locale: string): LandingFeature[] => {
    const isGerman = locale === 'de';
    
    return [
      {
        locale,
        icon: "🎤",
        title: isGerman ? "KI-Transkription" : "AI Transcription",
        description: isGerman 
          ? "Präzise Transkription Ihrer Podcast-Episoden in Minuten statt Stunden." 
          : "Accurate transcription of your podcast episodes in minutes, not hours.",
        benefits: isGerman 
          ? ["95%+ Genauigkeit", "Mehrsprachig", "Automatische Zeitstempel"]
          : ["95%+ accuracy", "Multi-language support", "Auto timestamps"],
        isActive: true,
        sortOrder: 1
      },
      {
        locale,
        icon: "📝",
        title: isGerman ? "Automatische Show Notes" : "Auto Show Notes",
        description: isGerman 
          ? "Generieren Sie professionelle Show Notes aus Ihren Transkripten automatisch." 
          : "Generate professional show notes from your transcripts automatically.",
        benefits: isGerman 
          ? ["SEO-optimiert", "Strukturiert", "Sofort einsatzbereit"]
          : ["SEO optimized", "Structured format", "Ready to publish"],
        isActive: true,
        sortOrder: 2
      },
      {
        locale,
        icon: "📱",
        title: isGerman ? "Social Media Content" : "Social Media Content",
        description: isGerman 
          ? "Erstellen Sie ansprechende Posts für alle sozialen Plattformen automatisch." 
          : "Create engaging posts for all social media platforms automatically.",
        benefits: isGerman 
          ? ["Mehrere Formate", "Hashtag-Vorschläge", "Optimierte Zeiten"]
          : ["Multiple formats", "Hashtag suggestions", "Optimal timing"],
        isActive: true,
        sortOrder: 3
      },
      {
        locale,
        icon: "🔗",
        title: isGerman ? "WordPress Integration" : "WordPress Integration",
        description: isGerman 
          ? "Veröffentlichen Sie Inhalte direkt auf Ihrer WordPress-Website." 
          : "Publish content directly to your WordPress website automatically.",
        benefits: isGerman 
          ? ["Direkte Veröffentlichung", "Automatische Formatierung", "SEO-Metadaten"]
          : ["Direct publishing", "Auto formatting", "SEO metadata"],
        isActive: true,
        sortOrder: 4
      },
      {
        locale,
        icon: "📊",
        title: isGerman ? "Analytics & Insights" : "Analytics & Insights",
        description: isGerman 
          ? "Erhalten Sie detaillierte Einblicke in die Performance Ihrer Inhalte." 
          : "Get detailed insights into your content performance and engagement.",
        benefits: isGerman 
          ? ["Engagement-Metriken", "Content-Performance", "Wachstums-Tracking"]
          : ["Engagement metrics", "Content performance", "Growth tracking"],
        isActive: true,
        sortOrder: 5
      },
      {
        locale,
        icon: "⚡",
        title: isGerman ? "Blitzschnelle Verarbeitung" : "Lightning Fast Processing",
        description: isGerman 
          ? "Verarbeiten Sie Ihre Podcast-Episoden in Rekordzeit mit KI-Power." 
          : "Process your podcast episodes in record time with AI-powered automation.",
        benefits: isGerman 
          ? ["Unter 5 Minuten", "Batch-Verarbeitung", "Cloud-Power"]
          : ["Under 5 minutes", "Batch processing", "Cloud-powered"],
        isActive: true,
        sortOrder: 6
      }
    ];
  };

  const addFeature = () => {
    const newFeature: LandingFeature = {
      locale: activeTab,
      icon: "🎯",
      title: "",
      description: "",
      benefits: [""],
      isActive: true,
      sortOrder: features[activeTab].length + 1
    };

    setFeatures(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newFeature]
    }));
  };

  const updateFeature = (index: number, field: keyof LandingFeature, value: any) => {
    setFeatures(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const removeFeature = (index: number) => {
    setFeatures(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((_, i) => i !== index)
    }));
  };

  const addBenefit = (featureIndex: number) => {
    setFeatures(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map((feature, i) => 
        i === featureIndex 
          ? { ...feature, benefits: [...feature.benefits, ""] }
          : feature
      )
    }));
  };

  const updateBenefit = (featureIndex: number, benefitIndex: number, value: string) => {
    setFeatures(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map((feature, i) => 
        i === featureIndex 
          ? { 
              ...feature, 
              benefits: feature.benefits.map((benefit, j) => 
                j === benefitIndex ? value : benefit
              )
            }
          : feature
      )
    }));
  };

  const removeBenefit = (featureIndex: number, benefitIndex: number) => {
    setFeatures(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map((feature, i) => 
        i === featureIndex 
          ? { 
              ...feature, 
              benefits: feature.benefits.filter((_, j) => j !== benefitIndex)
            }
          : feature
      )
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/landing/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          features: [
            ...features.en.map(f => ({ ...f, locale: 'en' })),
            ...features.de.map(f => ({ ...f, locale: 'de' }))
          ]
        })
      });

      if (response.ok) {
        showToast('Features updated successfully!', 'success');
        fetchFeatures();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showToast('Failed to save features', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Landing Page Features</h1>
            <p className="text-gray-600 mt-2">Manage the features shown on your homepage</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addFeature}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Add Feature
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('en')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'en'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => setActiveTab('de')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'de'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🇩🇪 German
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-6">
          {features[activeTab].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Feature {index + 1}</h3>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={feature.isActive}
                      onChange={(e) => updateFeature(index, 'isActive', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Active</span>
                  </label>
                  <button
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="🎤"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Feature title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Feature description"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateBenefit(index, benefitIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Benefit description"
                        />
                        <button
                          onClick={() => removeBenefit(index, benefitIndex)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addBenefit(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Benefit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* "Early Access" Tips */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-blue-900 font-semibold mb-2">💡 "Early Access" Strategy Tips</h4>
          <div className="text-blue-700 text-sm space-y-2">
            <p><strong>Instead of fake testimonials, use:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• "Join 100+ Beta Users" instead of "100+ Happy Customers"</li>
              <li>• "Early Access Program" section instead of testimonials</li>
              <li>• "Be among the first" messaging creates urgency</li>
              <li>• "Beta feedback" sounds more authentic than fake reviews</li>
              <li>• Use email signups for "Get Early Access" instead of immediate purchase</li>
            </ul>
            <p className="mt-3"><strong>Update your homepage hero to say:</strong></p>
            <div className="bg-white p-3 rounded border-l-4 border-blue-500 font-mono text-xs">
              🚀 Join 100+ Creators in Early Access Beta
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
    
    if (!session || !(session.user as any)?.is_admin) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: {
        ...(await serverSideTranslations(context.locale ?? 'en', ['admin', 'common'])),
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};
