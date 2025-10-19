import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from .openai_utils import call_openai_chat, CLIENT, OPENAI_AVAILABLE

class ContentRepurposer:
    def __init__(self):
        # ✅ Use existing CLIENT from openai_utils
        self.client = CLIENT
        self.openai_available = OPENAI_AVAILABLE
        self.design_templates = self._load_design_templates()
        
    async def repurpose_content(self, 
                              source_content: str, 
                              content_types: List[str],
                              custom_instructions: str = None,
                              target_audience: str = None,
                              brand_voice: str = "professional",
                              brand_colors: Dict[str, str] = None,
                              brand_fonts: List[str] = None) -> Dict[str, Any]:
        """Enhanced repurposing with design automation"""
        
        results = {}
        
        # Process content types sequentially for now (can parallelize later)
        for content_type in content_types:
            try:
                result = await self._generate_content_type(
                    source_content, content_type, custom_instructions, 
                    target_audience, brand_voice, brand_colors, brand_fonts
                )
                results[content_type] = result
            except Exception as e:
                print(f"Error generating {content_type}: {e}")
                results[content_type] = {"error": str(e), "status": "failed"}
                
        return {
            "results": results,
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "total_pieces": len(content_types),
                "success_count": sum(1 for r in results.values() if r.get("status") == "success"),
                "estimated_engagement": self._calculate_engagement_estimate(results)
            }
        }
    
    async def _generate_content_type(self, source_content: str, content_type: str, 
                                   custom_instructions: str, target_audience: str, 
                                   brand_voice: str, brand_colors: Dict[str, str] = None,
                                   brand_fonts: List[str] = None) -> Dict[str, Any]:
        """Generate specific content type with enhanced features"""
        
        # Get enhanced prompts
        prompts = {
            "linkedin_carousel": self._get_enhanced_linkedin_carousel_prompt(),
            "twitter_thread": self._get_enhanced_twitter_thread_prompt(),
            "instagram_story": self._get_enhanced_instagram_story_prompt(),
            "tiktok_script": self._get_enhanced_tiktok_script_prompt(),
            "blog_outline": self._get_enhanced_blog_outline_prompt(),
            "email_course": self._get_enhanced_email_course_prompt(),
            "infographic_data": self._get_enhanced_infographic_data_prompt()
        }
        
        system_prompt = prompts.get(content_type, "You are a helpful content creation assistant.")
        
        # Enhanced user prompt with brand guidelines
        user_prompt = f"""
        Source Content: {source_content[:4000]}
        
        Brand Guidelines:
        - Target Audience: {target_audience or 'Professional content creators and podcasters'}
        - Brand Voice: {brand_voice}
        - Brand Colors: {brand_colors or {'primary': '#9CEE69', 'secondary': '#1a1a1a'}}
        - Brand Fonts: {brand_fonts or ['Inter', 'sans-serif']}
        
        Custom Instructions: {custom_instructions or 'Create engaging, professional content that drives action'}
        
        Please create the {content_type.replace('_', ' ')} based on the source content above.
        Include specific design specifications, optimal posting times, and engagement optimization tips.
        """
        
        # ✅ Use your existing call_openai_chat function
        try:
            response_content = call_openai_chat(system_prompt, user_prompt, model="gpt-4o-mini")
            
            result = self._parse_response(response_content, content_type)
            
            # Add design automation and optimization
            result = self._enhance_with_design_automation(result, content_type, brand_colors, brand_fonts)
            result = self._add_optimization_features(result, content_type)
            result["status"] = "success"
            
            return result
            
        except Exception as e:
            print(f"OpenAI API error for {content_type}: {e}")
            return {
                "error": str(e),
                "status": "failed",
                "content_type": content_type
            }
    
    def _parse_response(self, response_content: str, content_type: str) -> Dict[str, Any]:
        """Parse the OpenAI response into structured data"""
        
        # Try to parse as JSON first
        try:
            if response_content.strip().startswith('{'):
                return json.loads(response_content)
        except json.JSONDecodeError:
            pass
        
        # Fallback: structure the text response
        return {
            "content_type": content_type,
            "raw_content": response_content,
            "structured_data": self._structure_text_response(response_content, content_type)
        }
    
    def _structure_text_response(self, text: str, content_type: str) -> Dict[str, Any]:
        """Structure plain text responses based on content type"""
        
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        if content_type == "linkedin_carousel":
            return {
                "title": lines[0] if lines else "LinkedIn Carousel",
                "slides": [{"slide_number": i+1, "content": line} for i, line in enumerate(lines[1:6])],
                "hashtags": ["#podcast", "#content", "#linkedin"]
            }
        elif content_type == "twitter_thread":
            return {
                "hook_tweet": lines[0] if lines else "Twitter Thread",
                "thread_tweets": [{"tweet_number": i+1, "content": line} for i, line in enumerate(lines[1:])],
                "hashtags": ["#thread", "#content", "#podcast"]
            }
        elif content_type == "instagram_story":
            return {
                "story_sequence": [{"story_number": i+1, "content": line} for i, line in enumerate(lines[:5])],
                "hashtags": ["#story", "#content", "#podcast"]
            }
        elif content_type == "tiktok_script":
            # ✅ Add proper TikTok structure
            return {
                "script": {
                    "title": lines[0] if lines else "TikTok Video Script",
                    "description": "Engaging TikTok content from podcast insights",
                    "estimated_duration": 30,
                    "hook_variations": [
                        "Did you know this one thing can change everything?",
                        "Most people get this completely wrong...",
                        "This might surprise you..."
                    ],
                    "scenes": [
                        {
                            "scene_number": i+1,
                            "duration": 5,
                            "type": "hook" if i == 0 else "content" if i < len(lines)-1 else "cta",
                            "action": f"Scene {i+1} action",
                            "dialogue": line,
                            "content": line,
                            "visual_cues": f"Visual cue for scene {i+1}"
                        } for i, line in enumerate(lines[:5])
                    ]
                }
            }
        else:
            return {
                "content": text,
                "sections": lines
            }
    
    def _load_design_templates(self) -> Dict[str, Any]:
        """Load design templates (placeholder)"""
        return {
            "linkedin_carousel": {"template": "professional"},
            "twitter_thread": {"template": "casual"},
            "instagram_story": {"template": "visual"}
        }
    
    def _get_enhanced_linkedin_carousel_prompt(self) -> str:
        return """You are a LinkedIn content strategist. Create a professional carousel post with:
        
        1. Hook slide: Attention-grabbing title
        2. Problem slide: Address audience pain point  
        3. Solution slides (3-5): Key insights with actionable steps
        4. CTA slide: Clear next step
        
        Format as:
        - Title: [Main carousel title]
        - Slide 1: [Hook content]
        - Slide 2: [Problem content]
        - Slide 3-5: [Solution content]
        - CTA: [Call to action]
        
        Keep each slide under 100 words. Make it engaging and professional."""
    
    def _get_enhanced_twitter_thread_prompt(self) -> str:
        return """You are a Twitter growth strategist. Create a viral thread with:
        
        1. Hook tweet: Pattern interrupt + value promise (under 280 chars)
        2. Context tweet: Setup the problem (under 280 chars)
        3. Content tweets (5-8): One insight per tweet (under 280 chars each)
        4. CTA tweet: Clear next step (under 280 chars)
        
        Format as:
        - Tweet 1: [Hook]
        - Tweet 2: [Context]
        - Tweet 3-8: [Content]
        - Final Tweet: [CTA]
        
        Use emojis strategically. Make each tweet standalone valuable."""
    
    def _get_enhanced_instagram_story_prompt(self) -> str:
        return """You are an Instagram content creator. Create story sequence with:
        
        1. Teaser story: Hook viewers in first 3 seconds
        2. Content stories (3-4): Bite-sized valuable content  
        3. Interactive story: Poll or question
        4. CTA story: Clear next step
        
        Format as:
        - Story 1: [Teaser]
        - Story 2-4: [Content]
        - Story 5: [Interactive]
        - Story 6: [CTA]
        
        Keep text minimal, focus on visual storytelling cues."""
    
    def _get_enhanced_tiktok_script_prompt(self) -> str:
        return """You are a TikTok content strategist. Create a viral TikTok video script that follows the platform's best practices.

        IMPORTANT: Return your response as a valid JSON object with this exact structure:

        {
            "script": {
                "title": "Compelling video title",
                "description": "Brief description for caption",
                "estimated_duration": 30,
                "hook_variations": [
                    "Hook option 1 - Pattern interrupt",
                    "Hook option 2 - Shocking statement", 
                    "Hook option 3 - Question hook"
                ],
                "scenes": [
                    {
                        "scene_number": 1,
                        "duration": 3,
                        "type": "hook",
                        "action": "Close-up shot, direct eye contact",
                        "dialogue": "Did you know this one mistake costs creators 90% of their views?",
                        "content": "Did you know this one mistake costs creators 90% of their views?",
                        "visual_cues": "Text overlay: '90% LOSE VIEWS'"
                    },
                    {
                        "scene_number": 2,
                        "duration": 5,
                        "type": "context",
                        "action": "Cut to problem illustration",
                        "dialogue": "Most people start their videos with boring introductions...",
                        "content": "Most people start their videos with boring introductions...",
                        "visual_cues": "Show example of bad intro"
                    },
                    {
                        "scene_number": 3,
                        "duration": 12,
                        "type": "value",
                        "action": "Quick transition to solution",
                        "dialogue": "Instead, start with a pattern interrupt or bold statement.",
                        "content": "Instead, start with a pattern interrupt or bold statement.",
                        "visual_cues": "Text overlay with tips"
                    },
                    {
                        "scene_number": 4,
                        "duration": 8,
                        "type": "proof",
                        "action": "Show results/examples",
                        "dialogue": "This simple change increased my views by 300%.",
                        "content": "This simple change increased my views by 300%.",
                        "visual_cues": "Show analytics or examples"
                    },
                    {
                        "scene_number": 5,
                        "duration": 5,
                        "type": "cta",
                        "action": "Direct call to action",
                        "dialogue": "Follow for more TikTok growth tips!",
                        "content": "Follow for more TikTok growth tips!",
                        "visual_cues": "Follow button animation"
                    }
                ]
            }
        }

        Rules:
        1. Keep total duration under 60 seconds
        2. Hook must grab attention in first 3 seconds
        3. Each scene should have clear action, dialogue, and visual cues
        4. Include trending elements and engagement tactics
        5. Make dialogue conversational and authentic
        6. Return ONLY the JSON object, no additional text"""
    
    def _get_enhanced_blog_outline_prompt(self) -> str:
        return """You are an expert content strategist and SEO specialist. Create a comprehensive, high-converting blog outline that maximizes engagement and search visibility.

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
    
    def _get_enhanced_email_course_prompt(self) -> str:
        return """You are an expert email marketing strategist and course creator. Create a comprehensive 7-day email course that converts subscribers into engaged audience members and potential customers.

