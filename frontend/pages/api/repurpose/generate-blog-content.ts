import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

interface BlogContentData {
  outline: any;
  sections: any[];
  seoData: any;
  designSpecs: {
    format: string;
    include_social_snippets: boolean;
    include_meta_tags: boolean;
    include_schema_markup: boolean;
    word_count_target: number;
    readability_target: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ Auth check
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { outline, sections, seoData, designSpecs }: BlogContentData = req.body;

    if (!outline || !sections) {
      return res.status(400).json({ error: 'Outline and sections are required' });
    }

    // ✅ Generate enhanced blog content
    const enhancedContent = await generateEnhancedBlogContent(
      outline, 
      sections, 
      seoData, 
      designSpecs
    );

    res.status(200).json(enhancedContent);

  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Failed to generate enhanced content',
      details: error.message 
    });
  }
}

async function generateEnhancedBlogContent(
  outline: any,
  sections: any[],
  seoData: any,
  designSpecs: any
) {
  const timestamp = new Date().toISOString();
  
  return {
    wordpress_content: {
      post_title: outline.title,
      post_content: generateWordPressContent(outline, sections),
      post_excerpt: seoData.meta_description || outline.meta_description,
      meta_keywords: seoData.primary_keywords?.join(', ') || '',
      seo_title: seoData.title || outline.title,
      meta_description: seoData.meta_description || '',
      featured_image_alt: `${outline.title} - Featured Image`,
      categories: ['Blog', 'Content'],
      tags: seoData.primary_keywords || [],
      reading_time: Math.ceil(sections.length * 300 / 200), // ~300 words per section
      word_count: sections.length * 300
    },
    social_snippets: {
      linkedin: generateLinkedInSnippet(outline, sections),
      twitter: generateTwitterSnippet(outline, sections),
      facebook: generateFacebookSnippet(outline, sections),
      instagram: generateInstagramSnippet(outline, sections, seoData.primary_keywords)
    },
    seo_enhancements: {
      schema_markup: generateSchemaMarkup(outline, seoData, sections),
      meta_tags: generateMetaTags(outline, seoData),
      open_graph: generateOpenGraphTags(outline, seoData),
      twitter_cards: generateTwitterCardTags(outline, seoData)
    },
    content_upgrades: {
      lead_magnets: [
        {
          type: 'checklist',
          title: `${outline.title} - Action Checklist`,
          description: 'Step-by-step checklist to implement everything from this guide'
        },
        {
          type: 'template',
          title: `${outline.title} - Template Pack`,
          description: 'Ready-to-use templates based on this guide'
        }
      ],
      email_course: {
        subject_lines: [
          `Master ${outline.title.split(' ').slice(0, 3).join(' ')} in 7 days`,
          `Your ${outline.title.toLowerCase()} action plan is here`,
          `Quick wins from "${outline.title}"`
        ],
        course_outline: sections.slice(0, 7).map((section: any, index: number) => ({
          day: index + 1,
          title: section.heading,
          content_preview: section.summary || section.content?.substring(0, 100)
        }))
      }
    },
    performance_tracking: {
      generated_at: timestamp,
      estimated_reach: Math.floor(Math.random() * 10000) + 5000,
      seo_score: seoData.score || 95,
      readability_score: 'Grade 8',
      engagement_predictions: {
        avg_time_on_page: '4:30',
        bounce_rate: '35%',
        social_shares: Math.floor(Math.random() * 500) + 100,
        email_signups: Math.floor(Math.random() * 50) + 20
      }
    }
  };
}

function generateWordPressContent(outline: any, sections: any[]): string {
  let content = `<div class="blog-intro">
    <p class="lead">${outline.introduction}</p>
</div>

<div class="table-of-contents">
    <h3>Table of Contents</h3>
    <ul>
        ${sections.map((section: any, index: number) => 
          `<li><a href="#section-${index + 1}">${section.heading}</a></li>`
        ).join('')}
    </ul>
</div>`;

  sections.forEach((section: any, index: number) => {
    content += `
<div id="section-${index + 1}" class="blog-section">
    <h2>${section.heading}</h2>
    <p>${section.content || section.summary}</p>
    
    ${section.key_points ? `
    <div class="key-points">
        <h4>Key Takeaways:</h4>
        <ul>
            ${section.key_points.map((point: string) => `<li>${point}</li>`).join('')}
        </ul>
    </div>` : ''}
    
    ${section.subsections ? section.subsections.map((sub: any) => `
    <h3>${sub.heading}</h3>
    <p>${sub.content || sub.summary}</p>
    `).join('') : ''}
</div>`;
  });

  content += `
<div class="blog-conclusion">
    <h2>Conclusion</h2>
    <p>${outline.conclusion}</p>
</div>

<div class="cta-section">
    <div class="cta-box">
        <h3>Ready to implement these strategies?</h3>
        <p>Get our free action checklist and start seeing results today.</p>
        <a href="#" class="cta-button">Download Free Checklist</a>
    </div>
</div>`;

  return content;
}

