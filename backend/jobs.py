import json
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

JOBS_FILE = "jobs_data.json"
JOBS: Dict[str, Dict] = {}
TEMPLATES_CACHE: Dict[str, Dict[str,str]] = {}

def load_jobs():
    """Load jobs from file on startup"""
    global JOBS
    try:
        if os.path.exists(JOBS_FILE):
            with open(JOBS_FILE, 'r') as f:
                JOBS = json.load(f)
                print(f"✅ Loaded {len(JOBS)} jobs from storage")
    except Exception as e:
        print(f"❌ Failed to load jobs: {e}")
        JOBS = {}

def save_jobs():
    """Save jobs to file"""
    try:
        with open(JOBS_FILE, 'w') as f:
            json.dump(JOBS, f, indent=2)
    except Exception as e:
        print(f"❌ Failed to save jobs: {e}")

def set_stage(job_id: str, stage: str) -> None:
    job = JOBS.get(job_id)
    if job is not None:
        job["stage"] = stage
        save_jobs()  # ✅ Persist after each update


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

def create_user_notification(user_email: str, title: str, message: str, notification_type: str = "success", action_url: str = None, action_label: str = None):
    """Create a notification for the user via frontend API"""
    try:
        import urllib.request
        import urllib.parse
        import json
        from os import getenv
        
        frontend_url = getenv('FRONTEND_URL', 'http://localhost:3001')
        
        # Prepare the data
        data = {
            'userEmail': user_email,
            'title': title,
            'message': message,
            'type': notification_type,
            'actionUrl': action_url,
            'actionLabel': action_label
        }
        
        # Convert to JSON and encode
        json_data = json.dumps(data).encode('utf-8')
        
        # Create the request
        req = urllib.request.Request(
            f"{frontend_url}/api/notifications",
            data=json_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        # Make the request
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                print(f"✅ Notification created for {user_email}: {title}")
            else:
                print(f"❌ Failed to create notification: HTTP {response.status}")
                
    except Exception as e:
        print(f"❌ Error creating notification: {e}")
        # Don't fail the main job if notification fails
        pass

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
        
        user_email = JOBS[job_id].get("user_email")
        source_type = JOBS[job_id].get("source_type", "manual")
        
        if user_email:
            try:
                # Send email notification
                from core.email_utils import send_completion_email
                send_completion_email(user_email, res, source_type, job_id)
                
                # Create in-app notification
                create_user_notification(
                    user_email=user_email,
                    title="🎉 Content Ready!",
                    message=f"Your {source_type} content has been generated successfully.",
                    notification_type="success",
                    action_url=f"/results/{job_id}",
                    action_label="View Content"
                )
                
            except Exception as e:
                print(f"❌ Failed to send notifications: {e}")
                
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
                
                # Create error notification
                create_user_notification(
                    user_email=user_email,
                    title="❌ Processing Failed",
                    message="Something went wrong while processing your content.",
                    notification_type="error",
                    action_url="/generate",
                    action_label="Try Again"
                )
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

# ✅ Call this when your app starts
load_jobs()
