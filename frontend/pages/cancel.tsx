import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

export default function Success() {
  const { t } = useTranslation('common');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Head>
        <title>{t('cancel.title')}</title>
        <meta name="description" content={t('cancel.metaDescription')} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-8">
              <img src="/castlumen-wordmark.svg" alt="CastLumen" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 px-8 py-12 text-center border-b border-gray-200">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-black text-gray-900 mb-4">
                {t('cancel.hero.title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {t('cancel.hero.subtitle')}
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-8">
                {/* Getting Started */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {t('cancel.gettingStarted.title')}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {t('cancel.gettingStarted.description')}
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span>{t('cancel.gettingStarted.items.explore')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span>{t('cancel.gettingStarted.items.helpCenter')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 font-bold">•</span>
                      <span>{t('cancel.gettingStarted.items.support')}</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      href="/generate" 
                      className="px-6 py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-center"
                    >
                      {t('cancel.actions.startGenerating')}
                    </Link>
                    <Link 
                      href="/#pricing" 
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      {t('cancel.actions.viewPricing')}
                    </Link>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    {t('cancel.countdown.redirecting')} {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center pb-8">
              <p className="text-sm text-gray-500">
                {t('cancel.footer.questions')}{" "}
                <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                  {t('cancel.footer.contactSupport')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
