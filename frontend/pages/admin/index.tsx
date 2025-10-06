import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  blogPosts: number;
  recentJobs: number;
  totalJobs: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    blogPosts: 0,
    recentJobs: 0,
    totalJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    
    // Check if user is admin
    if (!(session.user as any)?.is_admin) {
      router.push("/");
      return;
    }

    fetchDashboardStats();
  }, [session, status, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!session) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <div className="text-sm text-gray-500">
            {t('dashboard.lastUpdated')}: {new Date().toLocaleString()}
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.totalUsers')}</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.activeSubscriptions')}</h3>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? '...' : stats.activeSubscriptions.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.monthlyRevenue')}</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? '...' : formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.blogPosts')}</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {loading ? '...' : stats.blogPosts.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity.title')}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{stats.recentJobs} {t('dashboard.recentActivity.newJobs')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">{t('dashboard.recentActivity.totalJobs', { count: stats.totalJobs })}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/admin/blog/new" className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl transition-colors group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              📝 {t('dashboard.quickActions.newBlogPost.title')}
            </h3>
            <p className="text-blue-100">{t('dashboard.quickActions.newBlogPost.description')}</p>
          </Link>
          
          <Link href="/admin/users" className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl transition-colors group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              👥 {t('dashboard.quickActions.manageUsers.title')}
            </h3>
            <p className="text-green-100">{t('dashboard.quickActions.manageUsers.description')}</p>
          </Link>
          
          <Link href="/admin/analytics" className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl transition-colors group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              📊 {t('dashboard.quickActions.analytics.title')}
            </h3>
            <p className="text-purple-100">{t('dashboard.quickActions.analytics.description')}</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['admin', 'common'])),
    },
  };
};
