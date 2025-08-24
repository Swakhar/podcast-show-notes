from fastapi import APIRouter, BackgroundTasks, UploadFile, File, Form, HTTPException
from typing import Optional

from core.features import parse_features
from core.estimate import est_llm_cost, PRICE_WHISPER_PER_MIN
from core.yt_utils import (
    is_youtube_or_streaming_site,
    download_audio_from_youtube,
    download_to_tempfile,
    fetch_youtube_captions,
)
from core.audio_utils import trim_audio
from jobs import JOBS, set_stage, process_audio_job, process_text_job
from models.schemas import EstimateRequest
import os

# If you want to expose the model name in /estimate endpoint
from core.openai_utils import CHAT_MODEL

router = APIRouter()

@router.post("/jobs/upload")
async def create_job_from_upload(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    preview_minutes: Optional[int] = Form(None),
    features: Optional[str] = Form(None)
):
    import tempfile, shutil

    feature_set = parse_features(features)
    job_id = str(os.urandom(8).hex())
    JOBS[job_id] = {"status": "pending", "stage": "queued", "features": list(feature_set)}

    suffix = os.path.splitext(file.filename or "")[1] or ".bin"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        await file.seek(0)
        shutil.copyfileobj(file.file, tmp)
        tmp.flush()
        tmp.close()
    finally:
        await file.close()

    local_path = tmp.name
    if preview_minutes and preview_minutes > 0:
        set_stage(job_id, "preparing preview")
        local_path = trim_audio(local_path, preview_minutes * 60)

    set_stage(job_id, "transcribing")
    background.add_task(process_audio_job, job_id, local_path, feature_set)
    return {"id": job_id, "status": "pending", "stage": JOBS[job_id]["stage"]}

@router.post("/jobs/url")
async def create_job_from_url(
    background: BackgroundTasks,
    url: str = Form(...),
    preview_minutes: Optional[int] = Form(None),
    features: Optional[str] = Form(None)
):
    feature_set = parse_features(features)
    job_id = str(os.urandom(8).hex())
    JOBS[job_id] = {"status": "pending", "features": list(feature_set)}
    set_stage(job_id, "inspecting URL")

    if is_youtube_or_streaming_site(url):
        set_stage(job_id, "fetching captions")
        transcript_text = None
        try:
            transcript_text = fetch_youtube_captions(url)
        except Exception:
            transcript_text = None
        if transcript_text:
            background.add_task(process_text_job, job_id, transcript_text, feature_set)
            return {"id": job_id, "status": "pending", "stage": JOBS[job_id].get("stage")}
        else:
            local_path = download_audio_from_youtube(url, preview_minutes)
            if not local_path:
                raise HTTPException(status_code=400, detail="Could not fetch audio from YouTube URL.")
    else:
        try:
            local_path = await download_to_tempfile(url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Download failed: {e}") from e

    background.add_task(process_audio_job, job_id, local_path, feature_set)
    return {"id": job_id, "status": "pending"}

@router.get("/jobs/{job_id}")
def get_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    return {"id": job_id, **job}

@router.post("/estimate")
def estimate_cost(body: EstimateRequest):
    trans_cost = (body.duration_minutes * PRICE_WHISPER_PER_MIN) if body.include_transcription else 0.0
    llm_cost = est_llm_cost(body.total_input_tokens, body.total_output_tokens)
    total = trans_cost + llm_cost
    return {
        "transcription_usd": round(trans_cost, 4),
        "llm_usd": round(llm_cost, 4),
        "total_usd": round(total, 4),
        "assumptions": {
            "duration_minutes": body.duration_minutes,
            "total_input_tokens": body.total_input_tokens,
            "total_output_tokens": body.total_output_tokens,
            "model": CHAT_MODEL,
        },
    }