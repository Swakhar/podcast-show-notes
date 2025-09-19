import Head from "next/head";
import Link from "next/link";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export default function Blog() {
  // For now, you can use static content, later connect to a CMS
  const blogPosts = [
    {
      id: 1,
      title: "How to Create Engaging Podcast Show Notes That Drive Downloads",
      excerpt: "Learn the proven strategies top podcasters use to create show notes that convert listeners into loyal subscribers.",
      date: "2025-09-15",
      readTime: "8 min read",
      category: "Content Marketing",
      image: "/blog/podcast-show-notes-guide.jpg",
      slug: "engaging-podcast-show-notes-guide"
    },
    {
      id: 2,
      title: "10 AI Tools Every Podcaster Should Use in 2025",
      excerpt: "Discover the latest AI tools that can streamline your podcast workflow and help you create better content faster.",
      date: "2025-09-10",
      readTime: "12 min read", 
      category: "AI Tools",
      image: "/blog/ai-tools-podcasters.jpg",
      slug: "ai-tools-podcasters-2025"
    },
    {
      id: 3,
      title: "Podcast SEO: How to Rank Higher in Apple Podcasts and Spotify",
      excerpt: "Master podcast SEO with these proven techniques to increase your show's discoverability and grow your audience.",
      date: "2025-09-05",
      readTime: "15 min read",
      category: "SEO",
      image: "/blog/podcast-seo-guide.jpg", 
      slug: "podcast-seo-ranking-guide"
    }
  ];

  return (
    <>
      <Head>
        <title>Podcast Marketing Blog – CastLumen | Tips, Guides & Industry Insights</title>
        <meta name="description" content="Expert podcast marketing tips, AI automation guides, and industry insights. Learn how to grow your podcast audience and streamline your workflow." />
        <meta name="keywords" content="podcast marketing, show notes, AI automation, podcast SEO, content creation, podcast tools" />
      </Head>

      <SiteHeader />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>📚</span>
              Knowledge Hub
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Podcast Marketing<br/>
              <span className="text-blue-600">Insights & Guides</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Expert tips, AI automation guides, and proven strategies to grow your podcast audience and streamline your content creation workflow.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-sm font-medium text-red-600">Featured Article</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Insights</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {blogPosts[0].category}
                  </span>
                  <span className="text-gray-500 text-sm">{blogPosts[0].readTime}</span>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {blogPosts[0].title}
                </h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <Link 
                  href={`/blog/${blogPosts[0].slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Read Full Article
                  <span>→</span>
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl">🎧</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">All Articles</h2>
              <p className="text-gray-600">Dive deep into podcast marketing strategies and AI automation</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Stay Ahead of the Curve</h2>
              <p className="text-blue-100 mb-8 text-lg">
                Get weekly podcast marketing tips and AI automation strategies delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
