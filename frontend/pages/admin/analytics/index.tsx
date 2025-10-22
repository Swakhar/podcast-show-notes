import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import AdminLayout from '../../../components/admin/AdminLayout';

interface AnalyticsData {
  userGrowth: { date: string; count: number }[];
  planDistribution: { plan: string; count: number; percentage: number }[];
  jobStats: {
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    averageProcessingTime: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
  topFeatures: { feature: string; usage: number }[];
}

export default function AnalyticsAdmin() {
  const { t } = useTranslation('admin');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
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

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center py-8">
            <p className="text-gray-500">{t('analytics.error')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('analytics.title')}</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">{t('analytics.timeRange.7d')}</option>
            <option value="30d">{t('analytics.timeRange.30d')}</option>
            <option value="90d">{t('analytics.timeRange.90d')}</option>
            <option value="1y">{t('analytics.timeRange.1y')}</option>
          </select>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('analytics.planDistribution.title')}
            </h2>
            <div className="space-y-4">
              {analytics.planDistribution.map((item) => (
                <div key={item.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      item.plan === 'FREE' ? 'bg-gray-400' :
                      item.plan === 'PRO' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="font-medium">{item.plan}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{item.count}</div>
                    <div className="text-sm text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('analytics.jobStats.title')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.jobStats.totalJobs}
                </div>
                <div className="text-sm text-gray-600">{t('analytics.jobStats.total')}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.jobStats.successfulJobs}
                </div>
                <div className="text-sm text-gray-600">{t('analytics.jobStats.successful')}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.jobStats.failedJobs}
                </div>
                <div className="text-sm text-gray-600">{t('analytics.jobStats.failed')}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analytics.jobStats.averageProcessingTime)}s
                </div>
                <div className="text-sm text-gray-600">{t('analytics.jobStats.avgTime')}</div>
              </div>
            </div>
          </div>

          {/* User Growth Chart (Simple representation) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('analytics.userGrowth.title')}
            </h2>
            <div className="space-y-2">
              {analytics.userGrowth.slice(-7).map((item, index) => (
                <div key={item.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${(item.count / Math.max(...analytics.userGrowth.map(u => u.count))) * 100}px` }}
                    ></div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Features */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('analytics.topFeatures.title')}
            </h2>
            <div className="space-y-3">
              {analytics.topFeatures.map((feature, index) => (
                <div key={feature.feature} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{feature.feature}</span>
                  </div>
                  <span className="text-gray-600">{feature.usage}</span>
                </div>
              ))}
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
