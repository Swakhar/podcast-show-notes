import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Impressum() {
  return (
    <>
      <Head><title>Impressum – CastLumen</title></Head>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12 prose">
        <h1>Impressum</h1>
        <p><strong>Dienstanbieter</strong><br/>Your Company GmbH<br/>Musterstraße 1<br/>12345 Musterstadt, Deutschland</p>
        <p><strong>Vertreten durch</strong><br/>Vorname Nachname (Geschäftsführer)</p>
        <p><strong>Kontakt</strong><br/>E-Mail: hello@yourcompany.com<br/>Telefon: +49 (0)123 456789</p>
        <p><strong>Registereintrag</strong><br/>Amtsgericht Musterstadt, HRB 123456</p>
        <p><strong>Umsatzsteuer-ID</strong><br/>DE123456789</p>
        <p><strong>Inhaltlich Verantwortlicher</strong> gem. § 18 Abs. 2 MStV: Vorname Nachname, Anschrift wie oben.</p>
        <h2>Haftung für Inhalte</h2>
        <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich…</p>
        <h2>Haftung für Links</h2>
        <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben…</p>
        <h2>Urheberrecht</h2>
        <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht…</p>
      </main>
      <SiteFooter />
    </>
  );
}
