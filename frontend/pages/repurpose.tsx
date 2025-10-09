import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import ContentRepurposingPanel from '../components/ContentRepurposingPanel';

export default function RepurposePage() {
  const { data: session } = useSession();
  const { t } = useTranslation('common');

  if (!session) {
    return (
      <>
        <Head>
          <title>Content Repurposing | CastLumen</title>
        </Head>
        <SiteHeader />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h1>
            <p className="text-gray-600">Please sign in to access content repurposing features.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Content Repurposing | CastLumen</title>
        <meta name="description" content="Transform your podcast content into multiple formats for different platforms" />
      </Head>
      <SiteHeader />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">🔄 Content Repurposing</h1>
            <p className="text-xl text-gray-600">Transform your existing content into multiple formats</p>
          </div>
          
          {/* Add your repurposing interface here */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <p className="text-gray-600 text-center">
              Select content from your previous jobs to repurpose into different formats.
            </p>
          </div>
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
