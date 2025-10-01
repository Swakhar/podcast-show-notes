import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Terms() {
  const lastUpdated = "2. Oktober 2025";

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
              <h1 className="text-4xl lg:text-5xl font-black mb-4">Allgemeine Geschäftsbedingungen</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Bitte lesen Sie diese Bedingungen sorgfältig durch, bevor Sie CastLumens KI-gestützte Podcast-Services nutzen.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Letzte Aktualisierung: {lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="prose prose-lg prose-gray max-w-none">
                {/* Company Info */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Anbieter</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>DataFiora IT - Pratyushi Roy Oishee</strong></p>
                    <p>Falltorstraße 2, 63486 Bruchköbel, Deutschland</p>
                    <p>E-Mail: <a href="mailto:roy302156@gmail.com" className="text-blue-600 hover:text-blue-800">roy302156@gmail.com</a></p>
                    <p>Telefon: 01629334092</p>
                  </div>
                </div>

                {/* Quick Navigation */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Schnellnavigation</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <a href="#acceptance" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Geltungsbereich
                    </a>
                    <a href="#service-use" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Nutzung der Services
                    </a>
                    <a href="#billing" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Abrechnung & Abonnements
                    </a>
                    <a href="#liability" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Haftungsbeschränkung
                    </a>
                    <a href="#governing-law" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Anwendbares Recht
                    </a>
                    <a href="#contact" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                      Kontakt
                    </a>
                  </div>
                </div>

                <section id="acceptance" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                    Geltungsbereich
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Durch den Zugriff auf oder die Nutzung der CastLumen-Services erklären Sie sich mit diesen Allgemeinen Geschäftsbedingungen und allen geltenden Gesetzen und Vorschriften einverstanden. Wenn Sie diesen Bedingungen nicht zustimmen, ist Ihnen die Nutzung dieser Website und unserer Services untersagt.
                  </p>
                </section>

                <section id="service-use" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                    Nutzung der Services
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Sie dürfen CastLumens KI-gestützte Content-Generierungsservices unter folgenden Bedingungen nutzen:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Erlaubte Nutzung:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Upload von Audio-Inhalten, die Sie besitzen oder zu deren Nutzung Sie berechtigt sind
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Generierung von Inhalten für kommerzielle und private Zwecke
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Teilen generierter Inhalte auf Ihren Plattformen
                        </li>
                      </ul>
                    </div>
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Verbotene Nutzung:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Upload rechtswidriger, schädlicher oder urheberrechtlich geschützter Inhalte ohne Erlaubnis
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reverse Engineering oder Ausnutzung unserer KI-Systeme
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Weitergabe von Account-Zugangsdaten oder Überschreitung der Nutzungslimits
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section id="billing" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                    Abrechnung & Abonnements
                  </h2>
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Abonnement-Zahlungen werden über Stripe abgewickelt und unterliegen folgenden Bedingungen:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3">💳 Zahlungsbedingungen</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Abonnements verlängern sich automatisch monatlich</li>
                          <li>• Kündigung jederzeit über das Billing-Portal möglich</li>
                          <li>• Keine Rückerstattung für Teilmonate</li>
                          <li>• 30 Tage Geld-zurück-Garantie</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-3">📊 Nutzungslimits</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li>• Limits werden monatlich am Abrechnungsdatum zurückgesetzt</li>
                          <li>• Überschreitung kann zur Service-Sperrung führen</li>
                          <li>• Upgrade jederzeit für höhere Limits möglich</li>
                          <li>• Fair-Use-Policy gilt für unbegrenzte Pläne</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="liability" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                    Haftungsbeschränkung
                  </h2>
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <p className="text-gray-700 leading-relaxed">
                      CastLumen wird "wie besehen" ohne Gewährleistungen jeglicher Art bereitgestellt. Soweit gesetzlich zulässig, schließen wir alle Gewährleistungen aus und beschränken unsere Haftung für Schäden aus der Nutzung unseres Services. Obwohl wir uns um Genauigkeit bemühen, sollten KI-generierte Inhalte vor der Veröffentlichung überprüft werden.
                    </p>
                  </div>
                </section>

                <section id="governing-law" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                    Anwendbares Recht
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Diese Bedingungen unterliegen deutschem Recht. Soweit gesetzlich zulässig, ist der Gerichtsstand Hanau, Deutschland.
                  </p>
                </section>

                <section id="contact" className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                    Kontakt
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Bei Fragen zu diesen Allgemeinen Geschäftsbedingungen kontaktieren Sie uns:
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a href="mailto:roy302156@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        E-Mail senden
                      </a>
                      <div className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        01629334092
                      </div>
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
