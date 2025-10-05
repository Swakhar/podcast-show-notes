import Head from "next/head";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function CookiePolicy() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('cookies.title')}</title>
        <meta name="description" content={t('cookies.metaDescription')} />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('cookies.hero.badge')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-4">{t('cookies.hero.title')}</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                {t('cookies.hero.subtitle')}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('cookies.hero.lastUpdatedLabel')} {t('cookies.lastUpdated')}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="prose prose-lg prose-gray max-w-none">
                {/* What are cookies */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{t('cookies.whatAreCookies.title')}</h3>
                  <p className="text-gray-700 mb-0">
                    {t('cookies.whatAreCookies.description')}
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                    {t('cookies.howWeUseCookies.title')}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {t('cookies.howWeUseCookies.description')}
                  </p>

                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-3">{t('cookies.howWeUseCookies.essential.title')}</h4>
                      <p className="text-gray-700 mb-3">{t('cookies.howWeUseCookies.essential.description')}</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Authentifizierung:</strong> {t('cookies.howWeUseCookies.essential.items.authentication')}</li>
                        <li>• <strong>Sicherheit:</strong> {t('cookies.howWeUseCookies.essential.items.security')}</li>
                        <li>• <strong>Einstellungen:</strong> {t('cookies.howWeUseCookies.essential.items.preferences')}</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3">{t('cookies.howWeUseCookies.analytics.title')}</h4>
                      <p className="text-gray-700 mb-3">{t('cookies.howWeUseCookies.analytics.description')}</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Google Analytics:</strong> {t('cookies.howWeUseCookies.analytics.items.googleAnalytics')}</li>
                        <li>• <strong>Nutzungsdaten:</strong> {t('cookies.howWeUseCookies.analytics.items.usageData')}</li>
                        <li>• <strong>Performance:</strong> {t('cookies.howWeUseCookies.analytics.items.performance')}</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-3">{t('cookies.howWeUseCookies.marketing.title')}</h4>
                      <p className="text-gray-700 mb-3">{t('cookies.howWeUseCookies.marketing.description')}</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Conversion-Tracking:</strong> {t('cookies.howWeUseCookies.marketing.items.conversionTracking')}</li>
                        <li>• <strong>Retargeting:</strong> {t('cookies.howWeUseCookies.marketing.items.retargeting')}</li>
                        <li>• <strong>Social Media:</strong> {t('cookies.howWeUseCookies.marketing.items.socialMedia')}</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                    {t('cookies.thirdPartyCookies.title')}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {t('cookies.thirdPartyCookies.description')}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• <strong>Stripe:</strong> {t('cookies.thirdPartyCookies.providers.stripe')}</li>
                      <li>• <strong>Google Analytics:</strong> {t('cookies.thirdPartyCookies.providers.googleAnalytics')}</li>
                      <li>• <strong>YouTube:</strong> {t('cookies.thirdPartyCookies.providers.youtube')}</li>
                      <li>• <strong>Social Media Plattformen:</strong> {t('cookies.thirdPartyCookies.providers.socialMedia')}</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                    {t('cookies.cookieManagement.title')}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {t('cookies.cookieManagement.description')}
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">{t('cookies.cookieManagement.browserControls.title')}</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• <strong>Chrome:</strong> {t('cookies.cookieManagement.browserControls.chrome')}</li>
                      <li>• <strong>Firefox:</strong> {t('cookies.cookieManagement.browserControls.firefox')}</li>
                      <li>• <strong>Safari:</strong> {t('cookies.cookieManagement.browserControls.safari')}</li>
                      <li>• <strong>Edge:</strong> {t('cookies.cookieManagement.browserControls.edge')}</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                    {t('cookies.cookieConsent.title')}
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {t('cookies.cookieConsent.description')}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>{t('cookies.cookieConsent.options.acceptAll')}</li>
                        <li>{t('cookies.cookieConsent.options.essentialOnly')}</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>{t('cookies.cookieConsent.options.customize')}</li>
                        <li>{t('cookies.cookieConsent.options.changeAnytime')}</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('cookies.contact.title')}</h3>
                  <p className="text-gray-700 mb-6">
                    {t('cookies.contact.description')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:roy302156@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {t('cookies.contact.sendEmail')}
                    </a>
                    <span className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {t('cookies.contact.phone')}
                    </span>
                  </div>
                </section>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
                  <h3 className="text-yellow-900 font-bold mb-3">{t('cookies.changes.title')}</h3>
                  <p className="text-yellow-800 mb-0">
                    {t('cookies.changes.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
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
