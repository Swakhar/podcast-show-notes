import re

def detect_content_language(content: str) -> str:
    """
    Simple language detection based on common patterns and keywords.
    Returns 'en' for English, 'de' for German, defaults to 'en'
    """
    if not content or len(content.strip()) < 50:
        return 'en'  # Default to English for short content
    
    content_lower = content.lower()
    
    # German indicators
    german_patterns = [
        # Common German words
        r'\b(und|oder|aber|nicht|das|die|der|den|dem|des|ein|eine|einem|einer|eines|ist|sind|war|waren|haben|hat|hatte|hatten|wird|werden|wurde|wurden|kann|könnte|soll|sollte|muss|müssen|für|von|zu|mit|bei|auf|in|an|über|unter|durch|gegen|ohne|nach|vor|zwischen|während|wegen|trotz|statt|außer|seit|bis)\b',
        # German specific characters
        r'[äöüßÄÖÜ]',
        # German endings
        r'\w+(ung|heit|keit|schaft|lich|ig)\b',
        # German compound words (simple detection)
        r'\w{15,}',  # Very long words often indicate German compounds
    ]
    
    # English indicators  
    english_patterns = [
        # Common English words that are uncommon in German
        r'\b(the|and|or|but|not|that|this|these|those|with|from|they|them|their|there|where|when|what|why|how|would|could|should|will|can|may|might)\b',
        # English specific patterns
        r'\b\w+ing\b',  # -ing endings
        r'\b\w+ed\b',   # -ed endings
        r'\bth(e|is|at|ese|ose|ey|em|eir)\b',  # 'th' combinations common in English
    ]
    
    german_score = 0
    english_score = 0
    
    # Count German patterns
    for pattern in german_patterns:
        matches = len(re.findall(pattern, content_lower, re.IGNORECASE))
        german_score += matches
    
    # Count English patterns
    for pattern in english_patterns:
        matches = len(re.findall(pattern, content_lower, re.IGNORECASE))
        english_score += matches
    
    # Simple scoring logic
    if german_score > english_score * 1.2:  # Slight bias towards German detection
        return 'de'
    else:
        return 'en'

def get_language_name(language_code: str) -> str:
    """Get human-readable language name"""
    language_names = {
        'en': 'English',
        'de': 'German',
        'auto': 'Auto-detect'
    }
    return language_names.get(language_code, 'English')
