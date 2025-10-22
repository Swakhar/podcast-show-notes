import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import Link from "next/link";
import AdminLayout from "../../components/admin/AdminLayout";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

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
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else if (response.status === 401 || response.status === 403) {
        router.push('/login');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Last Updated: {new Date().toLocaleString()}
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
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
                <h3 className="text-sm font-medium text-gray-600">Active Subscriptions</h3>
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
                <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
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
                <h3 className="text-sm font-medium text-gray-600">Blog Posts</h3>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{stats.recentJobs} new users this week</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">{stats.totalJobs} total users</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/admin/blog/new" className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl transition-colors group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              📝 Create Blog Post
            </h3>
            <p className="text-blue-100">Write and publish new blog content</p>
          </Link>
          
          <Link href="/admin/users" className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-xl transition-colors group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              👥 Manage Users
            </h3>
            <p className="text-green-100">View and manage user accounts</p>
          </Link>
          
          <Link href="/admin/landing" className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-xl transition-colors group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              🎨 Landing Page
            </h3>
            <p className="text-purple-100">Manage homepage content</p>
          </Link>

          <Link href="/admin/analytics" className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-xl transition-colors group">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              📊 Analytics
            </h3>
            <p className="text-orange-100">View detailed analytics</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
    
    // Check authentication
    if (!session) {
      return {
        redirect: {
          destination: '/login?callbackUrl=' + encodeURIComponent('/admin'),
          permanent: false,
        },
      };
    }

    // Check admin privileges
    if (!(session.user as any)?.is_admin) {
      return {
        redirect: {
          destination: '/?error=access_denied',
          permanent: false,
        },
      };
    }

    // Don't pass session in props - we use useSession() in the component
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
