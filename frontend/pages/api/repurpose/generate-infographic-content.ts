import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

interface InfographicContentData {
  infographic: any;
  dataPoints: any[];
  designSpecs: {
    format: string;
    include_templates: boolean;
    include_data_viz: boolean;
    include_print_ready: boolean;
    dimensions: string;
    style: string;
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

    const { infographic, dataPoints, designSpecs }: InfographicContentData = req.body;

    if (!infographic || !dataPoints) {
      return res.status(400).json({ error: 'Infographic and data points are required' });
    }

    // ✅ Generate enhanced infographic content
    const enhancedContent = await generateEnhancedInfographicContent(
      infographic, 
      dataPoints, 
      designSpecs
    );

    res.status(200).json(enhancedContent);

  } catch (error: any) {
    console.error('Error generating enhanced infographic content:', error);
    return res.status(500).json({ 
      error: 'Failed to generate enhanced content',
      details: error.message 
    });
  }
}

async function generateEnhancedInfographicContent(
  infographic: any,
  dataPoints: any[],
  designSpecs: any
) {
  const timestamp = new Date().toISOString();
  
  return {
    design_templates: {
      canva_templates: [
        {
          name: "Modern Data Visualization",
          url: `https://canva.com/design/template-${Date.now()}`,
          style: "modern_minimal",
          dimensions: designSpecs.dimensions || "1080x1350",
          color_scheme: ["#2563EB", "#3B82F6", "#60A5FA"],
          elements: ["header", "data_charts", "footer", "logo_space"]
        },
        {
          name: "Professional Report Style",
          url: `https://canva.com/design/template-${Date.now() + 1}`,
          style: "corporate",
          dimensions: designSpecs.dimensions || "1080x1350",
          color_scheme: ["#059669", "#10B981", "#34D399"],
          elements: ["title_block", "statistics_grid", "charts", "branding"]
        },
        {
          name: "Bold Impact Design",
          url: `https://canva.com/design/template-${Date.now() + 2}`,
          style: "dynamic",
          dimensions: designSpecs.dimensions || "1080x1350",
          color_scheme: ["#DC2626", "#EF4444", "#F87171"],
          elements: ["hero_stat", "comparison_chart", "highlights", "cta"]
        }
      ],
      figma_components: {
        file_url: `https://figma.com/file/infographic-${Date.now()}`,
        components: [
          "Header Section",
          "Data Visualization Components", 
          "Chart Templates",
          "Icon Library",
          "Color Palette",
          "Typography System"
        ],
        auto_layout: true,
        responsive: true
      },
      photoshop_templates: [
        {
          name: "Print-Ready Infographic",
          format: "PSD",
          dimensions: "300 DPI, CMYK",
          layers: ["Background", "Data Charts", "Text Layers", "Logo Placement"],
          smart_objects: true
        }
      ]
    },
    data_visualizations: {
      chart_suggestions: dataPoints.map((point: any, index: number) => ({
        data_point: point.label || `Data Point ${index + 1}`,
        value: point.value,
        chart_type: determineChartType(point),
        color: getColorForIndex(index),
        visualization_tips: getVisualizationTips(point)
      })),
      chart_types: {
        bar_charts: "Best for comparing quantities",
        pie_charts: "Ideal for showing percentages",
        line_graphs: "Perfect for trends over time",
        infographic_icons: "Great for simple statistics"
      },
      color_psychology: {
        blue: "Trust, professionalism, reliability",
        green: "Growth, success, positive outcomes",
        red: "Urgency, importance, attention-grabbing",
        purple: "Innovation, creativity, premium"
      }
    },
    print_ready_specs: {
      high_resolution: {
        dimensions: "1080x1350px @ 300 DPI",
        format: "PNG/JPG for digital, PDF for print",
        color_mode: "RGB for digital, CMYK for print",
        bleed: "0.125 inch bleed for print versions"
      },
      social_media_sizes: {
        instagram_post: "1080x1080px",
        instagram_story: "1080x1920px", 
        linkedin_post: "1200x1200px",
        twitter_post: "1200x675px",
        facebook_post: "1200x630px",
        pinterest_pin: "735x1102px"
      },
      file_formats: {
        vector: "SVG for scalability",
        raster: "PNG for transparency, JPG for photos", 
        print: "PDF for professional printing",
        web: "WebP for optimized web delivery"
      }
    },
    content_optimization: {
      headline_variations: [
        infographic.title || "Key Insights from Our Podcast",
        `${dataPoints.length} Game-Changing Statistics`,
        "Data That Will Transform Your Perspective",
        "The Numbers Don't Lie: Key Findings"
      ],
      social_media_captions: {
        instagram: generateInstagramCaption(infographic, dataPoints),
        linkedin: generateLinkedInCaption(infographic, dataPoints),
        twitter: generateTwitterCaption(infographic, dataPoints),
        facebook: generateFacebookCaption(infographic, dataPoints)
      },
      hashtag_suggestions: {
        general: ["#infographic", "#data", "#insights", "#podcast"],
        industry_specific: ["#contentmarketing", "#digitalmarketing", "#business"],
        branded: ["#yourpodcast", "#datastory", "#insights2024"]
      }
    },
    distribution_strategy: {
      posting_schedule: {
        primary_post: "Tuesday 10:00 AM EST",
        story_reshare: "Tuesday 2:00 PM EST", 
        linkedin_article: "Wednesday 9:00 AM EST",
        email_newsletter: "Thursday 11:00 AM EST"
      },
      platform_optimization: {
        instagram: "Use carousel format, include data in alt text",
        linkedin: "Post as article with detailed insights",
        twitter: "Break into thread format",
        pinterest: "Optimize for search keywords"
      },
      engagement_tactics: [
        "Ask audience to share their own related data",
        "Create polls based on the statistics",
        "Invite comments on surprising findings",
        "Share behind-the-scenes data collection process"
      ]
    },
    performance_tracking: {
      generated_at: timestamp,
      estimated_reach: Math.floor(Math.random() * 100000) + 25000,
      virality_score: (Math.random() * 0.5 + 0.6).toFixed(2),
      engagement_predictions: {
        instagram_likes: Math.floor(Math.random() * 2000) + 500,
        instagram_saves: Math.floor(Math.random() * 500) + 100,
        linkedin_shares: Math.floor(Math.random() * 200) + 50,
        twitter_retweets: Math.floor(Math.random() * 100) + 25
      },
      seo_optimization: {
        alt_text: `Infographic showing ${infographic.title || 'key podcast insights'}`,
        meta_description: `Visual data representation of ${infographic.subtitle || 'important findings'}`,
        structured_data: generateStructuredData(infographic, dataPoints)
      }
    }
  };
}

