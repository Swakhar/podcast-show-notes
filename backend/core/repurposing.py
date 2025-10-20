import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from .openai_utils import call_openai_chat, CLIENT, OPENAI_AVAILABLE
from .prompts import prompt_loader
from .optimization import optimization_loader

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
                              brand_fonts: List[str] = None,
                              language: str = "en") -> Dict[str, Any]:
        """Enhanced repurposing with design automation"""
        
        results = {}
        
        # Process content types sequentially for now (can parallelize later)
        for content_type in content_types:
            try:
                result = await self._generate_content_type(
                    source_content, content_type, custom_instructions, 
                    target_audience, brand_voice, brand_colors, brand_fonts, language
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
                "estimated_engagement": self._calculate_engagement_estimate(results),
                "language": language
            }
        }
    
    async def _generate_content_type(self, source_content: str, content_type: str, 
                                   custom_instructions: str, target_audience: str, 
                                   brand_voice: str, brand_colors: Dict[str, str] = None,
                                   brand_fonts: List[str] = None,
                                   language: str = "en") -> Dict[str, Any]:
        """Generate specific content type with enhanced features"""
        
        try:
            system_prompt = prompt_loader.get_prompt(content_type, language)
        except Exception as e:
            print(f"Error loading prompt for {content_type}: {e}")
            system_prompt = self._get_default_prompt(language)
        
        # Enhanced user prompt with brand guidelines
        language_instruction = self._get_language_instruction(language)
        user_prompt = f"""
        {language_instruction}
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
            result = self._add_optimization_features(result, content_type, language)
            result["status"] = "success"
            result["language"] = language
            
            return result
            
        except Exception as e:
            print(f"OpenAI API error for {content_type}: {e}")
            return {
                "error": str(e),
                "status": "failed",
                "content_type": content_type,
                "language": language
            }
    
    def _get_default_prompt(self, language: str) -> str:
        """Get default prompt based on language"""
        if language == "de":
            return "Du bist ein hilfreicher Assistent für die Erstellung von Inhalten. Antworte auf Deutsch."
        else:
            return "You are a helpful content creation assistant. Respond in English."

    def _get_language_instruction(self, language: str) -> str:
        """Get language-specific instruction for content generation"""
        if language == "de":
            return """
            WICHTIG: Generiere den gesamten Inhalt auf Deutsch. 
            Verwende professionelle deutsche Sprache und berücksichtige deutsche Kultur und Geschäftspraktiken.
            Alle Texte, Beschreibungen und Anleitungen müssen in deutscher Sprache verfasst werden.
            """
        else:
            return """
            IMPORTANT: Generate all content in English.
            Use professional English and consider English-speaking culture and business practices.
            All text, descriptions, and instructions must be written in English.
            """

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

    def _add_optimization_features(self, result: Dict[str, Any], content_type: str, language: str) -> Dict[str, Any]:
        """Add performance optimization features with enhanced infographic support"""

        optimization_data = optimization_loader.get_optimization_data(content_type, language)
        optimization = {
            "best_posting_times": optimization_data.get("best_posting_times", {}),
            "engagement_predictions": optimization_data.get("engagement_predictions", {}), 
            "hashtag_suggestions": optimization_data.get("hashtag_suggestions", [])
        }
        
        for key, value in optimization_data.items():
            if key not in ["best_posting_times", "engagement_predictions", "hashtag_suggestions"]:
                optimization[key] = value

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
 
    def _calculate_engagement_estimate(self, results: Dict[str, Any]) -> Dict[str, float]:
        """Calculate expected engagement metrics"""
        return {
            "estimated_reach": 5000,
            "estimated_engagement_rate": 0.045,
            "estimated_shares": 150,
            "estimated_saves": 80,
            "virality_score": 0.7
        }
