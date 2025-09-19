import Head from "next/head";
import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  return (
    <>
      <Head>
        <title>Kontakt – CastLumen</title>
        <meta name="description" content="Kontaktieren Sie das CastLumen Team. Support, Vertrieb und allgemeine Anfragen." />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Kontakt</h1>
            <p className="text-xl text-gray-600">Wir sind hier, um zu helfen</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📍 Anschrift</h3>
                <p className="text-gray-700">
                  CastLumen GmbH<br/>
                  Musterstraße 123<br/>
                  10115 Berlin<br/>
                  Deutschland
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📞 Support</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>E-Mail:</strong> <a href="mailto:support@castlumen.com" className="text-blue-600">support@castlumen.com</a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Antwortzeit:</strong> Innerhalb von 24 Stunden
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💼 Geschäftlich</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>USt-IdNr:</strong> DE123456789</p>
                  <p><strong>Handelsregister:</strong> HRB 123456 B</p>
                  <p><strong>Registergericht:</strong> Berlin-Charlottenburg</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nachricht senden</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
                    <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Betreff</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Allgemeine Anfrage</option>
                    <option>Technischer Support</option>
                    <option>Vertrieb & Preise</option>
                    <option>Rechnung & Abrechnung</option>
                    <option>Datenschutz</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nachricht</label>
                  <textarea rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                </div>
                
                <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Nachricht senden
                </button>
                
                <p className="text-xs text-gray-500">
                  Mit dem Absenden stimmen Sie unserer <a href="/privacy" className="text-blue-600">Datenschutzerklärung</a> zu.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </>
  );
}
