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

def set_stage(job_id: str, stage: str) -> None:
    job = JOBS.get(job_id)
    if job is not None:
        job["stage"] = stage

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
        JOBS[job_id]["status"] = "processing"

        if "summary" in feature_set:
            set_stage(job_id, "generating summary")
            res["summary"] = generate_summary(transcript, language=language)

        if "show_notes" in feature_set:
            set_stage(job_id, "generating show notes")
            res["show_notes"] = generate_show_notes(transcript, res.get("summary", ""), language=language)

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
            res["seo"] = generate_seo(transcript, res.get("summary", ""), language=language)

        if "newsletter" in feature_set:
            set_stage(job_id, "generating newsletter")
            res["newsletter"] = generate_newsletter(
                transcript, res.get("summary", ""), res.get("show_notes", ""), language=language
            )

        set_stage(job_id, "finished")
        JOBS[job_id]["status"] = "complete"
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")

def process_audio_job(job_id: str, audio_path: str, feature_set: Set[str], language: str = "auto") -> None:
    """Pipeline for audio input: transcribe, then process transcript."""
    try:
        JOBS[job_id]["status"] = "processing"
        set_stage(job_id, "transcribing")
        transcript = transcribe(audio_path)
        _ensure_result(job_id)["transcript"] = transcript

        process_job_pipeline(job_id, transcript, feature_set, language=language)
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")
    finally:
        try:
            os.remove(audio_path)
        except Exception:
            pass

def process_text_job(job_id: str, transcript: str, feature_set: Set[str], language: str = "auto") -> None:
    """Pipeline for text input: process transcript."""
    try:
        JOBS[job_id]["status"] = "processing"
        _ensure_result(job_id)["transcript"] = transcript
        process_job_pipeline(job_id, transcript, feature_set, language=language)
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")
