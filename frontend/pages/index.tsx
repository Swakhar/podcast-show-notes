import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import SiteHeader from "../components/SiteHeader";
import LogoBumper from "../components/LogoBumper";
import SiteFooter from "../components/SiteFooter";
import CookieConsent from "../components/CookieConsent";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "../contexts/ToastContext";

type Me = {
  plan: "FREE" | "PRO" | "AGENCY";
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
};

const planText = (p?: string) => (p === "AGENCY" ? "Agency" : p === "PRO" ? "Pro" : "Free");

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
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const { showToast } = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const active = me?.subscriptionStatus === "active";
  const current = me?.plan;

  // Or even better, add validation:
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

  const cards = [
    { 
      key: "FREE", 
      name: t('pricing.plans.free.name'), 
      price: "€0", 
      period: "forever",
      priceNet: 0,
      vatAmount: 0,
      bullets: t('pricing.plans.free.features', { returnObjects: true }) as string[], 
      priceId: "",
      popular: false,
      description: t('pricing.plans.free.description')
    },
    { 
      key: "PRO", 
      name: t('pricing.plans.pro.name'), 
      price: "€19", 
      period: "month",
      priceNet: 15.97, // €19 / 1.19
      vatAmount: 3.03,
      bullets: t('pricing.plans.pro.features', { returnObjects: true }) as string[],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
      popular: true,
      description: t('pricing.plans.pro.description')
    },
    { 
      key: "AGENCY", 
      name: t('pricing.plans.agency.name'), 
      price: "€49", 
      period: "month",
      priceNet: 41.18, // €49 / 1.19
      vatAmount: 7.82,
      bullets: t('pricing.plans.agency.features', { returnObjects: true }) as string[],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || "",
      popular: false,
      description: t('pricing.plans.agency.description')
    },
  ] as const;

  const testimonials = t('testimonials.items', { returnObjects: true }) as Array<{
    name: string;
    role: string;
    company: string;
    quote: string;
  }>;

  const features = t('features.items', { returnObjects: true }) as Array<{
    icon: string;
    title: string;
    description: string;
    benefits: string[];
  }>;

  const stats = [
    { value: t('stats.episodes'), label: t('stats.episodesLabel') },
    { value: t('stats.creators'), label: t('stats.creatorsLabel') },
    { value: t('stats.timeSaved'), label: t('stats.timeSavedLabel') },
    { value: t('stats.rating'), label: t('stats.ratingLabel') }
  ];

  const faqItems = t('faq.items', { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  useEffect(() => {
    (async () => {
      try { 
        const r = await fetch("/api/me", { cache: "no-store" }); 
        const j = await r.json(); 
        setMe(j?.user ?? null); 
      } catch { 
        setMe(null); 
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleCheckout = async (priceId: string, planKey: string) => {
    try {
      // ✅ Handle Free plan
      if (planKey === "FREE") {
        if (active && current !== "FREE") {
          // User wants to downgrade to free - redirect to billing portal
          showToast("Redirecting to billing portal to manage subscription...", "info");
          
          const res = await fetch("/api/stripe/create-portal-session", { 
            method: "POST" 
          });
          
          if (!res.ok) {
            const { error } = await res.json();
            showToast(error || "Failed to open billing portal", "error");
            return;
          }
          
          const { url } = await res.json();
          window.location.href = url;
          return;
        } else {
          // User is not active or already on free - redirect to generator
          showToast("Welcome! Starting with free plan...", "success");
          router.push("/generate");
          return;
        }
      }

      // ✅ Handle paid plans
      if (!priceId) {
        showToast("This plan is not available yet. Please contact support.", "error");
        return;
      }

      showToast("Redirecting to checkout...", "info");

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      
      if (!res.ok) {
        const { error } = await res.json();
        showToast(error || "Failed to create checkout session", "error");
        return;
      }

      const { sessionId } = await res.json();

      if (sessionId) {
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId });
      } else {
        showToast("Failed to create checkout session", "error");
      }
    } catch (e: any) {
      console.error("Checkout error:", e);
      showToast("Something went wrong. Please try again.", "error");
    }
  };

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setNewsletterLoading(true);
    try {
      // Add your newsletter signup API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      showToast(t('newsletter.success'), "success");
      setEmail("");
    } catch (error) {
      showToast(t('newsletter.error'), "error");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />

        {/* Enhanced Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CastLumen" />
        <meta property="og:title" content={t('meta.title')} />
        <meta property="og:description" content={t('meta.description')} />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com/"} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com"}/castlumen-og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('meta.title')} />
        <meta name="twitter:description" content={t('meta.description')} />

        {/* Additional SEO */}
        <meta name="keywords" content={t('meta.keywords')} />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com/"} />
        <meta name="theme-color" content="#9CEE69" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "CastLumen",
              "description": t('meta.description'),
              "url": process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com/",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "19",
                "priceCurrency": "EUR"
              }
            })
          }}
        />
      </Head>

      <SiteHeader />
      <LogoBumper />
      
      <main>
        {/* ENHANCED HERO */}
        <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div data-reveal>
                {/* Social Proof Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {t('hero.socialProof')}
                </div>

                <h1 className="text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t('hero.title')}
                </h1>
                
                <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                  {t('hero.subtitle')}
                </p>

                {/* Key Benefits */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    `🚀 ${t('hero.benefits.faster')}`,
                    `🎯 ${t('hero.benefits.seo')}`, 
                    `📱 ${t('hero.benefits.social')}`,
                    `🔗 ${t('hero.benefits.wordpress')}`
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">{benefit.split(' ')[0]}</span>
                      <span className="font-medium">{benefit.split(' ').slice(1).join(' ')}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  {active ? (
                    <>
                      <Link 
                        href="/generate" 
                        className="px-8 py-4 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        {t('hero.ctaGenerate')}
                      </Link>
                      <button
                        onClick={async () => {
                          const r = await fetch("/api/stripe/create-portal-session", { method: "POST" });
                          const { url, error } = await r.json();
                          if (error) return showToast(error, "error");
                          window.location.href = url;
                        }}
                        className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                      >
                        {t('hero.ctaBilling')}
                      </button>
                      <div className="text-sm text-gray-600 font-medium">
                        {t('hero.currentPlan', { 
                          plan: planText(me?.plan), 
                          used: me?.monthlyMinutesUsed, 
                          limit: me?.monthlyMinutesLimit 
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/generate" 
                        className="px-8 py-4 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                      >
                        {t('hero.cta')}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                        </svg>
                      </Link>
                      <a 
                        href="#demo" 
                        className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
                        </svg>
                        {t('hero.ctaSecondary')}
                      </a>
                      <div className="w-full text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {t('hero.freeNotice')}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Enhanced Screenshot/Demo */}
              <div data-reveal style={{ transitionDelay: "200ms" }} className="relative">
                <div className="relative rounded-3xl border shadow-2xl bg-white p-4 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src="/castlumen-intro.jpg"
                      alt="CastLumen Interface Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-xl shadow-lg animate-bounce">
                    <span className="text-sm font-bold">{t('common.timeSaved')}</span>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-xl shadow-lg">
                    <span className="text-sm font-bold">{t('common.aiPowered')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={i} data-reveal style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="text-4xl lg:text-5xl font-black text-[#9CEE69] mb-2">{stat.value}</div>
                  <div className="text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENHANCED FEATURES */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16" data-reveal>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                {t('features.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  style={{ transitionDelay: `${i * 100}ms` }}
                  className="group relative p-8 rounded-2xl border border-gray-200 hover:border-[#9CEE69] hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-[#9CEE69]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENHANCED TESTIMONIALS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16" data-reveal>
              <h2 className="text-4xl font-black text-gray-900 mb-6">{t('testimonials.title')}</h2>
              <p className="text-xl text-gray-600">{t('testimonials.subtitle')}</p>
            </div>

            {/* Featured Testimonial Carousel */}
            <div className="relative mb-16" data-reveal>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 lg:p-12 text-center max-w-4xl mx-auto">
                <div className="text-6xl mb-6">👩‍💼</div>
                <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial]?.quote}"
                </blockquote>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <cite className="text-gray-600">
                  <div className="font-semibold text-gray-900">{testimonials[currentTestimonial]?.name}</div>
                  <div>{testimonials[currentTestimonial]?.role}</div>
                  <div className="text-sm">{testimonials[currentTestimonial]?.company}</div>
                </cite>
              </div>
              
              {/* Testimonial Navigation */}
              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentTestimonial ? 'bg-[#9CEE69]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Testimonial Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <div
                  key={testimonial.name}
                  data-reveal
                  style={{ transitionDelay: `${i * 100}ms` }}
                  className="p-6 rounded-2xl bg-gray-50 border border-gray-200"
                >
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    ))}
                  </div>
                  <blockquote className="text-gray-900 mb-4">"{testimonial.quote}"</blockquote>
                  <cite className="text-sm text-gray-600">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div>{testimonial.role}</div>
                  </cite>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENHANCED PRICING */}
        <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16" data-reveal>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                {t('pricing.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('pricing.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {cards.map((plan, i) => {
                const isCurrent = active && current === plan.key;
                return (
                  <div 
                    key={plan.key} 
                    data-reveal
                    style={{ transitionDelay: `${i * 100}ms` }}
                    className={`relative rounded-3xl p-8 transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-white border-2 border-[#9CEE69] shadow-xl scale-105 ring-4 ring-[#9CEE69]/10' 
                        : 'bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                          🔥 Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                        {plan.period !== "forever" && (
                          <span className="text-gray-600 ml-2">/{plan.period}</span>
                        )}
                      </div>
                      {plan.period === "forever" ? (
                        <p className="text-gray-600 font-medium">{t('pricing.noCardRequired')}</p>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-600">{t('pricing.billedMonthly')}</p>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-[#9CEE69] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700 leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      {isCurrent ? (
                        <div className="text-center">
                          <button disabled className="w-full px-6 py-4 rounded-xl bg-gray-100 text-gray-500 border font-semibold mb-2">
                            {t('pricing.currentPlan')}
                          </button>
                          <p className="text-xs text-gray-500">
                            {t('pricing.minutesUsed', { 
                              used: me?.monthlyMinutesUsed, 
                              limit: me?.monthlyMinutesLimit 
                            })}
                          </p>
                        </div>
                      ) : active ? (
                        <button
                          onClick={() => handleCheckout(plan.priceId, plan.key)}
                          disabled={!plan.priceId && plan.key !== "FREE"}
                          className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                            plan.popular
                              ? "bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 hover:shadow-lg hover:scale-105"
                              : plan.key === "FREE"
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                        >
                          {plan.key === "FREE" ? t('pricing.downgrade') : 
                           current === "FREE" ? t('pricing.upgrade', { plan: plan.name }) : 
                           t('pricing.switch', { plan: plan.name })}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckout(plan.priceId, plan.key)}
                          disabled={!plan.priceId && plan.key !== "FREE"}
                          className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                            plan.popular
                              ? "bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 hover:shadow-lg hover:scale-105"
                              : plan.key === "FREE"
                              ? "bg-gray-900 text-white hover:bg-gray-800"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                        >
                          {plan.key === "FREE" ? t('pricing.startFree') : t('pricing.get', { plan: plan.name })}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12" data-reveal>
              <p className="text-gray-600 mb-4">{t('pricing.fairUse')}</p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('pricing.guarantees.cancel')}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('pricing.guarantees.moneyBack')}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('pricing.guarantees.noFees')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16" data-reveal>
              <h2 className="text-4xl font-black text-gray-900 mb-6">{t('faq.title')}</h2>
              <p className="text-xl text-gray-600">{t('faq.subtitle')}</p>
            </div>

            <div className="space-y-8">
              {faqItems.map((faq, i) => (
                <details 
                  key={i}
                  data-reveal
                  style={{ transitionDelay: `${i * 50}ms` }}
                  className="group p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER SIGNUP */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div data-reveal>
              <h2 className="text-4xl font-black mb-6">{t('newsletter.title')}</h2>
              <p className="text-xl text-blue-100 mb-8">
                {t('newsletter.subtitle')}
              </p>
              
              <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  className="flex-1 px-4 py-3 rounded-xl border-0 text-gray-900 placeholder-gray-500"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-6 py-3 bg-[#9CEE69] text-gray-900 font-semibold rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {newsletterLoading ? "..." : t('newsletter.cta')}
                </button>
              </form>
              
              <p className="text-sm text-blue-200 mt-4">
                {t('newsletter.disclaimer')}
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
              {t('cta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link 
                href="/generate" 
                className="px-8 py-4 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                {t('cta.primary')}
              </Link>
              <Link 
                href="/#pricing" 
                className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:border-white/50 transition-colors"
              >
                {t('cta.secondary')}
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('cta.features.freeStart')}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('cta.features.noCard')}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('cta.features.quickSetup')}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <CookieConsent />

      {/* Add reveal animation styles */}
      <style jsx>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }
        [data-reveal].reveal-in {
          opacity: 1;
          transform: translateY(0);
        }
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23e2e8f0'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='0.5' d='M12 3v18m9-9H3'/%3e%3c/svg%3e");
          background-size: 40px 40px;
        }
      `}</style>
    </>
  );
}

// Add this at the bottom:
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
