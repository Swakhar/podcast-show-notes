import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

export default function Success() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { update } = useSession();
  const [msg, setMsg] = useState(t('success.status.activating'));
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let mounted = true;

    async function run() {
      const sid = new URLSearchParams(window.location.search).get("session_id");
      if (!sid) {
        setMsg(t('success.status.missingSession'));
        setStatus("error");
        setTimeout(() => router.replace("/"), 1200);
        return;
      }

      // give Stripe a breath just in case
      await new Promise(r => setTimeout(r, 600));

      // confirm with our server (fallback to webhook)
      const r = await fetch("/api/stripe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      });
      
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setMsg(j.error || t('success.status.activationFailed'));
        setStatus("error");
        setTimeout(() => router.replace("/"), 1500);
        return;
      }

      setMsg(t('success.status.active'));
      setStatus("success");

      // refresh session payload -> brings plan/status into client
      try { await update(); } catch {}

      setTimeout(() => {
        if (mounted) router.replace("/?upgraded=1");
      }, 1200);
    }

    run();
    return () => { mounted = false; };
  }, [router, update, t]);

  return (
    <>
      <Head>
        <title>{t('success.title')}</title>
        <meta name="description" content={t('success.metaDescription')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                {status === "loading" ? (
                  <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                ) : status === "success" ? (
                  <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h1 className="text-2xl font-bold">
                {status === "loading" ? t('success.header.settingUp') : 
                 status === "success" ? t('success.header.welcome') : 
                 t('success.header.error')}
              </h1>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">{msg}</p>
              
              {status === "success" && (
                <div className="space-y-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">{t('success.content.whatsNext.title')}</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>{t('success.content.whatsNext.steps.upload')}</li>
                      <li>{t('success.content.whatsNext.steps.generate')}</li>
                      <li>{t('success.content.whatsNext.steps.social')}</li>
                      <li>{t('success.content.whatsNext.steps.seo')}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => router.replace("/")}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {status === "success" ? t('success.buttons.startCreating') : t('success.buttons.goToDashboard')}
                </button>
                
                {status === "success" && (
                  <Link 
                    href="/generate"
                    className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                  >
                    {t('success.buttons.tryGenerator')}
                  </Link>
                )}
              </div>

              {/* Support Link */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">{t('success.support.needHelp')}</p>
                <Link href="/contact" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {t('success.support.contactSupport')}
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {status === "success" && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {t('success.confirmation.emailSent')}
              </p>
            </div>
          )}
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
