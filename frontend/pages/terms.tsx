import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Terms() {
  const lastUpdated = "September 13, 2025";

  return (
    <>
      <Head>
        <title>Terms of Service – CastLumen</title>
        <meta name="description" content="Terms of Service for CastLumen AI podcast show notes generator. Learn about our service terms, billing, and user responsibilities." />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-black mb-4">Terms of Service</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Please read these terms carefully before using CastLumen's AI-powered podcast content generation services.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="prose prose-lg prose-gray max-w-none">
                {/* Quick Navigation */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Navigation</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <a href="#acceptance" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Acceptance of Terms
                    </a>
                    <a href="#service-use" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Use of Service
                    </a>
                    <a href="#billing" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Billing & Subscriptions
                    </a>
                    <a href="#liability" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Limitation of Liability
                    </a>
                    <a href="#governing-law" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Governing Law
                    </a>
                    <a href="#contact" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Contact Information
                    </a>
                  </div>
                </div>

                <section id="acceptance" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                    Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing or using CastLumen's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site and our services.
                  </p>
                </section>

                <section id="service-use" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                    Use of Service
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      You may use CastLumen's AI-powered content generation services subject to the following conditions:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Permitted Uses:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Upload audio content you own or have rights to use
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Generate content for commercial and personal use
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Share generated content on your platforms
                        </li>
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Prohibited Uses:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Upload unlawful, harmful, or copyrighted content without permission
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Attempt to reverse engineer or exploit our AI systems
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Share account credentials or exceed usage limits
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="billing" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                    Billing & Subscriptions
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Subscription payments are processed through Stripe and are subject to the following terms:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3">💳 Payment Terms</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Subscriptions renew automatically monthly</li>
                          <li>• Cancel anytime via billing portal</li>
                          <li>• No refunds for partial months</li>
                          <li>• 30-day money-back guarantee</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-3">📊 Usage Limits</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Limits reset monthly on billing date</li>
                          <li>• Overage may result in service suspension</li>
                          <li>• Upgrade anytime for higher limits</li>
                          <li>• Fair use policy applies to unlimited plans</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="liability" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                    Limitation of Liability
                  </h2>
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <p className="text-gray-700 leading-relaxed">
                      CastLumen is provided "as is" without warranties of any kind. To the extent permitted by law, we disclaim all warranties and limit our liability for damages arising from the use of our service. While we strive for accuracy, AI-generated content should be reviewed before publication.
                    </p>
                  </div>
                </section>

                <section id="governing-law" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                    Governing Law
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    These terms are governed by German law. Where legally permitted, the place of jurisdiction is Frankfurt am Main, Germany.
                  </p>
                </section>

                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                    Contact Information
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      If you have questions about these Terms of Service, please contact us:
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a href="mailto:legal@castlumen.com" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Legal Team
                      </a>
                      <Link href="/contact" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </>
  );
}
