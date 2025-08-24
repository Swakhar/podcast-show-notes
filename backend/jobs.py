import os
from typing import Dict, Set

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

def process_job_pipeline(job_id: str, transcript: str, feature_set: Set[str]) -> None:
    """Shared pipeline for processing transcript: summary, notes, timestamps, snippets, SEO, newsletter."""
    result = {"transcript": transcript}
    if "summary" in feature_set:
        set_stage(job_id, "generating summary")
        result["summary"] = generate_summary(transcript)

    if "show_notes" in feature_set:
        set_stage(job_id, "generating show notes")
        result["show_notes"] = generate_show_notes(transcript, result.get("summary", ""))

    if "timestamps" in feature_set:
        set_stage(job_id, "generating timestamps")
        result["timestamps"] = generate_timestamps(transcript)

    if "social_snippets" in feature_set:
        set_stage(job_id, "generating social snippets")
        result["social_snippets"] = generate_social_snippets(
            result.get("summary", ""), result.get("show_notes", ""), transcript
        )

    if "seo" in feature_set:
        set_stage(job_id, "generating SEO")
        result["seo"] = generate_seo(transcript, result.get("summary", ""))

    if "newsletter" in feature_set:
        set_stage(job_id, "generating newsletter")
        result["newsletter"] = generate_newsletter(transcript, result.get("summary", ""), result.get("show_notes", ""))

    JOBS[job_id]["result"] = result
    JOBS[job_id]["status"] = "complete"
    set_stage(job_id, "finished")

def process_audio_job(job_id: str, audio_path: str, feature_set: Set[str]) -> None:
    """Pipeline for audio input: transcribe, then process transcript."""
    try:
        JOBS[job_id]["status"] = "processing"
        set_stage(job_id, "transcribing")
        transcript = transcribe(audio_path)
        process_job_pipeline(job_id, transcript, feature_set)
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")
    finally:
        try:
            os.remove(audio_path)
        except Exception:
            pass

def process_text_job(job_id: str, transcript: str, feature_set: Set[str]) -> None:
    """Pipeline for text input: process transcript."""
    try:
        JOBS[job_id]["status"] = "processing"
        process_job_pipeline(job_id, transcript, feature_set)
    except Exception as e:
        JOBS[job_id]["status"] = "failed"
        JOBS[job_id]["error"] = str(e)
        set_stage(job_id, "failed")
