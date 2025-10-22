import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]';
import AdminLayout from '../../../../components/admin/AdminLayout';
import BlogEditor from '../../../../components/admin/BlogEditor';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED';
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export default function EditBlogPost() {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
      } else {
        throw new Error('Failed to fetch post');
      }
    } catch (error) {
      alert(t('blog.errors.fetchFailed'));
      router.push('/admin/blog');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async (postData: BlogPost) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      alert(t('blog.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p>{t('blog.errors.notFound')}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <BlogEditor post={post} onSave={handleSave} loading={loading} />
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
