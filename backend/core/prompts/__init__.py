import importlib
from typing import Dict, Any

class PromptLoader:
    def __init__(self):
        self._prompts_cache = {}
    
    def get_prompt(self, content_type: str, language: str = "en") -> str:
        """Load prompt for specific content type and language"""
        cache_key = f"{content_type}_{language}"
        
        if cache_key in self._prompts_cache:
            return self._prompts_cache[cache_key]
        
        try:
            # Import the specific prompt module
            module_name = f"core.prompts.{language}.{content_type}"
            module = importlib.import_module(module_name)
            prompt = getattr(module, 'PROMPT')
            
            # Cache the prompt
            self._prompts_cache[cache_key] = prompt
            return prompt
            
        except (ImportError, AttributeError) as e:
            print(f"Warning: Could not load prompt for {content_type} in {language}, falling back to English")
            # Fallback to English if German not available
            if language != "en":
                return self.get_prompt(content_type, "en")
            else:
                raise Exception(f"No prompt found for {content_type}")

# Global prompt loader instance
prompt_loader = PromptLoader()
