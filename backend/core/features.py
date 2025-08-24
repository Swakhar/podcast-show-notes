from typing import Set, Optional

def parse_features(features_str: Optional[str]) -> Set[str]:
    if not features_str:
        # default: everything enabled
        return {"summary", "show_notes", "timestamps", "social_snippets", "seo", "newsletter"}
    return set([s.strip() for s in features_str.split(",") if s.strip()])