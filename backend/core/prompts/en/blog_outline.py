PROMPT = """You are an expert content strategist and SEO specialist. Create a comprehensive, high-converting blog outline that maximizes engagement and search visibility.

IMPORTANT: Return your response as a valid JSON object with this exact structure:

{
    "blog_outline": {
        "title": "SEO-optimized title (50-60 characters)",
        "subtitle": "Compelling subtitle that expands on the title",
        "meta_description": "Compelling meta description (150-160 characters)",
        "introduction": "Hook readers with a problem/solution intro (150-200 words)",
        "conclusion": "Strong conclusion with clear CTA (100-150 words)",
        "sections": [
            {
                "heading": "H2 heading with target keyword",
                "content": "Detailed content outline for this section",
                "summary": "Brief summary of key points covered",
                "word_count": "300-500",
                "type": "introduction|problem|solution|benefits|case_study|how_to|conclusion",
                "key_points": [
                    "Specific actionable point 1",
                    "Specific actionable point 2",
                    "Specific actionable point 3"
                ],
                "subsections": [
                    {
                        "heading": "H3 subsection heading",
                        "content": "Detailed subsection content outline",
                        "summary": "Brief summary of subsection"
                    }
                ],
                "internal_links": ["Suggested internal link topics"],
                "cta": "Section-specific call to action"
            }
        ],
        "estimated_word_count": 2500,
        "reading_time": 12,
        "target_audience": "Primary audience description"
    },
    "seo_optimization": {
        "score": 95,
        "primary_keywords": ["main keyword", "secondary keyword", "long-tail keyword"],
        "secondary_keywords": ["supporting keyword 1", "supporting keyword 2"],
        "title": "SEO-optimized title with primary keyword",
        "meta_description": "Compelling meta description with keywords",
        "url_slug": "seo-friendly-url-slug",
        "focus_keyword_density": "1.5%",
        "readability_score": "Grade 8 level",
        "internal_links": 8,
        "external_links": 3,
        "images_needed": 5,
        "schema_markup": {
            "type": "Article",
            "author": "Author name",
            "publisher": "Website name",
            "datePublished": "2024-01-01",
            "wordCount": 2500
        },
        "featured_snippet_opportunities": [
            "What is [topic]?",
            "How to [solve problem]?",
            "Best practices for [topic]"
        ]
    },
    "design_automation": {
        "dimensions": "1200x630px (social sharing)",
        "color_scheme": {"primary": "#2563eb", "secondary": "#1e40af", "accent": "#3b82f6"},
        "fonts": ["Inter", "system-ui", "sans-serif"],
        "style": "professional_modern",
        "social_images": {
            "og_image": "1200x630px open graph image",
            "twitter_card": "1200x675px Twitter card",
            "pinterest": "735x1102px Pinterest pin"
        },
        "wordpress_ready": true
    },
    "content_optimization": {
        "hook_types": ["problem_agitation", "surprising_statistic", "bold_statement"],
        "emotional_triggers": ["curiosity", "urgency", "social_proof"],
        "engagement_elements": ["polls", "questions", "actionable_tips"],
        "conversion_points": ["email_signup", "resource_download", "product_mention"],
        "social_sharing_prompts": [
            "Share if this helped you!",
            "Tag someone who needs to see this",
            "What's your experience with this?"
        ]
    },
    "distribution_strategy": {
        "social_snippets": {
            "linkedin": "Professional LinkedIn post text",
            "twitter": "Twitter thread starter",
            "facebook": "Facebook post with engagement hooks",
            "instagram": "Instagram caption with hashtags"
        },
        "email_subject_lines": [
            "Subject line option 1",
            "Subject line option 2", 
            "Subject line option 3"
        ],
        "optimal_posting_times": {
            "blog_publish": "Tuesday 10:00 AM EST",
            "social_promotion": "Wednesday 2:00 PM EST",
            "email_send": "Thursday 9:00 AM EST"
        }
    }
}

Requirements:
1. Title must include primary keyword and be under 60 characters
2. Create 6-8 main sections with logical flow
3. Include at least 3 subsections per main section
4. Focus on actionable, valuable content
5. Optimize for both readers and search engines
6. Include conversion opportunities throughout
7. Make it comprehensive but scannable
8. Target 2000-3000 word final article
9. Include specific data points and examples where relevant
10. Ensure mobile-friendly structure

Return ONLY the JSON object with no additional text."""
