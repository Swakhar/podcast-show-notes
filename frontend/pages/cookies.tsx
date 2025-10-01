import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function CookiePolicy() {
  const lastUpdated = "2. Oktober 2025";

  return (
    <>
      <Head>
        <title>Cookie Policy – CastLumen</title>
        <meta name="description" content="Learn about how CastLumen uses cookies to improve your experience on our website." />
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
                Cookie Policy
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-4">Cookie-Richtlinie</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Erfahren Sie, wie CastLumen Cookies verwendet, um Ihr Erlebnis auf unserer Website zu verbessern.
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
                {/* What are cookies */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">🍪 Was sind Cookies?</h3>
                  <p className="text-gray-700 mb-0">
                    Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät gespeichert werden, 
                    wenn Sie unsere Website besuchen. Sie helfen uns, Ihnen ein besseres Erlebnis zu bieten und 
                    zu verstehen, wie Sie unseren Service nutzen.
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                    Wie wir Cookies verwenden
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Wir verwenden Cookies für die folgenden Zwecke:
                  </p>

                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-3">🔧 Technisch notwendige Cookies</h4>
                      <p className="text-gray-700 mb-3">Diese Cookies sind für das ordnungsgemäße Funktionieren der Website erforderlich:</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Authentifizierung:</strong> Merken, dass Sie angemeldet sind</li>
                        <li>• <strong>Sicherheit:</strong> Schutz vor Cross-Site-Request-Forgery</li>
                        <li>• <strong>Einstellungen:</strong> Speichern Ihrer Sprach- und Theme-Einstellungen</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3">📊 Analytics-Cookies</h4>
                      <p className="text-gray-700 mb-3">Wir verwenden Analytics-Cookies, um zu verstehen, wie Besucher mit unserer Website interagieren:</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Google Analytics:</strong> Verfolgung von Seitenaufrufen, Nutzerverhalten und Website-Performance</li>
                        <li>• <strong>Nutzungsdaten:</strong> Verstehen, welche Features am beliebtesten sind</li>
                        <li>• <strong>Performance:</strong> Überwachung und Verbesserung der Website-Geschwindigkeit</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-3">🎯 Marketing-Cookies</h4>
                      <p className="text-gray-700 mb-3">Diese Cookies helfen uns, relevante Werbung bereitzustellen:</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Conversion-Tracking:</strong> Messung der Effektivität unserer Marketing-Kampagnen</li>
                        <li>• <strong>Retargeting:</strong> Anzeige relevanter Werbung für Besucher, die unseren Service genutzt haben</li>
                        <li>• <strong>Social Media:</strong> Integration von Social Media-Sharing und -Features</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                    Drittanbieter-Cookies
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Wir arbeiten mit vertrauenswürdigen Drittanbietern zusammen, die möglicherweise Cookies setzen:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• <strong>Stripe:</strong> Für sichere Zahlungsabwicklung</li>
                      <li>• <strong>Google Analytics:</strong> Für Website-Analytics</li>
                      <li>• <strong>YouTube:</strong> Für eingebettete Video-Inhalte</li>
                      <li>• <strong>Social Media Plattformen:</strong> Für Social Media-Integration</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                    Cookie-Verwaltung
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Sie können Cookies über Ihre Browser-Einstellungen kontrollieren:
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Browser-Kontrollen</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• <strong>Chrome:</strong> Einstellungen → Datenschutz und Sicherheit → Cookies und andere Website-Daten</li>
                      <li>• <strong>Firefox:</strong> Einstellungen → Datenschutz & Sicherheit → Cookies und Website-Daten</li>
                      <li>• <strong>Safari:</strong> Einstellungen → Datenschutz → Website-Daten verwalten</li>
                      <li>• <strong>Edge:</strong> Einstellungen → Cookies und Website-Berechtigungen</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                    Cookie-Einwilligung
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Wenn Sie unsere Website zum ersten Mal besuchen, fragen wir Sie um Ihre Einwilligung zur Verwendung nicht-essentieller Cookies. Sie können:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>✓ Alle Cookies akzeptieren</li>
                        <li>✓ Nur essentielle Cookies akzeptieren</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>⚙️ Ihre Einstellungen anpassen</li>
                        <li>🔄 Einstellungen jederzeit ändern</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📞 Kontakt</h3>
                  <p className="text-gray-700 mb-6">
                    Bei Fragen zu unserer Cookie-Richtlinie kontaktieren Sie uns:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:roy302156@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      E-Mail senden
                    </a>
                    <span className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      01629334092
                    </span>
                  </div>
                </section>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
                  <h3 className="text-yellow-900 font-bold mb-3">⚠️ Änderungen an dieser Richtlinie</h3>
                  <p className="text-yellow-800 mb-0">
                    Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren. Wir werden Sie über wesentliche 
                    Änderungen informieren, indem wir die neue Richtlinie auf dieser Seite veröffentlichen und das 
                    Datum der letzten Aktualisierung ändern.
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
