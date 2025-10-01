import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Privacy() {
  const lastUpdated = "2. Oktober 2025";

  return (
    <>
      <Head>
        <title>Privacy Policy – CastLumen</title>
        <meta name="description" content="CastLumen's privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR." />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                GDPR Compliant
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-4">Datenschutzerklärung</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Ihre Privatsphäre ist uns wichtig. Erfahren Sie, wie wir Ihre Daten schützen und verarbeiten.
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
                {/* Contact Info */}
                <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Verantwortlicher</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>DataFiora IT - Pratyushi Roy Oishee</strong></p>
                    <p>Falltorstraße 2, 63486 Bruchköbel, Deutschland</p>
                    <p>E-Mail: <a href="mailto:roy302156@gmail.com" className="text-blue-600 hover:text-blue-800">roy302156@gmail.com</a></p>
                    <p>Telefon: 01629334092</p>
                  </div>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                    Verarbeitungstätigkeiten
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Wir verarbeiten personenbezogene Daten zur Bereitstellung unserer KI-gestützten Podcast-Dienste (Registrierung, Login, Abrechnung, Content-Verarbeitung):
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">👤 Account-Daten</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• E-Mail-Adresse</li>
                        <li>• Passwort (gehasht)</li>
                        <li>• Sitzungsdaten</li>
                        <li>• Nutzungsstatistiken</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">💳 Abrechnungsdaten</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Stripe Customer ID</li>
                        <li>• Subscription-Status</li>
                        <li>• Rechnungshistorie</li>
                        <li>• Zahlungsmethoden (bei Stripe)</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">🎵 Inhaltsdaten</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Hochgeladene Audiodateien</li>
                        <li>• Audio-URLs/Links</li>
                        <li>• Generierte Inhalte</li>
                        <li>• Custom Templates</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                    Rechtsgrundlagen
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3">⚖️ DSGVO Artikel 6</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li><strong>lit. b:</strong> Vertragserfüllung (Service-Bereitstellung, Abrechnung)</li>
                        <li><strong>lit. f:</strong> Berechtigte Interessen (Service-Verbesserung, Sicherheit)</li>
                        <li><strong>lit. a:</strong> Einwilligung (optionale Cookies, Marketing)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                    Empfänger & Auftragsverarbeiter
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                      <h4 className="font-semibold text-gray-900 mb-3">🏢 Service-Partner</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Hosting-Provider (Server)</li>
                        <li>• Stripe (Zahlungsabwicklung)</li>
                        <li>• E-Mail-Service (Notifications)</li>
                        <li>• CDN-Provider (Content Delivery)</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-3">🛡️ Datenschutz-Standards</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Auftragsverarbeitung nach Art. 28 DSGVO</li>
                        <li>• EU-Standardvertragsklauseln</li>
                        <li>• Regelmäßige Security-Audits</li>
                        <li>• End-to-End Verschlüsselung</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                    Drittlandübermittlung
                  </h2>
                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <p className="text-gray-700 leading-relaxed">
                      Bei Einsatz von US-Dienstleistern erfolgt die Übermittlung auf Grundlage von EU-Standardvertragsklauseln und angemessenen Schutzmaßnahmen gemäß Art. 44 ff. DSGVO. Alle Partner sind sorgfältig ausgewählt und vertraglich zur DSGVO-Compliance verpflichtet.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                    Speicherdauer
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                      <h4 className="font-semibold text-gray-900 mb-3">⏰ Aufbewahrungsfristen</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li>• <strong>Account-Daten:</strong> Bis zur Löschung des Accounts</li>
                        <li>• <strong>Audiodateien:</strong> Sofortige Löschung nach Verarbeitung</li>
                        <li>• <strong>Generierte Inhalte:</strong> Bis zur manuellen Löschung</li>
                        <li>• <strong>Abrechnungsdaten:</strong> 10 Jahre (Steuerrecht)</li>
                        <li>• <strong>Logs/Metadaten:</strong> 30 Tage (Sicherheit)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                    Ihre Rechte
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <h4 className="font-semibold text-gray-900 mb-2">📋 Informationsrechte</h4>
                        <p className="text-sm text-gray-700">Auskunft über gespeicherte Daten, Verarbeitungszwecke und Empfänger</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2">✏️ Berichtigungsrecht</h4>
                        <p className="text-sm text-gray-700">Korrektur unrichtiger oder unvollständiger Daten</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h4 className="font-semibold text-gray-900 mb-2">🗑️ Löschungsrecht</h4>
                        <p className="text-sm text-gray-700">Löschung personenbezogener Daten unter bestimmten Voraussetzungen</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-gray-900 mb-2">⏸️ Einschränkungsrecht</h4>
                        <p className="text-sm text-gray-700">Beschränkung der Verarbeitung unter bestimmten Umständen</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-2">📤 Datenübertragbarkeit</h4>
                        <p className="text-sm text-gray-700">Export Ihrer Daten in einem strukturierten Format</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h4 className="font-semibold text-gray-900 mb-2">⚖️ Beschwerderecht</h4>
                        <p className="text-sm text-gray-700">Beschwerde bei der zuständigen Datenschutzbehörde</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                    Cookies & Tracking
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Wir setzen ausschließlich technisch notwendige Cookies für Login-Sessions und Funktionalität ein. Optionale Cookies für Analytics oder Marketing werden nur nach Ihrer ausdrücklichen Einwilligung gesetzt.
                    </p>
                    <div className="flex gap-3">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">✓ Technisch notwendig</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">⚡ Session-basiert</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">🔒 Secure & HttpOnly</span>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📞 Kontakt Datenschutz</h3>
                  <p className="text-gray-700 mb-6">
                    Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a href="mailto:roy302156@gmail.com" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      E-Mail senden
                    </a>
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
