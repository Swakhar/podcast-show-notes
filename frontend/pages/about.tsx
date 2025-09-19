import Head from "next/head";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function About() {
  return (
    <>
      <Head>
        <title>About CastLumen – AI-Powered Podcast Workflow Automation</title>
        <meta name="description" content="Learn about CastLumen's mission to help podcasters create better content faster with AI automation." />
      </Head>
      
      <SiteHeader />
      
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-gray-900 mb-6">
              Empowering Podcasters<br/>
              <span className="text-blue-600">with AI Automation</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe every podcaster deserves professional-quality content without the hours of manual work. 
              That's why we built CastLumen.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                CastLumen transforms the podcast production workflow by automating time-consuming tasks like 
                show note creation, timestamp generation, and content optimization. 
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We're passionate about helping content creators focus on what they do best – creating amazing content – 
                while we handle the rest with cutting-edge AI technology.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-gray-100 rounded-2xl p-12 text-center">
              <span className="text-6xl block mb-4">🎧</span>
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-gray-600">Episodes Processed</div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Built for Creators, by Creators</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              As podcasters ourselves, we understand the challenges of maintaining consistent, 
              high-quality content. CastLumen is our solution to help you scale your podcast 
              without sacrificing quality.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Get in Touch
              <span>→</span>
            </a>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </>
  );
}
