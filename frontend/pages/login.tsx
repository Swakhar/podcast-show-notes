import { useState } from "react";
import { signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { useToast } from "../contexts/ToastContext";

const SITE_KEY = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;

export default function Login() {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const [mode, setMode] = useState<"login"|"register">("login");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      showToast(t('login.errors.passwordMismatch'), "error");
      return;
    }
    
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword: confirm, captchaToken }),
    });
    setLoading(false);
    
    if (!res.ok) {
      const errorData = await res.json();
      showToast(errorData.error || t('login.errors.registrationFailed'), "error");
      return;
    }

    const r = await signIn("credentials", { redirect: false, email, password });
    if (r?.error) {
      showToast(r.error, "error");
      return;
    }
    window.location.href = "/";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    
    if (res?.error) {
      showToast(res.error, "error");
      return;
    }
    window.location.href = "/";
  }

  return (
    <>
      <Head>
        <title>{mode === "login" ? t('login.signIn.title') : t('login.register.title')}</title>
        <meta name="description" content={mode === "login" ? t('login.signIn.metaDescription') : t('login.register.metaDescription')} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <img src="/castlumen-wordmark.svg" alt="CastLumen" className="h-10 w-auto" />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              {mode === "login" ? t('login.header.welcomeBack') : t('login.header.createAccount')}
            </h1>
            <p className="text-gray-600">
              {mode === "login" 
                ? t('login.header.signInSubtitle')
                : t('login.header.registerSubtitle')
              }
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Mode Switcher */}
            <div className="border-b border-gray-200 p-6 pb-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                    mode === "login" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setMode("login")}
                >
                  {t('login.tabs.signIn')}
                </button>
                <button 
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                    mode === "register" 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => setMode("register")}
                >
                  {t('login.tabs.signUp')}
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              {mode === "register" ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('login.form.fields.fullName')}
                    </label>
                    <input 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      placeholder={t('login.form.fields.fullNamePlaceholder')}
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('login.form.fields.email')}
                    </label>
                    <input 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      type="email" 
                      placeholder={t('login.form.fields.emailPlaceholder')}
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('login.form.fields.password')}
                    </label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        type={showPassword ? "text" : "password"} 
                        placeholder={t('login.form.fields.createPasswordPlaceholder')}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m0 0l4.242 4.242M12 12l-4.242-4.242" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          )}
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('login.form.fields.passwordRequirement')}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('login.form.fields.confirmPassword')}
                    </label>
                    <input 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      type="password" 
                      placeholder={t('login.form.fields.confirmPasswordPlaceholder')}
                      value={confirm} 
                      onChange={(e) => setConfirm(e.target.value)} 
                      required 
                    />
                  </div>

                  {SITE_KEY && (
                    <div className="flex justify-center">
                      <ReCAPTCHA
                        sitekey={SITE_KEY}
                        onChange={setCaptchaToken}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    </div>
                  )}

                  <button 
                    className="w-full py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                    disabled={loading || (SITE_KEY && !captchaToken)}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                        {t('login.form.buttons.creatingAccount')}
                      </div>
                    ) : (
                      t('login.form.buttons.createAccount')
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    {t('login.form.legal.agreement')}{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800">{t('login.form.legal.termsOfService')}</Link>
                    {" "}{t('login.form.legal.and')}{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800">{t('login.form.legal.privacyPolicy')}</Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('login.form.fields.email')}
                    </label>
                    <input 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                      type="email" 
                      placeholder={t('login.form.fields.emailPlaceholder')}
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('login.form.fields.password')}
                    </label>
                    <div className="relative">
                      <input 
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        type={showPassword ? "text" : "password"} 
                        placeholder={t('login.form.fields.passwordPlaceholder')}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m0 0l4.242 4.242M12 12l-4.242-4.242" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">{t('login.form.fields.rememberMe')}</span>
                    </label>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                      {t('login.form.buttons.forgotPassword')}
                    </Link>
                  </div>

                  <button 
                    className="w-full py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                        {t('login.form.buttons.signingIn')}
                      </div>
                    ) : (
                      t('login.form.buttons.signIn')
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Demo Link */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 text-center">
              <p className="text-sm text-gray-600 mb-3">
                {t('login.demo.tryBefore')}
              </p>
              <Link 
                href="/generate" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
                {t('login.demo.tryFreeDemo')}
              </Link>
            </div>
          </div>

          {/* Alternative Login Methods */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t('login.support.needHelp')}{" "}
              <Link href="/contact" className="text-blue-600 hover:text-blue-800">
                {t('login.support.contactSupport')}
              </Link>
            </p>
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
