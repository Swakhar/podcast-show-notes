import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useToast } from '../../../contexts/ToastContext';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';

interface LandingStats {
  id?: string;
  locale: string;
  episodes: string;
  episodesLabel: string;
  creators: string;
  creatorsLabel: string;
  timeSaved: string;
  timeSavedLabel: string;
  rating: string;
  ratingLabel: string;
  isActive: boolean;
}

export default function LandingStatsAdmin() {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const [stats, setStats] = useState<Record<string, LandingStats>>({
    en: {
      locale: 'en',
      episodes: '500+',
      episodesLabel: 'Episodes Processed',
      creators: '100+',
      creatorsLabel: 'Happy Creators',
      timeSaved: '2,000+',
      timeSavedLabel: 'Hours Saved',
      rating: '4.8/5',
      ratingLabel: 'User Rating',
      isActive: true
    },
    de: {
      locale: 'de',
      episodes: '500+',
      episodesLabel: 'Folgen verarbeitet',
      creators: '100+',
      creatorsLabel: 'Zufriedene Creator',
      timeSaved: '2.000+',
      timeSavedLabel: 'Gesparte Stunden',
      rating: '4,8/5',
      ratingLabel: 'Nutzerbewertung',
      isActive: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('en');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/landing/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.stats && data.stats.length > 0) {
          const statsMap = data.stats.reduce((acc: any, stat: LandingStats) => {
            acc[stat.locale] = stat;
            return acc;
          }, {});
          setStats(prev => ({ ...prev, ...statsMap }));
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/landing/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: Object.values(stats) })
      });

      if (response.ok) {
        showToast('Stats updated successfully!', 'success');
        fetchStats();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      showToast('Failed to save stats', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateStat = (locale: string, field: keyof LandingStats, value: string | boolean) => {
    setStats(prev => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value
      }
    }));
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
            <h1 className="text-3xl font-bold text-gray-900">Landing Page Stats</h1>
            <p className="text-gray-600 mt-2">Manage the statistics shown in your homepage hero section</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
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

        {/* Stats Form */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Episodes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Episodes Count
              </label>
              <input
                type="text"
                value={stats[activeTab]?.episodes || ''}
                onChange={(e) => updateStat(activeTab, 'episodes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 500+, 1,000+, 10K+"
              />
              <input
                type="text"
                value={stats[activeTab]?.episodesLabel || ''}
                onChange={(e) => updateStat(activeTab, 'episodesLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                placeholder="Label (e.g., Episodes Processed)"
              />
            </div>

            {/* Creators */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Creators Count
              </label>
              <input
                type="text"
                value={stats[activeTab]?.creators || ''}
                onChange={(e) => updateStat(activeTab, 'creators', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 100+, 500+, 1K+"
              />
              <input
                type="text"
                value={stats[activeTab]?.creatorsLabel || ''}
                onChange={(e) => updateStat(activeTab, 'creatorsLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                placeholder="Label (e.g., Happy Creators)"
              />
            </div>

            {/* Time Saved */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Saved
              </label>
              <input
                type="text"
                value={stats[activeTab]?.timeSaved || ''}
                onChange={(e) => updateStat(activeTab, 'timeSaved', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2,000+, 10K+, 50K+"
              />
              <input
                type="text"
                value={stats[activeTab]?.timeSavedLabel || ''}
                onChange={(e) => updateStat(activeTab, 'timeSavedLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                placeholder="Label (e.g., Hours Saved)"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Rating
              </label>
              <input
                type="text"
                value={stats[activeTab]?.rating || ''}
                onChange={(e) => updateStat(activeTab, 'rating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 4.8/5, 4.9★, 98%"
              />
              <input
                type="text"
                value={stats[activeTab]?.ratingLabel || ''}
                onChange={(e) => updateStat(activeTab, 'ratingLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                placeholder="Label (e.g., User Rating)"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-900 text-white rounded-lg p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-black text-green-400 mb-2">
                    {stats[activeTab]?.episodes}
                  </div>
                  <div className="text-gray-300 font-medium">
                    {stats[activeTab]?.episodesLabel}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-400 mb-2">
                    {stats[activeTab]?.creators}
                  </div>
                  <div className="text-gray-300 font-medium">
                    {stats[activeTab]?.creatorsLabel}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-400 mb-2">
                    {stats[activeTab]?.timeSaved}
                  </div>
                  <div className="text-gray-300 font-medium">
                    {stats[activeTab]?.timeSavedLabel}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-400 mb-2">
                    {stats[activeTab]?.rating}
                  </div>
                  <div className="text-gray-300 font-medium">
                    {stats[activeTab]?.ratingLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Business Tips */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-blue-900 font-semibold mb-2">💡 Tips for New Business</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Start conservative: 50+ creators, 500+ episodes (believable for new business)</li>
              <li>• Use time-based metrics: "2,000+ hours saved" (cumulative)</li>
              <li>• High rating is OK: "4.8/5" from early users is believable</li>
              <li>• Update monthly as you grow - track real metrics</li>
              <li>• Consider "Beta Users" or "Early Access" instead of "Customers"</li>
            </ul>
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
