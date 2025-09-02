import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Privacy() {
  return (
    <>
      <Head><title>Datenschutzerklärung – CastLumen</title></Head>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12 prose">
        <h1>Datenschutzerklärung</h1>
        <p>Verantwortlicher: Your Company GmbH, Musterstraße 1, 12345 Musterstadt, hello@yourcompany.com.</p>
        <h2>1. Verarbeitungstätigkeiten</h2>
        <p>Wir verarbeiten personenbezogene Daten zur Bereitstellung unserer Dienste (Registrierung, Login, Abrechnung, Job-Verarbeitung)…</p>
        <ul>
          <li><strong>Logindaten:</strong> E-Mail, Passwort (gehasht), Sitzungsdaten</li>
          <li><strong>Abrechnung:</strong> Über unseren Zahlungsdienstleister Stripe (Stripe Payments Europe, Ltd.)</li>
          <li><strong>Inhaltsdaten:</strong> von Ihnen hochgeladene Audiodateien/Links zur Verarbeitung</li>
        </ul>
        <h2>2. Rechtsgrundlagen</h2>
        <p>Art. 6 Abs. 1 lit. b DSGVO (Vertrag), lit. f (berechtigte Interessen), ggf. lit. a (Einwilligung für optionale Cookies/Tracking)…</p>
        <h2>3. Empfänger</h2>
        <p>Hosting-Provider, Zahlungsdienstleister (Stripe), ggf. E-Mail-Versand (Mailtrap/SMTP), Auftragsverarbeiter nach Art. 28 DSGVO.</p>
        <h2>4. Drittlandübermittlung</h2>
        <p>Bei Einsatz von US-Dienstleistern erfolgt die Übermittlung auf Grundlage von EU-Standardvertragsklauseln…</p>
        <h2>5. Speicherdauer</h2>
        <p>Wir speichern Daten nur so lange, wie es für die genannten Zwecke erforderlich ist…</p>
        <h2>6. Betroffenenrechte</h2>
        <p>Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch, Datenübertragbarkeit, Beschwerde bei der Aufsichtsbehörde.</p>
        <h2>7. Cookies</h2>
        <p>Wir setzen ausschließlich technisch notwendige Cookies ein. Optionale Cookies werden nur nach Einwilligung gesetzt.</p>
        <h2>8. Kontakt Datenschutz</h2>
        <p>datenschutz@yourcompany.com</p>
      </main>
      <SiteFooter />
    </>
  );
}
