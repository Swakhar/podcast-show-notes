import { useState, useEffect } from "react";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import Link from "next/link";
import AdminLayout from "../../../components/admin/AdminLayout";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  published_at: string;
  created_at: string;
  views: number;
  author: { name: string };
}

export default function BlogAdmin() {
  const { t } = useTranslation('admin');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('blog.confirmDelete'))) return;
    
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      fetchPosts(); // Refresh list
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('blog.title')}</h1>
          <Link
            href="/admin/blog/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ {t('blog.newPost')}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    {t('blog.table.title')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    {t('blog.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    {t('blog.table.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    {t('blog.table.views')}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    {t('blog.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {post.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(`blog.status.${post.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{post.views}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link 
                          href={`/admin/blog/${post.id}/edit`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {t('common.edit')}
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
