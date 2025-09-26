from fastapi import APIRouter, BackgroundTasks, UploadFile, File, Form, Body, HTTPException
from typing import Optional

from core.features import parse_features
from core.estimate import est_llm_cost, PRICE_WHISPER_PER_MIN
from core.yt_utils import (
    is_youtube_or_streaming_site,
    download_audio_from_youtube,
    download_to_tempfile,
    fetch_youtube_captions,
    get_youtube_duration_seconds,
)
from core.audio_utils import trim_audio, get_audio_duration_seconds
from jobs import JOBS, TEMPLATES_CACHE, set_stage, process_audio_job, process_text_job
from models.schemas import EstimateRequest
from services.youtube_service import YouTubeService
from services.transcript_service import get_youtube_transcript
import math, os, tempfile, shutil
from core.openai_utils import CHAT_MODEL

router = APIRouter()

@router.post("/jobs/url")
async def create_job_from_url(
    background: BackgroundTasks,
    url: str = Form(...),
    preview_minutes: Optional[int] = Form(None),
    features: Optional[str] = Form(None),
    language: Optional[str] = Form("auto"),
    template_ids: Optional[str] = Form(None),
    user_email: Optional[str] = Form(None),
):
    feature_set = parse_features(features)
    job_id = str(os.urandom(8).hex())
    JOBS[job_id] = {"status": "pending", "features": list(feature_set)}
    JOBS[job_id]["templates"] = (template_ids or "").split(",") if template_ids else []
    JOBS[job_id]["url"] = url
    
    # ✅ Store user_email in job from the start
    if user_email:
        JOBS[job_id]["user_email"] = user_email
        print(f"👤 Stored user_email in job {job_id}: {user_email}")
    else:
        print(f"⚠️ No user_email provided for job {job_id}")
    
    set_stage(job_id, "inspecting URL")
    billed_minutes = 0

    if is_youtube_or_streaming_site(url):
        set_stage(job_id, "fetching captions")
        transcript_text = None
        
        # Try Method 1: Your existing caption fetcher
        try:
            transcript_text = fetch_youtube_captions(url)
        except Exception as e:
            print(f"Original caption fetch failed: {e}")
            transcript_text = None

        # Try Method 2: New transcript service
        if not transcript_text:
            try:
                print("Trying new transcript service...")
                transcript_result = get_youtube_transcript(url)
                if transcript_result.get('success'):
                    transcript_text = transcript_result.get('transcript')
                    print("✅ Got transcript from new service")
            except Exception as e:
                print(f"New transcript service failed: {e}")

        # If we have transcript, use it
        if transcript_text:
            if preview_minutes and preview_minutes > 0:
                billed_minutes = int(preview_minutes)
            else:
                dur_sec = get_youtube_duration_seconds(url)
                billed_minutes = max(1, math.ceil(dur_sec / 60.0)) if dur_sec > 0 else 2

            JOBS[job_id]["billed_minutes"] = billed_minutes
            # ✅ Pass user_email to background task
            background.add_task(process_text_job, job_id, transcript_text, feature_set, language, user_email)
            return {"id": job_id, "status": "pending", "stage": JOBS[job_id].get("stage"), "billed_minutes": billed_minutes}

        # Try audio download
        print("No transcript available, trying audio download...")
        set_stage(job_id, "downloading audio")
        local_path = None
        
        try:
            local_path = download_audio_from_youtube(url, preview_minutes)
        except Exception as e:
            print(f"Original audio download failed: {e}")
            local_path = None

        # Try enhanced YouTube service
        if not local_path:
            try:
                print("Trying enhanced YouTube service...")
                youtube_service = YouTubeService()
                temp_dir = tempfile.mkdtemp()
                result = youtube_service.download_audio(url, temp_dir)
                
                if result.get('success'):
                    if result.get('transcript_only'):
                        print("✅ Using transcript-only mode from enhanced service")
                        transcript_text = result.get('message', 'Transcript extracted')
                        
                        if preview_minutes and preview_minutes > 0:
                            billed_minutes = int(preview_minutes)
                        else:
                            dur_sec = result.get('duration', 0)
                            billed_minutes = max(1, math.ceil(dur_sec / 60.0)) if dur_sec > 0 else 2

                        JOBS[job_id]["billed_minutes"] = billed_minutes
                        # ✅ Pass user_email to background task
                        background.add_task(process_text_job, job_id, transcript_text, feature_set, language, user_email)
                        return {"id": job_id, "status": "pending", "stage": JOBS[job_id].get("stage"), "billed_minutes": billed_minutes}
                    else:
                        filename = result.get('filename', 'audio.mp3')
                        local_path = os.path.join(temp_dir, filename)
                        print(f"✅ Enhanced service downloaded: {filename}")
                        
            except Exception as e:
                print(f"Enhanced YouTube service failed: {e}")

        if not local_path:
            raise HTTPException(
                status_code=400, 
                detail="Could not fetch audio or transcript from YouTube URL."
            )

        if preview_minutes and preview_minutes > 0:
            billed_minutes = int(preview_minutes)
        else:
            dur_sec = get_audio_duration_seconds(local_path)
            billed_minutes = max(1, math.ceil(dur_sec / 60.0)) if dur_sec > 0 else 2

    else:
        # Non-YouTube URLs
        try:
            local_path = await download_to_tempfile(url)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Download failed: {e}") from e

        if preview_minutes and preview_minutes > 0:
            set_stage(job_id, "preparing preview")
            from core.audio_utils import trim_audio as _trim
            local_path = _trim(local_path, preview_minutes * 60)
            billed_minutes = int(preview_minutes)
        else:
            dur_sec = get_audio_duration_seconds(local_path)
            billed_minutes = max(1, math.ceil(dur_sec / 60.0)) if dur_sec > 0 else 2

    # Final audio processing
    JOBS[job_id]["billed_minutes"] = billed_minutes
    set_stage(job_id, "transcribing")
    # ✅ Pass user_email to background task
    background.add_task(process_audio_job, job_id, local_path, feature_set, language, user_email)
    return {"id": job_id, "status": "pending", "stage": JOBS[job_id]["stage"], "billed_minutes": billed_minutes}


