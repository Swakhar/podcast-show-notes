import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import AdminLayout from '../../../components/admin/AdminLayout';
import Link from 'next/link';

interface LandingStats {
  id: string;
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

export default function LandingContentAdmin() {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState<LandingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocale, setSelectedLocale] = useState('en');

  useEffect(() => {
    fetchLandingContent();
  }, []);

  const fetchLandingContent = async () => {
    try {
      const response = await fetch('/api/admin/landing/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Landing Page Content</h1>
          <div className="flex gap-2">
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Stats Section */}
          <Link href="/admin/landing/stats" className="group block">
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📊 Stats Section</h3>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Manage the statistics displayed on your homepage</p>
              <div className="mt-4 text-xs text-gray-500">
                Episodes, Creators, Time Saved, Rating
              </div>
            </div>
          </Link>

          {/* Features Section */}
          <Link href="/admin/landing/features" className="group block">
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">⚡ Features</h3>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Add and edit your product features</p>
              <div className="mt-4 text-xs text-gray-500">
                Icons, titles, descriptions, benefits
              </div>
            </div>
          </Link>

          {/* Testimonials Section */}
          <Link href="/admin/landing/testimonials" className="group block">
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">💬 Testimonials</h3>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Manage customer testimonials and reviews</p>
              <div className="mt-4 text-xs text-gray-500">
                Names, quotes, companies, ratings
              </div>
            </div>
          </Link>

          {/* Pricing Section */}
          <Link href="/admin/landing/pricing" className="group block">
            <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">💰 Pricing</h3>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Update pricing plans and features</p>
              <div className="mt-4 text-xs text-gray-500">
                Plans, prices, features, descriptions
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 New Business Setup</h3>
              <p className="text-blue-700 text-sm mb-4">
                Since you're just starting, consider these initial steps:
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Start with conservative stats (100+ episodes, 50+ creators)</li>
                <li>• Focus on feature benefits over user count</li>
                <li>• Use "Early Access" instead of testimonials</li>
                <li>• Keep pricing simple and competitive</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-2">📈 Growth Strategy</h3>
              <p className="text-green-700 text-sm mb-4">
                Plan your content evolution:
              </p>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Update stats monthly as you grow</li>
                <li>• Collect real testimonials from early users</li>
                <li>• A/B test different feature presentations</li>
                <li>• Monitor conversion rates by section</li>
              </ul>
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
