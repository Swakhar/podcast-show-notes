import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Impressum() {
  return (
    <>
      <Head>
        <title>Impressum – CastLumen</title>
        <meta name="description" content="Legal information and imprint for CastLumen" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <SiteHeader />
      
      <main className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 min-h-screen">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-black mb-4">Impressum</h1>
              <p className="text-xl text-blue-100">Legal Information</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                {/* Company Information */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Dienstanbieter
                  </h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Firmenanschrift</h3>
                        <p className="text-gray-700 leading-relaxed">
                          <strong>DataFiora IT - Pratyushi Roy Oishee</strong><br/>
                          Falltorstraße 2<br/>
                          63486 Bruchköbel<br/>
                          Deutschland
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Kontakt</h3>
                        <div className="space-y-2 text-gray-700">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a href="mailto:roy302156@gmail.com" className="text-blue-600 hover:text-blue-800">
                              roy302156@gmail.com
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>01629334092</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Business Activity */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2m8 0v8a2 2 0 01-2 2H10a2 2 0 01-2-2v-8" />
                      </svg>
                    </div>
                    Angemeldete Tätigkeit
                  </h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700 mb-4">
                      <strong>IT-Dienstleistungen, Softwareentwicklungen und IT-Beratung</strong>
                    </p>
                    <div className="text-sm text-gray-600">
                      <p>Datum des Beginns der angemeldeten Tätigkeit: <strong>10. September 2025</strong></p>
                    </div>
                  </div>
                </section>

                {/* Business Owner */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Vertreten durch
                  </h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700">
                      <strong>Pratyushi Roy Oishee</strong> (Inhaberin)
                    </p>
                  </div>
                </section>

                {/* Content Responsibility */}
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.178 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    Inhaltlich Verantwortlicher
                  </h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700">
                      Gemäß § 18 Abs. 2 MStV:<br/>
                      <strong>Pratyushi Roy Oishee</strong><br/>
                      Anschrift wie oben
                    </p>
                  </div>
                </section>

                {/* Legal Disclaimers */}
                <section className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Haftung für Inhalte</h2>
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <p className="text-gray-700 leading-relaxed">
                        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
                        allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
                        unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
                        Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Haftung für Links</h2>
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <p className="text-gray-700 leading-relaxed">
                        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                        Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten 
                        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Urheberrecht</h2>
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                      <p className="text-gray-700 leading-relaxed">
                        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
                        Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
                        Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Datenschutz</h2>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. 
                        Soweit auf unseren Seiten personenbezogene Daten erhoben werden, erfolgt dies stets auf freiwilliger Basis.
                      </p>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          Weitere Informationen finden Sie in unserer{" "}
                          <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">
                            Datenschutzerklärung
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Last Updated */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Letzte Aktualisierung: 2. Oktober 2025</span>
                    <div className="flex items-center gap-4">
                      <a href="/privacy" className="hover:text-gray-700">Datenschutz</a>
                      <a href="/terms" className="hover:text-gray-700">AGB</a>
                    </div>
                  </div>
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