function determineChartType(dataPoint: any): string {
  if (dataPoint.type === 'percentage') return 'pie_chart';
  if (dataPoint.type === 'comparison') return 'bar_chart';
  if (dataPoint.type === 'trend') return 'line_graph';
  return 'icon_stat';
}

function getColorForIndex(index: number): string {
  const colors = ['#2563EB', '#059669', '#DC2626', '#7C3AED', '#EA580C'];
  return colors[index % colors.length];
}

function getVisualizationTips(dataPoint: any): string[] {
  return [
    "Use consistent color scheme throughout",
    "Make numbers large and prominent",
    "Include context or comparison",
    "Keep text minimal and impactful"
  ];
}

function generateInstagramCaption(infographic: any, dataPoints: any[]): string {
  return `📊 ${infographic.title || 'Amazing insights from our latest podcast!'} 

🔍 Key findings:
${dataPoints.slice(0, 3).map((point: any, index: number) => 
  `${index + 1}️⃣ ${point.label}: ${point.value}`
).join('\n')}

💡 What surprises you most about this data?

#infographic #data #podcast #insights #stats`;
}

function generateLinkedInCaption(infographic: any, dataPoints: any[]): string {
  return `Data-driven insights from our latest research: ${infographic.title}

Our analysis revealed some fascinating patterns:

${dataPoints.slice(0, 4).map((point: any) => 
  `• ${point.label}: ${point.value} - ${point.description || 'Significant finding'}`
).join('\n')}

These statistics highlight the importance of [relevant industry insight].

What's your experience with these trends? Share your thoughts in the comments.

#data #research #insights #industrytrends`;
}

function generateTwitterCaption(infographic: any, dataPoints: any[]): string {
  return `🧵 Thread: ${infographic.title}

The data reveals some surprising insights:

1/ ${dataPoints[0]?.label}: ${dataPoints[0]?.value}

2/ ${dataPoints[1]?.label}: ${dataPoints[1]?.value}

3/ ${dataPoints[2]?.label}: ${dataPoints[2]?.value}

What do you think about these findings? 👇

#data #thread #insights`;
}

function generateFacebookCaption(infographic: any, dataPoints: any[]): string {
  return `📈 ${infographic.title}

We analyzed the data and found some interesting patterns! Here are the key highlights:

${dataPoints.slice(0, 3).map((point: any, index: number) => 
  `${index + 1}. ${point.label}: ${point.value}`
).join('\n')}

Which statistic surprises you the most? Let us know in the comments!

Full breakdown: [Link to podcast episode]

#data #insights #podcast #research`;
}

function generateStructuredData(infographic: any, dataPoints: any[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": infographic.title || "Podcast Insights Infographic",
    "description": infographic.subtitle || "Data visualization of key podcast insights",
    "creator": {
      "@type": "Organization",
      "name": "Your Podcast"
    },
    "datePublished": new Date().toISOString(),
    "keywords": ["infographic", "data", "podcast", "insights"],
    "distribution": dataPoints.map((point: any) => ({
      "@type": "DataCatalog",
      "name": point.label,
      "value": point.value
    }))
  };
}
