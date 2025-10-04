import Head from "next/head";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function About() {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('about.title')} | CastLumen</title>
        <meta name="description" content={t('about.metaDescription')} />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-gray-900 mb-6">
              {t('about.hero.title')}<br/>
              <span className="text-blue-600">{t('about.hero.titleHighlight')}</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.hero.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.mission.title')}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {t('about.mission.paragraph1')}
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                {t('about.mission.paragraph2')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-gray-100 rounded-2xl p-12 text-center">
              <span className="text-6xl block mb-4">🎧</span>
              <div className="text-3xl font-bold text-gray-900">{t('about.stats.episodes')}</div>
              <div className="text-gray-600">{t('about.stats.episodesLabel')}</div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('about.creators.title')}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              {t('about.creators.description')}
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t('about.creators.cta')}
              <span>→</span>
            </a>
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
