import Link from "next/link";
import { useTranslation } from 'next-i18next';

export default function SiteFooter() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link href="/" className="inline-block">
                <img 
                  src="/castlumen-wordmark-white.svg" 
                  alt="CastLumen" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <p className="text-gray-300 text-lg mb-6 max-w-md">
              {t('footer.company.description')}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://linkedin.com/company/castlumen" 
                className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label={t('footer.company.socialLabels.linkedin')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com/@castlumen" 
                className="w-10 h-10 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label={t('footer.company.socialLabels.youtube')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-xl mb-6 text-white">{t('footer.navigation.product.title')}</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/#features" className="text-gray-300 hover:text-[#9CEE69] transition-colors flex items-center gap-2">
                  <span>{t('footer.navigation.product.features')}</span>
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-gray-300 hover:text-[#9CEE69] transition-colors flex items-center gap-2">
                  <span>{t('footer.navigation.product.pricing')}</span>
                </Link>
              </li>
              <li>
                <Link href="/generate" className="text-gray-300 hover:text-[#9CEE69] transition-colors flex items-center gap-2">
                  <span>{t('footer.navigation.product.tryDemo')}</span>
                  <span className="px-2 py-0.5 bg-[#9CEE69] text-gray-900 text-xs font-bold rounded-full">
                    {t('footer.navigation.product.freeBadge')}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-300 hover:text-[#9CEE69] transition-colors">
                  {t('footer.navigation.product.templates')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-xl mb-6 text-white">{t('footer.navigation.company.title')}</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#9CEE69] transition-colors">
                  {t('footer.navigation.company.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-[#9CEE69] transition-colors">
                  {t('footer.navigation.company.blog')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#9CEE69] transition-colors">
                  {t('footer.navigation.company.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold mb-4">{t('footer.newsletter.title')}</h3>
            <p className="text-gray-300 mb-6">{t('footer.newsletter.description')}</p>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder={t('footer.newsletter.emailPlaceholder')}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#9CEE69] focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-200"
              >
                {t('footer.newsletter.subscribeButton')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              {t('footer.bottom.copyright', { year: currentYear })}
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                {t('footer.bottom.legal.privacy')}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                {t('footer.bottom.legal.terms')}
              </Link>
              <Link href="/impressum" className="text-gray-400 hover:text-white transition-colors">
                {t('footer.bottom.legal.impressum')}
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                {t('footer.bottom.legal.cookies')}
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{t('footer.bottom.tagline.madeWith')}</span>
              <span className="text-red-400">❤️</span>
              <span>{t('footer.bottom.tagline.forCreators')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
