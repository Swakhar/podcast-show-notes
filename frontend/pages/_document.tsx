import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Favicon & PWA-ish basics */}
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="alternate icon" href="/favicon.ico" />
          <meta name="theme-color" content="#9CEE69" />

          {/* Preconnects you might use later (safe to keep) */}
          {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /> */}
          {/* <link rel="preconnect" href="https://js.stripe.com" /> */}
        </Head>
        <body className="bg-white text-slate-900">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
