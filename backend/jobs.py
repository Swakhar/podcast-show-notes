import os
from typing import Dict, Set
from unittest import result

from core.openai_utils import transcribe
from core.business import (
    generate_summary,
    generate_show_notes,
    generate_timestamps,
    generate_social_snippets,
    generate_seo,
    generate_newsletter,
)

JOBS: Dict[str, Dict] = {}
TEMPLATES_CACHE: Dict[str, Dict[str,str]] = {}

def set_stage(job_id: str, stage: str) -> None:
    job = JOBS.get(job_id)
    if job is not None:
        job["stage"] = stage


def _pull_templates(job_id: str):
    ids = JOBS[job_id].get("templates") or []
    presets = [TEMPLATES_CACHE.get(tid) for tid in ids if tid in TEMPLATES_CACHE]
    # keep newest per kind
    by_kind = {}
    for p in presets:
        if not p: continue
        by_kind[p["kind"]] = p
    return by_kind

def _ensure_result(job_id: str) -> Dict:
    """Ensure JOBS[job_id]['result'] exists and return it."""
    job = JOBS.get(job_id)
    if job is None:
        return {}
    if "result" not in job or not isinstance(job["result"], dict):
        job["result"] = {}
    return job["result"]

def process_job_pipeline(job_id: str, transcript: str, feature_set: Set[str], language: str = "auto") -> None:
    """
    Shared pipeline for processing transcript. Writes partial results
    to JOBS[job_id]['result'] after each step so the frontend can render
    progressively without waiting for completion.
    """
    try:
        job = JOBS.get(job_id)
        if not job:
            return

        res = _ensure_result(job_id)
        res["transcript"] = transcript
        presets = _pull_templates(job_id)
        JOBS[job_id]["status"] = "processing"

        if "summary" in feature_set:
            set_stage(job_id, "generating summary")
            preset = presets.get("summary")
            res["summary"] = generate_summary(transcript, language=language, preset=preset)

        if "show_notes" in feature_set:
            set_stage(job_id, "generating show notes")
            preset = presets.get("show_notes")
            res["show_notes"] = generate_show_notes(transcript, res.get("summary", ""), language=language, preset=preset)

        if "timestamps" in feature_set:
            set_stage(job_id, "generating timestamps")
            res["timestamps"] = generate_timestamps(transcript, language=language)

        if "social_snippets" in feature_set:
            set_stage(job_id, "generating social snippets")
            res["social_snippets"] = generate_social_snippets(
                res.get("summary", ""), res.get("show_notes", ""), transcript, language=language
            )

        if "seo" in feature_set:
            set_stage(job_id, "generating SEO")
            preset = presets.get("seo")
            res["seo"] = generate_seo(transcript, res.get("summary", ""), language=language, preset=preset)

        if "newsletter" in feature_set:
            set_stage(job_id, "generating newsletter")
            preset = presets.get("newsletter")
            res["newsletter"] = generate_newsletter(
                transcript, res.get("summary", ""), res.get("show_notes", ""), language=language, preset=preset
            )

        set_stage(job_id, "finished")
        JOBS[job_id]["status"] = "complete"
        
        # Send completion email if user_email provided
        user_email = JOBS[job_id].get("user_email")
        source_type = JOBS[job_id].get("source_type", "manual")
        if user_email:
            try:
                from core.email_utils import send_completion_email
                send_completion_email(user_email, res, source_type, job_id)
            except Exception as e:
                print(f"Failed to send completion email: {e}")
                
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")
        
        # Send error email if user_email provided
        user_email = JOBS[job_id].get("user_email")
        if user_email:
            try:
                from core.email_utils import send_error_email
                job_url = JOBS[job_id].get("url", "")
                send_error_email(user_email, str(e), job_url)
            except Exception as email_e:
                print(f"Failed to send error email: {email_e}")

def process_audio_job(job_id: str, audio_path: str, feature_set: Set[str], language: str = "auto", user_email: str = None) -> None:
    """Pipeline for audio input: transcribe, then process transcript."""
    try:
        # Store user_email in job for later use
        if user_email:
            JOBS[job_id]["user_email"] = user_email
            JOBS[job_id]["source_type"] = "manual"  # or "rss" - you can pass this as parameter too
            
        JOBS[job_id]["status"] = "processing"
        set_stage(job_id, "transcribing")
        transcript = transcribe(audio_path)
        _ensure_result(job_id)["transcript"] = transcript

        process_job_pipeline(job_id, transcript, feature_set, language=language)
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")
        
        # Send error email if user_email provided
        if user_email:
            try:
                from core.email_utils import send_error_email
                send_error_email(user_email, str(e), audio_path)
            except Exception as email_e:
                print(f"Failed to send error email: {email_e}")
    finally:
        try:
            os.remove(audio_path)
        except Exception:
            pass

def process_text_job(job_id: str, transcript: str, feature_set: Set[str], language: str = "auto", user_email: str = None) -> None:
    """Pipeline for text input: process transcript."""
    try:
        # Store user_email in job for later use
        if user_email:
            JOBS[job_id]["user_email"] = user_email
            JOBS[job_id]["source_type"] = "manual"  # or "rss" - you can pass this as parameter too
            
        JOBS[job_id]["status"] = "processing"
        _ensure_result(job_id)["transcript"] = transcript
        process_job_pipeline(job_id, transcript, feature_set, language=language)
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")
        
        # Send error email if user_email provided
        if user_email:
            try:
                from core.email_utils import send_error_email
                send_error_email(user_email, str(e), "")
            except Exception as email_e:
                print(f"Failed to send error email: {email_e}")
