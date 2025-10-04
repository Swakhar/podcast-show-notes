import Head from "next/head";
import { useState } from "react";
import { useTranslation } from 'next-i18next';
import { useToast } from "../contexts/ToastContext";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

export default function Contact() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: t('contact.form.subjects.general'),
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        showToast(t('contact.form.submit.success'), "success");
        setFormData({ name: '', email: '', subject: t('contact.form.subjects.general'), message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      showToast(t('contact.form.submit.error'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('contact.title')}</title>
        <meta name="description" content={t('contact.metaDescription')} />
        <meta name="keywords" content={t('contact.keywords')} />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('contact.hero.badge')}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-4">{t('contact.hero.title')}</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                {t('contact.hero.subtitle')}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('contact.hero.responseTime')}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-3 gap-12">
                
                {/* Contact Methods */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Contact Info */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contact.company.title')}</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>{t('contact.company.name')}</strong></p>
                      <p>{t('contact.company.address')}</p>
                      <p>E-Mail: <a href={`mailto:${t('contact.company.email')}`} className="text-blue-600 hover:text-blue-800">{t('contact.company.email')}</a></p>
                      <p>Telefon: {t('contact.company.phone')}</p>
                    </div>
                  </div>

                  {/* Support Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🎧</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{t('contact.support.title')}</h3>
                        <p className="text-sm text-gray-600">{t('contact.support.subtitle')}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">📧</span>
                        <a href={`mailto:${t('contact.company.email')}`} className="text-blue-600 hover:text-blue-700 font-medium">
                          {t('contact.company.email')}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">⏱️</span>
                        <span className="text-gray-700 text-sm">{t('contact.support.responseTime')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sales Card */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">💼</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{t('contact.sales.title')}</h3>
                        <p className="text-sm text-gray-600">{t('contact.sales.subtitle')}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">📧</span>
                        <a href={`mailto:${t('contact.company.email')}`} className="text-blue-600 hover:text-blue-700 font-medium">
                          {t('contact.company.email')}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">📞</span>
                        <span className="text-gray-700 text-sm">{t('contact.company.phone')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('contact.form.title')}</h2>
                    <p className="text-gray-600">
                      {t('contact.form.subtitle')}
                    </p>
                  </div>

                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.form.success.title')}</h3>
                      <p className="text-gray-600 mb-6">
                        {t('contact.form.success.subtitle')}
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t('contact.form.success.sendAnother')}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('contact.form.fields.name')} {t('contact.form.fields.required')}
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={t('contact.form.fields.namePlaceholder')}
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('contact.form.fields.email')} {t('contact.form.fields.required')}
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder={t('contact.form.fields.emailPlaceholder')}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('contact.form.fields.subject')} {t('contact.form.fields.required')}
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value={t('contact.form.subjects.general')}>{t('contact.form.subjects.general')}</option>
                          <option value={t('contact.form.subjects.support')}>{t('contact.form.subjects.support')}</option>
                          <option value={t('contact.form.subjects.sales')}>{t('contact.form.subjects.sales')}</option>
                          <option value={t('contact.form.subjects.enterprise')}>{t('contact.form.subjects.enterprise')}</option>
                          <option value={t('contact.form.subjects.billing')}>{t('contact.form.subjects.billing')}</option>
                          <option value={t('contact.form.subjects.partnership')}>{t('contact.form.subjects.partnership')}</option>
                          <option value={t('contact.form.subjects.press')}>{t('contact.form.subjects.press')}</option>
                          <option value={t('contact.form.subjects.privacy')}>{t('contact.form.subjects.privacy')}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('contact.form.fields.message')} {t('contact.form.fields.required')}
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                          placeholder={t('contact.form.fields.messagePlaceholder')}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4">
                        <p className="text-xs text-gray-500">
                          {t('contact.form.submit.privacy')}{' '}
                          <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                            {t('contact.form.submit.privacyPolicy')}
                          </a>
                          .
                        </p>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              {t('contact.form.submit.sending')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {t('contact.form.submit.button')}
                              <span>→</span>
                            </span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('contact.faq.title')}</h2>
              <p className="text-gray-600">{t('contact.faq.subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('contact.faq.questions.supportSpeed.question')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.faq.questions.supportSpeed.answer')}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('contact.faq.questions.phoneSupport.question')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.faq.questions.phoneSupport.answer')}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('contact.faq.questions.demo.question')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.faq.questions.demo.answer')}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{t('contact.faq.questions.subscription.question')}</h3>
                <p className="text-gray-600 text-sm">
                  {t('contact.faq.questions.subscription.answer')}
                </p>
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
