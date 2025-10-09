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
        return """Create a TikTok video script with:
        
        1. Hook (0-3s): Pattern interrupt or shocking statement
        2. Context (3-8s): Setup the situation
        3. Value (8-45s): Main content with quick transitions
        4. CTA (45-60s): Follow or share request
        
        Include production notes for visuals and timing."""
    
    def _get_enhanced_blog_outline_prompt(self) -> str:
        return """Create a comprehensive blog outline with:
        
        1. SEO-optimized title (under 60 chars)
        2. Meta description (under 160 chars)
        3. Introduction hook
        4. Main sections (H2 headings)
        5. Subsections (H3 headings)
        6. Conclusion with CTA
        
        Include keyword suggestions and internal linking opportunities."""
    
    def _get_enhanced_email_course_prompt(self) -> str:
        return """Create a 7-part email course outline with:
        
        1. Welcome email: Set expectations
        2. Foundation emails (2-3): Core concepts
        3. Deep-dive emails (2-3): Advanced tactics
        4. Case study email: Real examples
        5. Final email: Summary and next steps
        
        Include subject lines and key points for each email."""
    
    def _get_enhanced_infographic_data_prompt(self) -> str:
        return """Create infographic content with:
        
        1. Main headline
        2. Key statistics (5-7 data points)
        3. Process steps or timeline
        4. Visual hierarchy suggestions
        5. Color and design recommendations
        
        Focus on shareable, visual content."""
    
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
        """Add performance optimization features"""
        
        optimization = {
            "best_posting_times": self._get_optimal_posting_times(content_type),
            "engagement_predictions": self._predict_engagement(content_type),
            "hashtag_suggestions": self._get_hashtag_suggestions(content_type)
        }
        
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
        """Get platform-specific optimal posting times"""
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
        """Get relevant hashtags"""
        base_hashtags = ["#podcast", "#content", "#marketing"]
        
        type_specific = {
            "linkedin_carousel": ["#linkedin", "#professional", "#business"],
            "twitter_thread": ["#thread", "#twitter", "#tips"],
            "instagram_story": ["#story", "#instagram", "#visual"]
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
