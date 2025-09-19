import Head from "next/head";
import { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Allgemeine Anfrage',
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
        showToast("Nachricht erfolgreich gesendet! Wir melden uns binnen 24 Stunden.", "success");
        setFormData({ name: '', email: '', subject: 'Allgemeine Anfrage', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      showToast("Fehler beim Senden der Nachricht. Bitte versuchen Sie es erneut.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Kontakt – CastLumen | Support & Vertrieb</title>
        <meta name="description" content="Kontaktieren Sie das CastLumen Team. Professioneller Support, Vertrieb und allgemeine Anfragen. Antwort binnen 24 Stunden." />
        <meta name="keywords" content="CastLumen Kontakt, Support, Vertrieb, Podcast Tools, Hilfe" />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-gray-50 py-20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>📞</span>
              Support & Kontakt
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Wir sind für Sie da
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Haben Sie Fragen zu CastLumen? Benötigen Sie technischen Support oder möchten Sie mehr über unsere Enterprise-Lösungen erfahren? Unser Team hilft Ihnen gerne weiter.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Antwort binnen 24h
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Deutschsprachiger Support
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Enterprise-Beratung
              </div>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              
              {/* Contact Methods */}
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontaktmöglichkeiten</h2>
                </div>

                {/* Support Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎧</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Support</h3>
                      <p className="text-sm text-gray-600">Technische Hilfe</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📧</span>
                      <a href="mailto:support@castlumen.com" className="text-blue-600 hover:text-blue-700 font-medium">
                        support@castlumen.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">⏱️</span>
                      <span className="text-gray-700 text-sm">Antwort binnen 24 Stunden</span>
                    </div>
                  </div>
                </div>

                {/* Sales Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💼</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Vertrieb</h3>
                      <p className="text-sm text-gray-600">Enterprise & Beratung</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📧</span>
                      <a href="mailto:sales@castlumen.com" className="text-blue-600 hover:text-blue-700 font-medium">
                        sales@castlumen.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📞</span>
                      <span className="text-gray-700 text-sm">+49 (0) 30 12345678</span>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Unternehmen</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <strong>CastLumen GmbH</strong><br/>
                      Musterstraße 123<br/>
                      10115 Berlin<br/>
                      Deutschland
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p><strong>USt-IdNr:</strong> DE123456789</p>
                      <p><strong>HRB:</strong> 123456 B</p>
                      <p><strong>Registergericht:</strong> Berlin-Charlottenburg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-gray-100">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Nachricht senden</h2>
                    <p className="text-gray-600">
                      Beschreiben Sie Ihr Anliegen und wir melden uns schnellstmöglich bei Ihnen zurück.
                    </p>
                  </div>

                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Nachricht gesendet!</h3>
                      <p className="text-gray-600 mb-6">
                        Vielen Dank für Ihre Nachricht. Wir melden uns binnen 24 Stunden bei Ihnen.
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Weitere Nachricht senden
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Ihr vollständiger Name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            E-Mail *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="ihre.email@beispiel.de"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                          Betreff *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
                          <option value="Technischer Support">Technischer Support</option>
                          <option value="Vertrieb & Preise">Vertrieb & Preise</option>
                          <option value="Enterprise-Anfrage">Enterprise-Anfrage</option>
                          <option value="Rechnung & Abrechnung">Rechnung & Abrechnung</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Presse & Medien">Presse & Medien</option>
                          <option value="Datenschutz">Datenschutz</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                          Nachricht *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                          placeholder="Beschreiben Sie Ihr Anliegen so detailliert wie möglich..."
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4">
                        <p className="text-xs text-gray-500">
                          Mit dem Absenden stimmen Sie unserer{' '}
                          <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                            Datenschutzerklärung
                          </a>{' '}
                          zu.
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
                              Wird gesendet...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Nachricht senden
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
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Häufige Fragen</h2>
              <p className="text-gray-600">Schnelle Antworten auf die wichtigsten Fragen</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Wie schnell erhalte ich Support?</h3>
                <p className="text-gray-600 text-sm">
                  Unser Support-Team antwortet innerhalb von 24 Stunden auf alle Anfragen. 
                  Kritische technische Probleme werden priorisiert behandelt.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Bieten Sie Telefon-Support an?</h3>
                <p className="text-gray-600 text-sm">
                  Ja, für Enterprise-Kunden bieten wir dedizierten Telefon-Support. 
                  Kontaktieren Sie unser Sales-Team für weitere Informationen.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Gibt es eine Demo oder Beratung?</h3>
                <p className="text-gray-600 text-sm">
                  Selbstverständlich! Wir bieten personalisierte Demos und Beratungsgespräche 
                  für Teams und Unternehmen. Vereinbaren Sie einen Termin über unser Sales-Team.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Wie kann ich mein Abo verwalten?</h3>
                <p className="text-gray-600 text-sm">
                  In Ihren Account-Einstellungen können Sie Ihr Abonnement jederzeit anpassen, 
                  pausieren oder kündigen. Bei Fragen hilft unser Support-Team gerne.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </>
  );
}
