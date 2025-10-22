from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class EstimateRequest(BaseModel):
    duration_minutes: float
    total_input_tokens: int = 3000
    total_output_tokens: int = 1500
    include_transcription: bool = True

class RepurposingJobRequest(BaseModel):
    job_id: str
    content_types: List[str]  # ['linkedin_carousel', 'twitter_thread', 'instagram_story', etc.]
    source_type: str = "transcript"  # or "show_notes"
    custom_instructions: Optional[str] = None
    target_audience: Optional[str] = None
    brand_voice: Optional[str] = "professional"

class RepurposingJobResponse(BaseModel):
    job_id: str
    status: str
    results: Optional[Dict[str, Any]] = None

class ContentPiece(BaseModel):
    type: str
    title: str
    content: str
    metadata: Dict[str, Any]
    design_suggestions: Optional[Dict[str, Any]] = None