@router.post("/jobs/upload")
async def create_job_from_upload(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    preview_minutes: Optional[int] = Form(None),
    features: Optional[str] = Form(None),
    language: Optional[str] = Form("auto"),
    template_ids: Optional[str] = Form(None),
    user_email: Optional[str] = Form(None),
):
    print(f"Received upload: {file.filename}, {file.content_type}")
    feature_set = parse_features(features)
    job_id = str(os.urandom(8).hex())
    JOBS[job_id] = {"status": "pending", "stage": "queued", "features": list(feature_set)}
    JOBS[job_id]["templates"] = (template_ids or "").split(",") if template_ids else []
    
    # ✅ Store user_email in job from the start
    if user_email:
        JOBS[job_id]["user_email"] = user_email
        print(f"👤 Stored user_email in job {job_id}: {user_email}")
    else:
        print(f"⚠️ No user_email provided for job {job_id}")

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
    billed_minutes = 0

    if preview_minutes and preview_minutes > 0:
        set_stage(job_id, "preparing preview")
        local_path = trim_audio(local_path, preview_minutes * 60)
        billed_minutes = int(preview_minutes)
    else:
        dur_sec = get_audio_duration_seconds(local_path)
        billed_minutes = max(1, math.ceil(dur_sec / 60.0)) if dur_sec > 0 else 2

    JOBS[job_id]["billed_minutes"] = billed_minutes
    set_stage(job_id, "transcribing")
    # ✅ Pass user_email to background task
    background.add_task(process_audio_job, job_id, local_path, feature_set, language, user_email)
    return {"id": job_id, "status": "pending", "stage": JOBS[job_id]["stage"], "billed_minutes": billed_minutes}

@router.get("/jobs/{job_id}")
def get_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Not found")
    # include billed_minutes if we set it earlier
    resp = {"id": job_id, **job}
    if "billed_minutes" in job:
        resp["billed_minutes"] = job["billed_minutes"]
    return resp

@router.post("/templates/cache")
def put_templates_cache(items: list[dict] = Body(...)):
    # items: [{id, kind, system, user}]
    for it in items:
        if it.get("id"):
            TEMPLATES_CACHE[it["id"]] = {
                "kind": it.get("kind",""),
                "system": it.get("system",""),
                "user": it.get("user",""),
            }
    return {"ok": True, "count": len(items)}

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

@router.get("/jobs/user/{user_email}")
async def get_user_jobs(user_email: str):
    """Get jobs for a specific user"""
    try:
        # Filter jobs by user_email from JOBS dictionary
        user_jobs = []
        for job_id, job_data in JOBS.items():
            if job_data.get("user_email") == user_email:
                job_info = {
                    "id": job_id,
                    "status": job_data.get("status", "unknown"),
                    "url": job_data.get("url", ""),
                    "created_at": "2025-01-17T10:00:00Z",  # You might want to add timestamps to jobs
                    "stage": job_data.get("stage", ""),
                    "progress": 100 if job_data.get("status") == "complete" else 50 if job_data.get("status") == "processing" else 0
                }
                if job_data.get("status") == "complete":
                    job_info["completed_at"] = "2025-01-17T10:05:00Z"
                user_jobs.append(job_info)
        
        return {"jobs": user_jobs}
        
    except Exception as e:
        print(f"Error fetching jobs for {user_email}: {e}")
        return {"jobs": []}