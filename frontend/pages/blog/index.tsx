import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import SiteHeader from '../../components/SiteHeader';
import SiteFooter from '../../components/SiteFooter';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  views: number;
  author: { 
    name: string;
    email: string;
  };
}

export default function BlogIndex() {
  const { t } = useTranslation('common');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setError(null);
      const res = await fetch('/api/blog');
      
      if (!res.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>Blog – CastLumen</title>
        <meta name="description" content="Latest insights on podcast content creation and AI-powered tools for podcasters" />
        <meta name="keywords" content="podcast, blog, AI, content creation, show notes, transcription" />
      </Head>
      
      <SiteHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              CastLumen Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Latest insights on podcast content creation and AI-powered tools for content creators
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading blog posts...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchPosts}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
                <p className="text-gray-600">
                  We're working on creating great content for you. Check back soon!
                </p>
              </div>
            </div>
          )}

          {/* Blog Posts */}
          {!loading && !error && posts.length > 0 && (
            <div className="space-y-8">
              {posts.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-8">
                    {/* Post Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                      <time dateTime={post.published_at}>
                        {formatDate(post.published_at)}
                      </time>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>By {post.author.name || 'CastLumen Team'}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views} views
                      </span>
                    </div>
                    
                    {/* Post Title */}
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    
                    {/* Post Excerpt */}
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                      {post.excerpt}
                    </p>
                    
                    {/* Read More Link */}
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group transition-all"
                    >
                      Read full article
                      <svg 
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Newsletter CTA */}
          {!loading && posts.length > 0 && (
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                Get the latest podcast tips and AI insights delivered to your inbox
              </p>
              <Link 
                href="/#newsletter"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Subscribe to Newsletter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <SiteFooter />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
