import json
import os
from typing import Dict, Any

class OptimizationLoader:
    def __init__(self):
        self._optimization_cache = {}
        self._load_optimization_data()
    
    def _load_optimization_data(self):
        """Load optimization data for all languages"""
        current_dir = os.path.dirname(__file__)
        
        for language in ['en', 'de']:
            file_path = os.path.join(current_dir, f"{language}.json")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    self._optimization_cache[language] = json.load(f)
            except FileNotFoundError:
                print(f"Warning: Optimization file not found for language {language}")
                if language == 'en':
                    # Fallback to empty structure if English file missing
                    self._optimization_cache[language] = {}
    
    def get_optimization_data(self, content_type: str, language: str = "en") -> Dict[str, Any]:
        """Get optimization data for specific content type and language"""
        
        # Fallback to English if language not available
        if language not in self._optimization_cache:
            language = "en"
        
        lang_data = self._optimization_cache.get(language, {})
        
        # Get content type specific data
        content_data = lang_data.get(content_type, {})
        
        # Also include posting times and hashtags
        posting_times = lang_data.get("posting_times", {}).get(content_type, {})
        hashtags = self._get_hashtags(content_type, lang_data.get("hashtags", {}))
        
        return {
            **content_data,
            "best_posting_times": posting_times,
            "hashtag_suggestions": hashtags,
            "engagement_predictions": self._get_default_predictions()
        }
    
    def _get_hashtags(self, content_type: str, hashtag_data: Dict[str, Any]) -> list:
        """Get hashtags for content type"""
        base_hashtags = hashtag_data.get("base", ["#content"])
        type_hashtags = hashtag_data.get(content_type, ["#social"])
        return base_hashtags + type_hashtags
    
    def _get_default_predictions(self) -> Dict[str, Any]:
        """Default engagement predictions"""
        return {
            "estimated_reach": 5000,
            "estimated_engagement_rate": 4.5,
            "estimated_shares": 150
        }

# Global optimization loader instance
optimization_loader = OptimizationLoader()
