import { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import LogoBumper from "../components/LogoBumper";
import SiteFooter from "../components/SiteFooter";
import CookieConsent from "../components/CookieConsent";

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Landing() {
  useReveal();

  return (
    <>
      <Head>
        <title>AI Podcast Show Notes Generator – CastLumen</title>
        <meta name="description" content="Generate show notes, timestamps, SEO and social snippets from your podcast in minutes." />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CastLumen" />
        <meta property="og:title" content="AI Podcast Show Notes Generator – CastLumen" />
        <meta property="og:description" content="Generate show notes, timestamps, SEO and social snippets from your podcast in minutes." />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com/"} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com"}/castlumen-og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        {/* <meta name="twitter:site" content="@your_handle" /> */}

        {/* Canonical & theme */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com/"} />
        <meta name="theme-color" content="#9CEE69" />
      </Head>

      <SiteHeader />
      <LogoBumper />
      <main>
        {/* HERO */}
        <section className="bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-10">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                Ship <span className="text-[#9CEE69]">perfect show notes</span> in minutes.
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Upload audio or paste a URL. Get clean show notes, timestamps, summaries, SEO and social snippets—ready to publish.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/generate" className="px-5 py-3 rounded-lg bg-[#9CEE69] text-slate-900 font-semibold">
                  Try the demo
                </Link>
                <a href="#demo" className="px-5 py-3 rounded-lg border">Watch demo</a>
              </div>
              <p className="mt-3 text-sm text-slate-500">Free plan available • No card required</p>
            </div>
            {/* Screenshot placeholder */}
            <div className="rounded-2xl border shadow-sm bg-white p-3">
              <div className="aspect-video rounded-xl bg-slate-100 grid place-items-center text-slate-500">
                <img
                  src="/castlumen-intro.jpg"
                  alt="CastLumen Intro"
                  className="rounded-xl w-full h-full object-cover"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold">Everything you need</h2>
            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                ["Show notes", "Clean, bullet-proof show notes with links and guests."],
                ["Timestamps", "Clickable chapter markers for YouTube/players."],
                ["Summaries", "Tight summaries for the top and episode description."],
                ["Social snippets", "3–6 short snippets for X/LinkedIn/YouTube."],
                ["SEO", "SEO title and keywords to help your page rank."],
                ["Newsletter", "Ready-to-send Markdown draft of the episode."],
              ].map(([title, body], i) => (
                <div
                  key={title}
                  data-reveal
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className="rounded-xl border p-5 hover:shadow-md transition"
                >
                  <div className="font-semibold">{title}</div>
                  <p className="text-sm text-slate-600 mt-1">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEMO */}
        <section id="demo" className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4" data-reveal>See it in action (2 min)</h2>
            <div data-reveal className="rounded-2xl overflow-hidden border shadow-sm bg-black aspect-video">
              <video
                className="w-full h-full rounded-xl shadow-lg"
                src="/CatLumen.mp4"
                poster="/castlumen-background.jpg"
                controls
                title="CastLumen"
                autoPlay
                muted
                loop
                playsInline
              >
                Sorry, your browser does not support embedded videos.
              </video>
            </div>
            <div className="mt-6" data-reveal style={{ transitionDelay: "120ms" }}>
              <Link href="/generate" className="px-5 py-3 rounded-lg bg-[#9CEE69] text-slate-900 font-semibold">
                Try the demo
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold" data-reveal>Loved by creators</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Aisha K.",
                  role: "Podcast Host",
                  quote: "Cut my post-production time by 70%. The show notes are shockingly good.",
                },
                {
                  name: "Marco S.",
                  role: "YouTube Producer",
                  quote: "Timestamps are spot-on, and the SEO titles boosted our CTR.",
                },
                {
                  name: "Lena P.",
                  role: "Content Lead",
                  quote: "The newsletter draft is a lifesaver—copy, tweak, publish.",
                },
              ].map((t, i) => (
                <figure
                  key={t.name}
                  data-reveal
                  style={{ transitionDelay: `${i * 80}ms` }}
                  className="rounded-2xl border p-6 bg-slate-50"
                >
                  <blockquote className="text-slate-800">“{t.quote}”</blockquote>
                  <figcaption className="mt-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{t.name}</span> • {t.role}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold">Simple pricing</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                { name: "Starter", price: "€19/mo", bullets: ["5 hrs / month", "Summaries", "Notes", "Snippets"], cta: "/pricing" },
                { name: "Pro", price: "€49/mo", bullets: ["20 hrs / month", "All features", "SEO", "Newsletter"], cta: "/pricing" },
                { name: "Agency", price: "€99/mo", bullets: ["Unlimited*", "Teams", "White-label export"], cta: "/pricing" },
              ].map((p) => (
                <div key={p.name} className="rounded-2xl border p-6 hover:shadow-sm">
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="text-3xl font-extrabold mt-1">{p.price}</div>
                  <ul className="mt-3 space-y-1 text-sm text-slate-600">
                    {p.bullets.map(b => <li key={b}>• {b}</li>)}
                  </ul>
                  <Link href={p.cta} className="mt-5 inline-block px-4 py-2 rounded-md bg-[#9CEE69] text-slate-900 font-semibold">
                    Start
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">*Fair-use policy applies.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <CookieConsent />
    </>
  );
}
