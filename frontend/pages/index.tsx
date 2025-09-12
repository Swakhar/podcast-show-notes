import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import LogoBumper from "../components/LogoBumper";
import SiteFooter from "../components/SiteFooter";
import CookieConsent from "../components/CookieConsent";

type Me = {
  plan: "FREE" | "STARTER" | "PRO" | "AGENCY";
  subscriptionStatus: string | null;
  monthlyMinutesLimit: number;
  monthlyMinutesUsed: number;
};

const planText = (p?: string) => (p === "AGENCY" ? "Agency" : p === "PRO" ? "Pro" : p === "STARTER" ? "Starter" : "Free");

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
  const [me, setMe] = useState<Me | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const active = me?.subscriptionStatus === "active";
  const current = me?.plan;

  const cards = [
    { 
      key: "STARTER", 
      name: "Starter", 
      price: "€19", 
      period: "per month",
      bullets: ["5 hours / month", "Show notes & summaries", "Social snippets", "Basic templates", "Email support"], 
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
      popular: false
    },
    { 
      key: "PRO", 
      name: "Pro", 
      price: "€49", 
      period: "per month",
      bullets: ["20 hours / month", "All content types", "Advanced SEO optimization", "Custom templates", "WordPress integration", "Priority support"], 
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
      popular: true
    },
    { 
      key: "AGENCY", 
      name: "Agency", 
      price: "€99", 
      period: "per month",
      bullets: ["Unlimited processing*", "Team collaboration", "White-label exports", "API access", "Custom integrations", "Dedicated support"], 
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY,
      popular: false
    },
  ] as const;

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Podcast Host at TechTalks",
      company: "TechTalks Media",
      quote: "CastLumen transformed our workflow. What used to take 3 hours now takes 15 minutes. The AI-generated show notes are incredibly accurate.",
      avatar: "👩‍💼",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Content Director",
      company: "StartupStories",
      quote: "The SEO optimization alone increased our podcast discovery by 40%. The social snippets save us hours of content creation.",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Marketing Lead",
      company: "Business Insights Podcast",
      quote: "Game-changer for our team. The WordPress integration and custom templates make publishing seamless.",
      avatar: "👩‍🚀",
      rating: 5
    }
  ];

  const features = [
    {
      icon: "📝",
      title: "AI-Powered Show Notes",
      description: "Generate comprehensive, well-structured show notes with key points, quotes, and action items.",
      benefits: ["90% time savings", "SEO optimized", "Multiple formats"]
    },
    {
      icon: "⏱️",
      title: "Smart Timestamps",
      description: "Automatic chapter markers and timestamps for better navigation and engagement.",
      benefits: ["Increase engagement", "YouTube ready", "Custom chapters"]
    },
    {
      icon: "📱",
      title: "Social Media Ready",
      description: "Platform-optimized snippets for Twitter, LinkedIn, Instagram, and TikTok.",
      benefits: ["Multiple platforms", "Trending hashtags", "Visual quotes"]
    },
    {
      icon: "🔍",
      title: "SEO Optimization",
      description: "Meta descriptions, keywords, and titles that help your content rank higher.",
      benefits: ["Better rankings", "More traffic", "Keyword research"]
    },
    {
      icon: "📧",
      title: "Newsletter Integration",
      description: "Ready-to-send newsletter drafts with episode highlights and CTAs.",
      benefits: ["Email templates", "Subscriber growth", "Automation ready"]
    },
    {
      icon: "🔗",
      title: "WordPress Publishing",
      description: "One-click publishing directly to your WordPress site with proper formatting.",
      benefits: ["Direct publishing", "Custom themes", "Auto-scheduling"]
    }
  ];

  const stats = [
    { value: "50,000+", label: "Episodes Processed" },
    { value: "2,400+", label: "Happy Creators" },
    { value: "95%", label: "Time Saved" },
    { value: "4.9★", label: "User Rating" }
  ];

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
  }, []);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setNewsletterLoading(true);
    try {
      // Add your newsletter signup API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert("Thanks for subscribing! Check your email for updates.");
      setEmail("");
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>AI Podcast Show Notes Generator – CastLumen</title>
        <meta name="description" content="Transform your podcast workflow with AI. Generate professional show notes, timestamps, SEO content, and social snippets in minutes, not hours." />

        {/* Enhanced Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CastLumen" />
        <meta property="og:title" content="AI Podcast Show Notes Generator – CastLumen" />
        <meta property="og:description" content="Transform your podcast workflow with AI. Generate professional show notes, timestamps, SEO content, and social snippets in minutes, not hours." />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com/"} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com"}/castlumen-og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Podcast Show Notes Generator – CastLumen" />
        <meta name="twitter:description" content="Transform your podcast workflow with AI. Generate professional show notes, timestamps, SEO content, and social snippets in minutes, not hours." />

        {/* Additional SEO */}
        <meta name="keywords" content="podcast, show notes, AI, transcription, SEO, social media, content creation" />
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
              "description": "AI-powered podcast show notes generator",
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
                  Trusted by 2,400+ podcast creators
                </div>

                <h1 className="text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Ship <span className="text-[#9CEE69]">perfect show notes</span> in minutes, not hours
                </h1>
                
                <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                  Transform your podcast workflow with AI. Generate professional show notes, timestamps, SEO content, and social snippets from any audio file or URL.
                </p>

                {/* Key Benefits */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {[
                    "🚀 95% faster workflow",
                    "🎯 SEO optimized content", 
                    "📱 Social media ready",
                    "🔗 WordPress integration"
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
                        Open Generator →
                      </Link>
                      <button
                        onClick={async () => {
                          const r = await fetch("/api/stripe/create-portal-session", { method: "POST" });
                          const { url, error } = await r.json();
                          if (error) return alert(error);
                          window.location.href = url;
                        }}
                        className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                      >
                        Manage Billing
                      </button>
                      <div className="text-sm text-gray-600 font-medium">
                        Current: {planText(me?.plan)} • {me?.monthlyMinutesUsed}/{me?.monthlyMinutesLimit} min used
                      </div>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/generate" 
                        className="px-8 py-4 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                      >
                        Try Free Demo 
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
                        Watch Demo
                      </a>
                      <div className="w-full text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Free plan available • No credit card required
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
                    <span className="text-sm font-bold">95% Time Saved!</span>
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-xl shadow-lg">
                    <span className="text-sm font-bold">AI Powered</span>
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
                Everything you need to <span className="text-[#9CEE69]">scale your podcast</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From audio upload to published content - our AI handles the heavy lifting so you can focus on creating amazing content.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  data-reveal
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

        {/* ENHANCED DEMO SECTION */}
        <section id="demo" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12" data-reveal>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                See CastLumen in action
              </h2>
              <p className="text-xl text-gray-600">Watch how we transform a 60-minute podcast into complete show notes in under 2 minutes</p>
            </div>
            
            <div data-reveal className="relative rounded-3xl overflow-hidden shadow-2xl bg-black">
              <video
                className="w-full aspect-video"
                src="/CatLumen.mp4"
                poster="/castlumen-background.jpg"
                controls
                title="CastLumen Demo"
                playsInline
              >
                Sorry, your browser does not support embedded videos.
              </video>
              
              {/* Video Overlay Info */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-medium">⏱️ 2:00 Demo</span>
              </div>
            </div>

            <div className="text-center mt-8" data-reveal style={{ transitionDelay: "200ms" }}>
              <Link 
                href="/generate" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Try it yourself - Free demo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ENHANCED TESTIMONIALS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16" data-reveal>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Loved by podcast creators worldwide</h2>
              <p className="text-xl text-gray-600">Join thousands of creators who've transformed their workflow</p>
            </div>

            {/* Featured Testimonial Carousel */}
            <div className="relative mb-16" data-reveal>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 lg:p-12 text-center max-w-4xl mx-auto">
                <div className="text-6xl mb-6">{testimonials[currentTestimonial].avatar}</div>
                <blockquote className="text-2xl lg:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <cite className="text-gray-600">
                  <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div>{testimonials[currentTestimonial].role}</div>
                  <div className="text-sm">{testimonials[currentTestimonial].company}</div>
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
                    {[...Array(testimonial.rating)].map((_, j) => (
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
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the plan that fits your needs. Upgrade or downgrade anytime. No hidden fees.
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
                        ? 'bg-white border-2 border-[#9CEE69] shadow-xl scale-105' 
                        : 'bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#9CEE69] text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-2">/{plan.period.split(' ')[1]}</span>
                      </div>
                      <p className="text-gray-600">{plan.period}</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-[#9CEE69] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      {isCurrent ? (
                        <button disabled className="w-full px-6 py-4 rounded-xl bg-gray-100 text-gray-500 border font-semibold">
                          Current Plan
                        </button>
                      ) : active ? (
                        <button
                          onClick={async () => {
                            const r = await fetch("/api/stripe/create-portal-session", { method: "POST" });
                            const { url, error } = await r.json();
                            if (error) return alert(error);
                            window.location.href = url;
                          }}
                          className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                            plan.popular
                              ? "bg-[#9CEE69] text-gray-900 hover:bg-green-400 hover:scale-105"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                        >
                          Switch to {plan.name}
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (!plan.priceId) return alert("Missing priceId");
                            const r = await fetch("/api/stripe/create-checkout-session", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ priceId: plan.priceId }),
                            });
                            const { url, error } = await r.json();
                            if (error) return alert(error);
                            window.location.href = url;
                          }}
                          className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                            plan.popular
                              ? "bg-[#9CEE69] text-gray-900 hover:bg-green-400 hover:scale-105"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                        >
                          Start {plan.name} Plan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-12" data-reveal>
              <p className="text-gray-600 mb-4">*Fair-use policy applies to unlimited plans</p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cancel anytime
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  30-day money back
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No setup fees
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16" data-reveal>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know about CastLumen</p>
            </div>

            <div className="space-y-8">
              {[
                {
                  q: "How accurate are the AI-generated show notes?",
                  a: "Our AI achieves 95%+ accuracy on most podcasts. The system is trained specifically on podcast content and continuously improves. You can always edit and customize the output to match your style."
                },
                {
                  q: "What audio formats do you support?",
                  a: "We support MP3, WAV, M4A, and most common audio formats. You can also provide YouTube URLs, podcast RSS feeds, or direct audio links."
                },
                {
                  q: "Can I customize the output format?",
                  a: "Yes! You can create custom templates, adjust tone and style, and even white-label the output for your brand. Pro and Agency plans include advanced customization options."
                },
                {
                  q: "How does the WordPress integration work?",
                  a: "Simply connect your WordPress site with your credentials, and you can publish show notes directly from CastLumen with one click. It handles formatting, images, and SEO automatically."
                },
                {
                  q: "Is there a free trial?",
                  a: "Yes! You can try our demo without signing up, and all paid plans come with a 30-day money-back guarantee. The Free plan includes limited processing time each month."
                },
                {
                  q: "How secure is my content?",
                  a: "Very secure. We use enterprise-grade encryption, never store your audio files permanently, and are GDPR compliant. Your content is processed and then securely deleted."
                }
              ].map((faq, i) => (
                <details 
                  key={i}
                  data-reveal
                  style={{ transitionDelay: `${i * 50}ms` }}
                  className="group p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.q}</h3>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER SIGNUP */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div data-reveal>
              <h2 className="text-4xl font-black mb-6">Stay ahead of the curve</h2>
              <p className="text-xl text-blue-100 mb-8">
                Get the latest podcast marketing tips, AI updates, and exclusive early access to new features.
              </p>
              
              <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border-0 text-gray-900 placeholder-gray-500"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-6 py-3 bg-[#9CEE69] text-gray-900 font-semibold rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {newsletterLoading ? "..." : "Subscribe"}
                </button>
              </form>
              
              <p className="text-sm text-blue-200 mt-4">
                Join 5,000+ creators. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div data-reveal>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                Ready to transform your podcast workflow?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of creators who've already saved hundreds of hours with CastLumen.
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-4">
                <Link 
                  href="/generate" 
                  className="px-8 py-4 bg-gradient-to-r from-[#9CEE69] to-green-400 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  Start Free Demo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a 
                  href="#pricing" 
                  className="px-6 py-4 text-gray-700 font-semibold hover:text-gray-900 transition-colors"
                >
                  View Pricing
                </a>
              </div>
              
              <div className="flex justify-center items-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free to start
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Setup in 2 minutes
                </span>
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
