import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
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
      console.error('Error saving post:', error);
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

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['admin', 'common'])),
    },
  };
};
