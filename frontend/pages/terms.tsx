import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Terms() {
  return (
    <>
      <Head><title>Terms – CastLumen</title></Head>
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 py-12 prose">
        <h1>Terms of Service</h1>
        <p>By using CastLumen you agree to these terms…</p>
        <h2>Use of Service</h2>
        <p>You may not upload unlawful content; you must own rights to the audio provided…</p>
        <h2>Billing</h2>
        <p>Subscriptions renew automatically; you can cancel anytime via the billing portal…</p>
        <h2>Limitation of liability</h2>
        <p>Service is provided “as is”; to the extent permitted by law we disclaim warranties…</p>
        <h2>Governing Law</h2>
        <p>German law. Place of jurisdiction where legally permitted: Frankfurt am Main.</p>
      </main>
      <SiteFooter />
    </>
  );
}
