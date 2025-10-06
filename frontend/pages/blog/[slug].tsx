import { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { prisma } from '../../lib/prisma';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  views: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  author: { name: string };
}

interface BlogPostPageProps {
  post: BlogPost | null;
}

export default function BlogPost({ post }: BlogPostPageProps) {
  const { t } = useTranslation('common');

  useEffect(() => {
    // Track view when component mounts
    if (post) {
      fetch(`/api/blog/${post.id}/view`, { method: 'POST' });
    }
  }, [post]);

  if (!post) {
    return (
      <>
        <Head>
          <title>{t('blog.postNotFound.title')} – CastLumen</title>
          <meta name="description" content={t('blog.postNotFound.description')} />
        </Head>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('blog.postNotFound.heading')}
            </h1>
            <Link href="/blog" className="text-blue-600 hover:text-blue-700">
              ← {t('blog.postNotFound.backToBlob')}
            </Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>{post.meta_title || post.title} – CastLumen</title>
        <meta name="description" content={post.meta_description || post.title} />
        {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
      </Head>
      
      <SiteHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="mb-8">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('blog.post.backToBlog')}
            </Link>
          </div>

          <article className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <time dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
                <span>•</span>
                <span>{t('blog.post.byAuthor', { author: post.author.name })}</span>
                <span>•</span>
                <span>{t('blog.post.viewCount', { count: post.views })}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                {post.title}
              </h1>
              
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
        </div>
      </div>
      
      <SiteFooter />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  const { slug } = params!;
  
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug: slug as string,
        status: 'PUBLISHED' 
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    });

    if (!post) {
      return { 
        props: { 
          post: null,
          ...(await serverSideTranslations(locale ?? 'en', ['common']))
        } 
      };
    }

    // Convert all Date objects to strings for JSON serialization
    const serializedPost = {
      ...post,
      published_at: post.published_at?.toISOString() || null,
      created_at: post.created_at.toISOString(),
      updated_at: post.updated_at.toISOString(),
    };

    return {
      props: {
        post: serializedPost,
        ...(await serverSideTranslations(locale ?? 'en', ['common']))
      },
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { 
      props: { 
        post: null,
        ...(await serverSideTranslations(locale ?? 'en', ['common']))
      } 
    };
  }
};