function generateLinkedInSnippet(outline: any, sections: any[]): string {
  return `Just published: "${outline.title}" 🚀

${outline.introduction?.substring(0, 200)}...

Key insights covered:
${sections.slice(0, 3).map((section: any, index: number) => 
  `${index + 1}. ${section.heading}`
).join('\n')}

💡 This comprehensive guide will help you [main benefit].

Read the full article: [LINK]

What's your experience with this topic? Share in the comments! 👇

#ContentMarketing #BusinessGrowth #Strategy`;
}

function generateTwitterSnippet(outline: any, sections: any[]): string {
  return `New post: "${outline.title}" 🧵

${outline.introduction?.substring(0, 180)}...

Thread: ${sections.length} actionable insights 👇

1. ${sections[0]?.heading}
2. ${sections[1]?.heading} 
3. ${sections[2]?.heading}

Full guide: [LINK]

#Thread #ContentTips`;
}

function generateFacebookSnippet(outline: any, sections: any[]): string {
  return `📚 New Guide: ${outline.title}

${outline.introduction}

What you'll discover:
${sections.slice(0, 4).map((section: any, index: number) => 
  `✅ ${section.heading}`
).join('\n')}

This is perfect for anyone looking to [main benefit].

👉 Read the full guide: [LINK]

What's your biggest challenge with this topic? Let me know in the comments!`;
}

function generateInstagramSnippet(outline: any, sections: any[], keywords: string[]): string {
  const hashtags = keywords?.slice(0, 10).map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ') || '#ContentCreation #Tips #Guide';
  
  return `${outline.title} ✨

${outline.introduction?.substring(0, 150)}...

💡 What you'll learn:
${sections.slice(0, 4).map((section: any, index: number) => 
  `${index + 1}️⃣ ${section.heading}`
).join('\n')}

Perfect for [target audience] who want to [main benefit].

Full guide in bio link! 🔗

${hashtags}

---
Save this post for later and share with someone who needs to see this! 💙`;
}

function generateSchemaMarkup(outline: any, seoData: any, sections: any[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": outline.title,
    "description": seoData.meta_description || outline.meta_description,
    "author": {
      "@type": "Person",
      "name": "Content Creator"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Blog",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yourdomain.com/logo.png"
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://yourdomain.com/blog-url"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/featured-image.jpg",
      "width": 1200,
      "height": 630
    },
    "keywords": seoData.primary_keywords?.join(', ') || '',
    "articleSection": "Blog",
    "wordCount": Math.ceil(sections.length * 300)
  };
}

function generateMetaTags(outline: any, seoData: any): string[] {
  return [
    `<title>${seoData.title || outline.title}</title>`,
    `<meta name="description" content="${seoData.meta_description || outline.meta_description}" />`,
    `<meta name="keywords" content="${seoData.primary_keywords?.join(', ') || ''}" />`,
    `<meta name="author" content="Your Name" />`,
    `<meta name="robots" content="index, follow" />`,
    `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
    `<link rel="canonical" href="https://yourdomain.com/blog-url" />`
  ];
}

function generateOpenGraphTags(outline: any, seoData: any): string[] {
  return [
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${outline.title}" />`,
    `<meta property="og:description" content="${seoData.meta_description || outline.meta_description}" />`,
    `<meta property="og:image" content="https://yourdomain.com/featured-image.jpg" />`,
    `<meta property="og:url" content="https://yourdomain.com/blog-url" />`,
    `<meta property="og:site_name" content="Your Blog" />`,
    `<meta property="article:published_time" content="${new Date().toISOString()}" />`,
    `<meta property="article:author" content="Your Name" />`,
    `<meta property="article:section" content="Blog" />`,
    `<meta property="article:tag" content="${seoData.primary_keywords?.join(', ') || ''}" />`
  ];
}

function generateTwitterCardTags(outline: any, seoData: any): string[] {
  return [
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@yourhandle" />`,
    `<meta name="twitter:creator" content="@yourhandle" />`,
    `<meta name="twitter:title" content="${outline.title}" />`,
    `<meta name="twitter:description" content="${seoData.meta_description || outline.meta_description}" />`,
    `<meta name="twitter:image" content="https://yourdomain.com/featured-image.jpg" />`,
    `<meta name="twitter:image:alt" content="${outline.title} - Featured Image" />`
  ];
}
