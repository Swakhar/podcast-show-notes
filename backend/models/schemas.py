from pydantic import BaseModel

class EstimateRequest(BaseModel):
    duration_minutes: float
    total_input_tokens: int = 3000
    total_output_tokens: int = 1500
    include_transcription: bool = True
