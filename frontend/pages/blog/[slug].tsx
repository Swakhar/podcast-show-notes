import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

// This would eventually come from your database/CMS
const blogPosts = {
  "engaging-podcast-show-notes-guide": {
    title: "How to Create Engaging Podcast Show Notes That Drive Downloads",
    excerpt: "Learn the proven strategies top podcasters use to create show notes that convert listeners into loyal subscribers.",
    content: `
      <h2>Why Show Notes Matter More Than Ever</h2>
      <p>In today's crowded podcast landscape, show notes aren't just a nice-to-have—they're essential for growth. Here's why:</p>
      
      <h3>🎯 SEO Benefits</h3>
      <p>Show notes are your podcast's primary SEO asset. Search engines can't listen to audio, but they can read your show notes. When you create detailed, keyword-rich show notes, you're giving search engines the content they need to understand and rank your podcast.</p>
      
      <h3>📱 Social Media Content</h3>
      <p>Great show notes provide endless social media content. Pull quotes, key insights, and episode highlights can be easily shared across platforms to drive more downloads.</p>
      
      <h2>The Anatomy of High-Converting Show Notes</h2>
      
      <h3>1. Compelling Hook (First 100 words)</h3>
      <p>Your opening paragraph should grab attention and clearly communicate the value listeners will get. Use action words and specific benefits.</p>
      
      <h3>2. Episode Outline with Timestamps</h3>
      <p>Listeners love being able to jump to specific sections. Include timestamps for:</p>
      <ul>
        <li>Key topic introductions</li>
        <li>Guest introductions</li>
        <li>Main discussion points</li>
        <li>Actionable takeaways</li>
      </ul>
      
      <h3>3. Guest Bio and Links</h3>
      <p>If you have guests, include a brief bio and all their relevant links. This builds relationships and provides value to your audience.</p>
      
      <h2>CastLumen's AI-Powered Solution</h2>
      <p>Creating detailed show notes manually can take hours. That's where CastLumen comes in. Our AI analyzes your podcast audio and automatically generates:</p>
      <ul>
        <li>SEO-optimized show notes</li>
        <li>Accurate timestamps</li>
        <li>Key takeaways and quotes</li>
        <li>Social media snippets</li>
      </ul>
      
      <h2>Action Steps</h2>
      <ol>
        <li>Audit your current show notes - are they detailed enough?</li>
        <li>Create a show notes template for consistency</li>
        <li>Consider automating the process with AI tools like CastLumen</li>
        <li>Track which show notes drive the most downloads</li>
      </ol>
    `,
    date: "2025-09-15",
    readTime: "8 min read",
    category: "Content Marketing",
    author: "CastLumen Team",
    tags: ["show notes", "seo", "podcast growth", "content marketing"]
  },
  "ai-tools-podcasters-2025": {
    title: "10 AI Tools Every Podcaster Should Use in 2025",
    excerpt: "Discover the latest AI tools that can streamline your podcast workflow and help you create better content faster.",
    content: `
      <h2>The AI Revolution in Podcasting</h2>
      <p>2025 is the year AI transforms podcasting. From content creation to audience engagement, AI tools are making it easier than ever to produce professional-quality podcasts.</p>
      
      <h2>Top 10 AI Tools for Podcasters</h2>
      
      <h3>1. CastLumen - Show Notes & Content Generation</h3>
      <p>Automatically generate SEO-optimized show notes, timestamps, and social media content from your podcast audio.</p>
      
      <h3>2. Descript - Audio Editing</h3>
      <p>Edit audio by editing text. Remove filler words, background noise, and create studio-quality sound.</p>
      
      <h3>3. Riverside.fm - Remote Recording</h3>
      <p>AI-powered remote recording with automatic noise cancellation and video backup.</p>
      
      <h3>4. Podcastle - Voice Enhancement</h3>
      <p>AI voice enhancement and background noise removal for crystal-clear audio.</p>
      
      <h3>5. Speechify - Voice Cloning</h3>
      <p>Create consistent voiceovers and intros with AI voice cloning technology.</p>
      
      <h2>How to Choose the Right AI Tools</h2>
      <p>Consider these factors when selecting AI tools for your podcast:</p>
      <ul>
        <li>Your current workflow bottlenecks</li>
        <li>Budget and ROI expectations</li>
        <li>Integration with existing tools</li>
        <li>Learning curve and ease of use</li>
      </ul>
    `,
    date: "2025-09-10",
    readTime: "12 min read",
    category: "AI Tools",
    author: "CastLumen Team",
    tags: ["ai tools", "podcast automation", "workflow", "technology"]
  },
  "podcast-seo-ranking-guide": {
    title: "Podcast SEO: How to Rank Higher in Apple Podcasts and Spotify",
    excerpt: "Master podcast SEO with these proven techniques to increase your show's discoverability and grow your audience.",
    content: `
      <h2>Understanding Podcast SEO</h2>
      <p>Podcast SEO isn't just about Google—it's about ranking higher in podcast platforms like Apple Podcasts, Spotify, and Google Podcasts.</p>
      
      <h2>Platform-Specific SEO Strategies</h2>
      
      <h3>Apple Podcasts SEO</h3>
      <ul>
        <li>Optimize your podcast title with target keywords</li>
        <li>Write compelling episode descriptions</li>
        <li>Use relevant categories and subcategories</li>
        <li>Encourage reviews and ratings</li>
      </ul>
      
      <h3>Spotify SEO</h3>
      <ul>
        <li>Focus on engagement metrics (completion rates)</li>
        <li>Optimize for Spotify's algorithm with consistent publishing</li>
        <li>Use Spotify's podcast tools and analytics</li>
        <li>Create playlists and leverage Spotify's social features</li>
      </ul>
      
      <h2>Technical SEO for Podcasts</h2>
      <p>Don't forget the technical aspects:</p>
      <ul>
        <li>Optimize your RSS feed</li>
        <li>Use proper podcast tags</li>
        <li>Ensure fast website loading</li>
        <li>Create dedicated landing pages for episodes</li>
      </ul>
    `,
    date: "2025-09-05",
    readTime: "15 min read",
    category: "SEO",
    author: "CastLumen Team",
    tags: ["podcast seo", "apple podcasts", "spotify", "discoverability"]
  }
};

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  
  const post = blogPosts[slug as string];
  
  if (!post) {
    return (
      <>
        <SiteHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <Link href="/blog" className="text-blue-600 hover:text-blue-700">
              ← Back to Blog
            </Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} – CastLumen Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags.join(", ")} />
        
        {/* Open Graph for social sharing */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={post.author} />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:tag" content={post.tags.join(", ")} />
      </Head>

      <SiteHeader />

      <main className="min-h-screen bg-white">
        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 py-16">
          <div className="mb-8">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
              ← Back to Blog
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm">{post.readTime}</span>
              <span className="text-gray-500 text-sm">{post.date}</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {post.excerpt}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>By {post.author}</span>
              <span>•</span>
              <div className="flex gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Article Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to automate your podcast workflow?
              </h3>
              <p className="text-gray-600 mb-6">
                Try CastLumen and generate professional show notes in minutes, not hours.
              </p>
              <Link 
                href="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
                <span>→</span>
              </Link>
            </div>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