IMPORTANT: Return your response as a valid JSON object with this exact structure:

{
    "email_course": {
        "title": "Course title that promises transformation",
        "description": "Brief description of what subscribers will learn",
        "target_audience": "Specific audience description",
        "course_duration": 7,
        "total_lessons": 7,
        "learning_objectives": [
            "Specific outcome 1",
            "Specific outcome 2", 
            "Specific outcome 3"
        ],
        "emails": [
            {
                "day": 1,
                "email_type": "welcome",
                "subject": "Welcome! Your [Course Topic] journey starts now 🚀",
                "preview_text": "What to expect + your first lesson inside...",
                "content": "Welcome to the course! Here's what you'll learn over the next 7 days...\n\nLesson 1: Foundation concepts\n\nYour action step for today: [specific task]\n\nTomorrow we'll dive into [next topic].",
                "key_points": [
                    "Set expectations for the course",
                    "Deliver immediate value",
                    "Build excitement for what's coming"
                ],
                "cta": {
                    "text": "Get Your Free Starter Template",
                    "url": "[RESOURCE_LINK]",
                    "type": "resource_download"
                },
                "estimated_read_time": "3 minutes",
                "word_count": 400,
                "personalization_tokens": ["[FIRST_NAME]", "[COURSE_TOPIC]"]
            },
            {
                "day": 2,
                "email_type": "foundation",
                "subject": "The #1 mistake that's holding you back",
                "preview_text": "Most people get this wrong (here's how to fix it)",
                "content": "Yesterday we covered the basics. Today, let's tackle the biggest obstacle...\n\nThe mistake: [specific problem]\nWhy it happens: [root cause]\nHow to fix it: [solution steps]\n\nAction step: [specific task]",
                "key_points": [
                    "Identify common mistake",
                    "Explain why it happens",
                    "Provide clear solution"
                ],
                "cta": {
                    "text": "Download the Fix-It Checklist",
                    "url": "[CHECKLIST_LINK]",
                    "type": "resource_download"
                },
                "estimated_read_time": "4 minutes",
                "word_count": 500,
                "personalization_tokens": ["[FIRST_NAME]", "[SPECIFIC_CHALLENGE]"]
            },
            {
                "day": 3,
                "email_type": "deep_dive",
                "subject": "The framework that changed everything",
                "preview_text": "Step-by-step system used by top performers",
                "content": "Ready for the good stuff? Here's the exact framework that transforms [outcome]...\n\nStep 1: [action]\nStep 2: [action]\nStep 3: [action]\n\nReal example: [case study snippet]\n\nYour turn: [specific assignment]",
                "key_points": [
                    "Introduce proven framework",
                    "Break down into actionable steps",
                    "Show real-world example"
                ],
                "cta": {
                    "text": "Get the Complete Framework Template",
                    "url": "[FRAMEWORK_LINK]",
                    "type": "resource_download"
                },
                "estimated_read_time": "5 minutes",
                "word_count": 600,
                "personalization_tokens": ["[FIRST_NAME]", "[OUTCOME]", "[INDUSTRY]"]
            },
            {
                "day": 4,
                "email_type": "case_study",
                "subject": "How [Name] went from zero to hero in 30 days",
                "preview_text": "Real results + the exact steps they took",
                "content": "Meet [Name], who was struggling with [problem] just like you...\n\nTheir situation: [before state]\nWhat they did: [actions taken]\nThe results: [specific outcomes]\n\nThe key insight: [main takeaway]\n\nHow you can apply this: [actionable steps]",
                "key_points": [
                    "Share compelling success story",
                    "Show transformation journey",
                    "Extract actionable insights"
                ],
                "cta": {
                    "text": "See More Success Stories",
                    "url": "[TESTIMONIALS_LINK]",
                    "type": "social_proof"
                },
                "estimated_read_time": "4 minutes",
                "word_count": 550,
                "personalization_tokens": ["[FIRST_NAME]", "[SIMILAR_SITUATION]"]
            },
            {
                "day": 5,
                "email_type": "advanced_tactics",
                "subject": "Advanced tactics (for serious students only)",
                "preview_text": "Ready to level up? Here's what pros do differently",
                "content": "You've mastered the basics. Time for advanced strategies...\n\nAdvanced Tactic #1: [strategy]\nWhy it works: [explanation]\nHow to implement: [steps]\n\nAdvanced Tactic #2: [strategy]\nPro tip: [insider insight]\n\nWarning: [common pitfall to avoid]",
                "key_points": [
                    "Reward engagement with advanced content",
                    "Separate serious students from casual browsers",
                    "Provide insider-level insights"
                ],
                "cta": {
                    "text": "Join Our Advanced Community",
                    "url": "[COMMUNITY_LINK]",
                    "type": "community_join"
                },
                "estimated_read_time": "6 minutes",
                "word_count": 650,
                "personalization_tokens": ["[FIRST_NAME]", "[SKILL_LEVEL]"]
            },
            {
                "day": 6,
                "email_type": "troubleshooting",
                "subject": "Stuck? Here's how to breakthrough",
                "preview_text": "Common roadblocks + how to overcome them",
                "content": "Hitting some roadblocks? That's totally normal. Here are the most common challenges and solutions...\n\nChallenge #1: [obstacle]\nSolution: [fix]\n\nChallenge #2: [obstacle]\nSolution: [fix]\n\nChallenge #3: [obstacle]\nSolution: [fix]\n\nRemember: [encouragement]",
                "key_points": [
                    "Address common implementation challenges",
                    "Provide specific solutions",
                    "Encourage persistence"
                ],
                "cta": {
                    "text": "Get Personal Help (Free)",
                    "url": "[SUPPORT_LINK]",
                    "type": "support_offer"
                },
                "estimated_read_time": "5 minutes",
                "word_count": 575,
                "personalization_tokens": ["[FIRST_NAME]", "[COMMON_CHALLENGE]"]
            },
            {
                "day": 7,
                "email_type": "graduation",
                "subject": "🎓 Congratulations graduate! What's next?",
                "preview_text": "You did it! Plus your next steps...",
                "content": "Congratulations! You've completed the 7-day course. Here's what you've accomplished...\n\n✅ [Achievement 1]\n✅ [Achievement 2]\n✅ [Achievement 3]\n\nWhat's next?\n1. [Next step]\n2. [Next step]\n3. [Next step]\n\nSpecial offer for graduates: [exclusive offer]",
                "key_points": [
                    "Celebrate completion",
                    "Summarize achievements",
                    "Present next level opportunity"
                ],
                "cta": {
                    "text": "Continue Your Journey (Special Offer)",
                    "url": "[OFFER_LINK]",
                    "type": "product_offer"
                },
                "estimated_read_time": "4 minutes",
                "word_count": 500,
                "personalization_tokens": ["[FIRST_NAME]", "[BIGGEST_WIN]", "[NEXT_GOAL]"]
            }
        ],
        "automation_setup": {
            "trigger": "Lead magnet signup",
            "delay_between_emails": "24 hours",
            "send_time": "9:00 AM subscriber timezone",
            "tags_to_add": ["email_course_subscriber", "engaged_prospect"],
            "segments": ["course_completers", "non_openers", "high_engagement"]
        },
        "bonus_content": {
            "welcome_bonus": "Starter template/checklist",
            "mid_course_bonus": "Framework template",
            "completion_bonus": "Advanced guide or consultation call",
            "resource_library": ["Templates", "Checklists", "Video tutorials", "Case studies"]
        }
    },
    "design_specs": {
        "email_template": "clean_professional",
        "color_scheme": {"primary": "#2563eb", "secondary": "#1e40af", "accent": "#3b82f6"},
        "fonts": ["Inter", "system-ui", "sans-serif"],
        "mobile_optimized": true,
        "personalization_level": "high",
        "cta_style": "button",
        "header_image": true,
        "social_proof_placement": "footer"
    },
    "email_analytics": {
        "expected_open_rates": {
            "email_1": "45-55%",
            "email_2": "35-45%", 
            "email_3": "30-40%",
            "email_4": "28-38%",
            "email_5": "25-35%",
            "email_6": "23-33%",
            "email_7": "20-30%"
        },
        "expected_click_rates": {
            "email_1": "8-12%",
            "email_2": "6-10%",
            "email_3": "5-9%",
            "email_4": "4-8%",
            "email_5": "4-7%",
            "email_6": "3-6%",
            "email_7": "5-10%"
        },
        "completion_rate": "65-75%",
        "conversion_to_paid": "3-8%"
    },
    "optimization_tips": {
        "subject_line_testing": [
            "Test emoji vs no emoji",
            "Test question vs statement",
            "Test urgency vs curiosity"
        ],
        "content_optimization": [
            "Keep emails scannable with bullet points",
            "Include personal stories and examples",
            "End each email with clear next step"
        ],
        "timing_optimization": [
            "Test different send times",
            "Consider subscriber timezone",
            "Monitor engagement patterns"
        ],
        "personalization_opportunities": [
            "Use first name throughout",
            "Reference previous interactions",
            "Tailor content to subscriber interests"
        ]
    }
}

