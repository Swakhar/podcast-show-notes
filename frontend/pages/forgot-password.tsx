import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useToast } from "../contexts/ToastContext";

export default function ForgotPassword() {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
        showToast(t('forgotPassword.toast.success'), "success");
      } else {
        const error = await response.json();
        showToast(error.error || t('forgotPassword.toast.error'), "error");
      }
    } catch (error) {
      showToast(t('forgotPassword.toast.error'), "error");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <Head>
          <title>{t('forgotPassword.checkEmailTitle')}</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-6">
                <img src="/castlumen-wordmark.svg" alt="CastLumen" className="h-10 w-auto" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('forgotPassword.success.title')}</h1>
                <p className="text-gray-600 mb-6">
                  {t('forgotPassword.success.message')} <strong>{email}</strong> {t('forgotPassword.success.messageEnd')}
                </p>
                
                <div className="space-y-4">
                  <Link 
                    href="/login"
                    className="w-full block px-4 py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-200 text-center"
                  >
                    {t('forgotPassword.success.backToSignIn')}
                  </Link>
                  
                  <button
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('forgotPassword.success.tryDifferentEmail')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t('forgotPassword.title')}</title>
        <meta name="description" content={t('forgotPassword.metaDescription')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <img src="/castlumen-wordmark.svg" alt="CastLumen" className="h-10 w-auto" />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t('forgotPassword.form.title')}</h1>
            <p className="text-gray-600">{t('forgotPassword.form.subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('forgotPassword.form.emailLabel')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={t('forgotPassword.form.emailPlaceholder')}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                      {t('forgotPassword.form.submitting')}
                    </div>
                  ) : (
                    t('forgotPassword.form.submitButton')
                  )}
                </button>
              </form>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                {t('forgotPassword.form.backToLogin')}{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                  {t('forgotPassword.form.signInHere')}
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
