import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import AdminLayout from '../../../components/admin/AdminLayout';
import BlogEditor from '../../../components/admin/BlogEditor';

export default function NewBlogPost() {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = async (postData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        router.push('/admin/blog');
      } else {
        throw new Error('Failed to save post');
      }
    } catch (error) {
      alert(t('blog.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <BlogEditor onSave={handleSave} loading={loading} />
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