Requirements:
1. Create compelling subject lines that get opened
2. Include clear value proposition in each email
3. Build logical progression from basic to advanced
4. Include specific action steps in every email
5. Provide downloadable resources for engagement
6. Address common objections and challenges
7. Include social proof and success stories
8. Create natural progression to paid offerings
9. Optimize for mobile email clients
10. Include automation and segmentation guidance

Return ONLY the JSON object with no additional text."""
    
    def _get_enhanced_infographic_data_prompt(self) -> str:
        return """You are an expert data visualization specialist and infographic designer. Create comprehensive infographic content that transforms complex information into visually compelling, shareable graphics.

IMPORTANT: Return your response as a valid JSON object with this exact structure:

{
    "infographic": {
        "title": "Compelling main headline (8-12 words)",
        "subtitle": "Supporting tagline that adds context",
        "category": "statistics|process|comparison|timeline|howto",
        "target_audience": "Specific audience description",
        "main_message": "Core takeaway in one sentence",
        "data_points": [
            {
                "label": "Key statistic label",
                "value": "85%",
                "type": "percentage|number|currency|time",
                "description": "Brief explanation of what this means",
                "source": "Data source or 'Podcast insights'",
                "visual_suggestion": "Icon or visual element suggestion",
                "color_priority": "primary|secondary|accent",
                "size_emphasis": "large|medium|small"
            },
            {
                "label": "Another key insight",
                "value": "3.2x",
                "type": "multiplier",
                "description": "Context for this multiplier",
                "source": "Research study or podcast content",
                "visual_suggestion": "Growth arrow or chart icon",
                "color_priority": "primary",
                "size_emphasis": "large"
            }
        ],
        "process_steps": [
            {
                "step_number": 1,
                "title": "Step title",
                "description": "Brief step description",
                "icon_suggestion": "Icon recommendation",
                "estimated_time": "5 minutes",
                "difficulty": "easy|medium|hard"
            }
        ],
        "visual_hierarchy": {
            "header_section": "Title and main visual hook",
            "data_section": "Key statistics prominently displayed",
            "process_section": "Step-by-step breakdown",
            "footer_section": "CTA and branding"
        },
        "call_to_action": {
            "text": "Learn More",
            "url": "[CTA_LINK]",
            "placement": "bottom_right",
            "style": "button"
        },
        "estimated_views": 15000,
        "shareability_score": 8.5
    },
    "design_specs": {
        "dimensions": "800x2000px (vertical scroll)",
        "format": "PNG/SVG for web, PDF for print",
        "color_palette": {
            "primary": "#2563eb",
            "secondary": "#1e40af", 
            "accent": "#3b82f6",
            "background": "#f8fafc",
            "text": "#1e293b"
        },
        "fonts": {
            "heading": "Inter Bold",
            "subheading": "Inter SemiBold", 
            "body": "Inter Regular",
            "data": "Inter Black"
        },
        "layout_style": "modern_minimal|bold_impact|professional_corporate",
        "icon_style": "outlined|filled|duotone",
        "chart_types": ["bar", "pie", "line", "donut", "progress"],
        "mobile_optimized": true
    },
    "template_variations": [
        {
            "name": "Modern Minimal",
            "style": "clean",
            "colors": ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD"],
            "layout": "vertical_flow",
            "best_for": "Professional/B2B content"
        },
        {
            "name": "Bold Impact", 
            "style": "dynamic",
            "colors": ["#DC2626", "#EF4444", "#F87171", "#FCA5A5"],
            "layout": "grid_sections",
            "best_for": "Attention-grabbing stats"
        },
        {
            "name": "Professional Corporate",
            "style": "corporate",
            "colors": ["#059669", "#10B981", "#34D399", "#6EE7B7"],
            "layout": "structured_timeline",
            "best_for": "Business presentations"
        }
    ],
    "export_formats": {
        "social_media": {
            "instagram_post": "1080x1080px square version",
            "instagram_story": "1080x1920px vertical version",
            "linkedin": "1200x627px horizontal version",
            "twitter": "1200x675px optimized for timeline",
            "pinterest": "735x1102px tall pin format"
        },
        "professional": {
            "pdf_print": "300dpi print-ready PDF",
            "powerpoint": "Editable PPTX slides",
            "keynote": "Mac presentation format",
            "svg_vector": "Scalable vector format"
        },
        "web": {
            "png_web": "Optimized for websites",
            "webp": "Modern web format",
            "jpg_compressed": "Smaller file size option"
        }
    },
    "data_visualization": {
        "chart_recommendations": [
            {
                "data_type": "percentages",
                "best_chart": "donut_chart",
                "alternative": "horizontal_bar"
            },
            {
                "data_type": "comparisons", 
                "best_chart": "bar_chart",
                "alternative": "column_chart"
            },
            {
                "data_type": "trends",
                "best_chart": "line_chart", 
                "alternative": "area_chart"
            }
        ],
        "color_coding": {
            "positive_data": "#10B981",
            "negative_data": "#EF4444", 
            "neutral_data": "#6B7280",
            "highlight_data": "#F59E0B"
        }
    }
}

Requirements:
1. Focus on 5-7 key data points maximum
2. Make statistics visually impactful and memorable
3. Include clear visual hierarchy suggestions
4. Provide multiple template variations
5. Optimize for social media sharing
6. Include specific design specifications
7. Suggest appropriate chart types for data
8. Make content scannable in 10 seconds
9. Include actionable insights, not just data
10. Provide export formats for different use cases

Return ONLY the JSON object with no additional text."""

    def _enhance_with_design_automation(self, result: Dict[str, Any], content_type: str, 
                                      brand_colors: Dict[str, str], brand_fonts: List[str]) -> Dict[str, Any]:
        """Add automated design elements and templates"""
        
        design_automation = {
            "canvas_templates": self._generate_canvas_templates(content_type, brand_colors),
            "dimensions": self._get_optimal_dimensions(content_type),
            "color_scheme": brand_colors or {"primary": "#9CEE69", "secondary": "#1a1a1a"},
            "fonts": brand_fonts or ["Inter", "sans-serif"]
        }
        
        result["design_automation"] = design_automation
        return result
    
    def _add_optimization_features(self, result: Dict[str, Any], content_type: str) -> Dict[str, Any]:
        """Add performance optimization features with enhanced infographic support"""
        
        optimization = {
            "best_posting_times": self._get_optimal_posting_times(content_type),
            "engagement_predictions": self._predict_engagement(content_type),
            "hashtag_suggestions": self._get_hashtag_suggestions(content_type)
        }
        
        # ✅ Enhanced blog-specific optimizations
        if content_type == "blog_outline":
            optimization.update({
                "content_upgrades": [
                    "Downloadable checklist",
                    "Email course signup",
                    "Resource library access",
                    "Free consultation offer"
                ],
                "internal_linking_strategy": {
                    "pillar_pages": ["Main topic pillar page", "Related topic pillar"],
                    "cluster_content": ["Supporting article 1", "Supporting article 2"],
                    "conversion_pages": ["About page", "Services page", "Contact page"]
                },
                "promotion_checklist": [
                    "Share on LinkedIn with professional angle",
                    "Create Twitter thread with key points", 
                    "Design Instagram carousel with main insights",
                    "Send to email list with value-first approach",
                    "Reach out for backlink opportunities",
                    "Submit to content aggregators",
                    "Create YouTube video version",
                    "Repurpose into podcast episode"
                ],
                "conversion_optimization": {
                    "lead_magnets": ["Checklist", "Template", "Cheat sheet", "Mini-course"],
                    "cta_placement": ["After introduction", "Mid-content", "Before conclusion"],
                    "social_proof": ["Testimonials", "Case studies", "User statistics"],
                    "urgency_elements": ["Limited time offer", "Exclusive content", "Early access"]
                }
            })
        
        # ✅ NEW: Email course specific optimizations
        elif content_type == "email_course":
            optimization.update({
                "automation_platforms": {
                    "mailchimp": "Automation workflow setup guide",
                    "convertkit": "Sequence creation instructions",
                    "activecampaign": "Advanced automation setup",
                    "klaviyo": "E-commerce focused sequences"
                },
                "segmentation_strategy": {
                    "engagement_based": ["High openers", "Click-through users", "Non-engagers"],
                    "behavior_based": ["Course completers", "Resource downloaders", "Link clickers"],
                    "demographic": ["Industry", "Company size", "Experience level"]
                },
                "deliverability_optimization": [
                    "Use consistent from name and email",
                    "Avoid spam trigger words",
                    "Include unsubscribe link",
                    "Maintain clean email list",
                    "Monitor sender reputation"
                ],
                "conversion_optimization": {
                    "lead_magnets": ["7-day course preview", "Bonus email templates", "Success tracker"],
                    "upsell_opportunities": ["Advanced course", "1:1 coaching", "Done-for-you services"],
                    "retention_tactics": ["Bonus content", "Community access", "Live Q&A sessions"],
                    "re-engagement_campaigns": ["Win-back sequences", "Content highlights", "Special offers"]
                },
                "a_b_test_ideas": [
                    "Subject line variations",
                    "Send time optimization",
                    "CTA button text",
                    "Email length (short vs long)",
                    "Personalization level"
                ]
            })
        
        # ✅ NEW: Infographic specific optimizations
        elif content_type == "infographic_data":
            optimization.update({
                "design_tools": {
                    "canva": "Ready-to-use Canva templates",
                    "figma": "Professional design components",
                    "adobe_illustrator": "Vector-based templates",
                    "piktochart": "Infographic-specific tool"
                },
                "distribution_strategy": {
                    "social_platforms": ["LinkedIn", "Instagram", "Pinterest", "Twitter"],
                    "content_syndication": ["SlideShare", "Scribd", "Visual.ly"],
                    "email_marketing": "Include in newsletters",
                    "blog_integration": "Embed in related articles"
                },
                "seo_optimization": [
                    "Alt text for all visual elements",
                    "Descriptive filename optimization",
                    "Schema markup for infographics",
                    "Backlink opportunities through visual content"
                ],
                "engagement_tactics": {
                    "interactive_elements": ["Clickable sections", "Hover effects", "Animated reveals"],
                    "social_sharing": ["Platform-specific sizing", "Share-friendly formats"],
                    "lead_generation": ["Gated high-res downloads", "Email signup for templates"],
                    "virality_features": ["Shareable quotes", "Statistic callouts", "Branded elements"]
                },
                "performance_tracking": [
                    "Social media share counts",
                    "Download/save metrics",
                    "Backlink acquisition",
                    "Traffic referral data",
                    "Lead generation conversion"
                ]
            })
        
        result["optimization"] = optimization
        return result

    def _generate_canvas_templates(self, content_type: str, brand_colors: Dict[str, str]) -> Dict[str, Any]:
        """Generate Canvas/design tool templates"""
        return {
            "template_name": f"{content_type}_template",
            "dimensions": self._get_optimal_dimensions(content_type),
            "color_scheme": brand_colors or {"primary": "#9CEE69", "secondary": "#1a1a1a"}
        }
    
    def _get_optimal_dimensions(self, content_type: str) -> Dict[str, str]:
        """Get optimal dimensions for each content type"""
        dimensions = {
            "linkedin_carousel": "1080x1080px",
            "twitter_thread": "1200x675px", 
            "instagram_story": "1080x1920px",
            "tiktok_script": "1080x1920px",
            "blog_outline": "1200x630px",
            "email_course": "600x400px",
            "infographic_data": "800x2000px"
        }
        return {"dimensions": dimensions.get(content_type, "1080x1080px")}
    
    def _get_optimal_posting_times(self, content_type: str) -> Dict[str, Any]:
        """Get platform-specific optimal posting times with infographic support"""
        schedules = {
            "linkedin_carousel": {
                "best_days": ["Tuesday", "Wednesday", "Thursday"],
                "best_times": ["8:00 AM", "12:00 PM", "5:00 PM"],
                "timezone": "EST"
            },
            "twitter_thread": {
                "best_days": ["Monday", "Tuesday", "Wednesday"],
                "best_times": ["9:00 AM", "1:00 PM", "3:00 PM"],
                "timezone": "EST"  
            },
            "instagram_story": {
                "best_days": ["Wednesday", "Thursday", "Friday"],
                "best_times": ["11:00 AM", "2:00 PM", "8:00 PM"],
                "timezone": "EST"
            },
            "blog_outline": {
                "best_days": ["Tuesday", "Wednesday", "Thursday"],
                "best_times": ["10:00 AM", "2:00 PM"],
                "timezone": "EST",
                "promotion_schedule": {
                    "immediate": "Share on social within 1 hour",
                    "day_1": "Email to subscribers",
                    "day_3": "LinkedIn article version",
                    "week_1": "Twitter thread with key points",
                    "week_2": "Instagram carousel design",
                    "month_1": "Repurpose into video content"
                }
            },
            # ✅ NEW: Email course specific timing
            "email_course": {
                "best_days": ["Tuesday", "Wednesday", "Thursday"],
                "best_times": ["9:00 AM", "2:00 PM", "6:00 PM"],
                "timezone": "Subscriber's timezone",
                "automation_schedule": {
                    "welcome_email": "Immediate (within 5 minutes)",
                    "email_2": "24 hours after signup",
                    "email_3": "48 hours after signup", 
                    "email_4": "72 hours after signup",
                    "email_5": "96 hours after signup",
                    "email_6": "120 hours after signup",
                    "email_7": "144 hours after signup"
                },
                "optimization_notes": [
                    "Test different time zones for global audience",
                    "Avoid Mondays (high inbox volume)",
                    "Avoid Fridays (lower engagement)",
                    "Consider B2B vs B2C audience timing differences",
                    "Monitor open rates and adjust accordingly"
                ]
            },
            # ✅ NEW: Infographic specific timing
            "infographic_data": {
                "best_days": ["Tuesday", "Wednesday", "Thursday"],
                "best_times": ["10:00 AM", "2:00 PM", "7:00 PM"],
                "timezone": "EST",
                "platform_specific": {
                    "linkedin": "Tuesday-Thursday 8:00 AM - 10:00 AM",
                    "instagram": "Wednesday-Friday 11:00 AM - 1:00 PM", 
                    "pinterest": "Saturday-Sunday 8:00 PM - 11:00 PM",
                    "twitter": "Monday-Friday 12:00 PM - 3:00 PM"
                },
                "distribution_schedule": {
                    "immediate": "Post on primary platform",
                    "2_hours": "Share on secondary platforms",
                    "day_1": "Email to subscribers",
                    "day_3": "Submit to content aggregators",
                    "week_1": "Reach out for backlinks",
                    "week_2": "Repurpose into carousel/thread"
                }
            }
        }
        return schedules.get(content_type, {"best_days": ["Monday-Friday"], "best_times": ["9:00 AM", "2:00 PM"]})
    
    def _predict_engagement(self, content_type: str) -> Dict[str, Any]:
        """Predict engagement metrics"""
        return {
            "estimated_reach": 5000,
            "estimated_engagement_rate": 4.5,
            "estimated_shares": 150
        }
    
    def _get_hashtag_suggestions(self, content_type: str) -> List[str]:
        """Get relevant hashtags with infographic support"""
        base_hashtags = ["#podcast", "#content", "#marketing"]
        
        type_specific = {
            "linkedin_carousel": ["#linkedin", "#professional", "#business"],
            "twitter_thread": ["#thread", "#twitter", "#tips"],
            "instagram_story": ["#story", "#instagram", "#visual"],
            "email_course": ["#emailmarketing", "#onlinelearning", "#education", "#course"],
            "infographic_data": ["#infographic", "#datavisualization", "#statistics", "#insights", "#visual"]
        }
        
        return base_hashtags + type_specific.get(content_type, ["#social", "#media"])
    
    def _calculate_engagement_estimate(self, results: Dict[str, Any]) -> Dict[str, float]:
        """Calculate expected engagement metrics"""
        return {
            "estimated_reach": 5000,
            "estimated_engagement_rate": 0.045,
            "estimated_shares": 150,
            "estimated_saves": 80,
            "virality_score": 0.7
        }
