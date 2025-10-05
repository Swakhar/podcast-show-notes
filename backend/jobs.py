import json
import os
from typing import Dict, Set
import sqlite3
import tempfile
from contextlib import contextmanager

from core.openai_utils import transcribe
from core.business import (
    generate_summary,
    generate_show_notes,
    generate_timestamps,
    generate_social_snippets,
    generate_seo,
    generate_newsletter,
    generate_guest_research,
    generate_interview_questions,
    generate_conversation_starters
)

# ✅ Import email utilities
from core.email_utils import send_completion_email, send_error_email

# ✅ Use database instead of file
DATABASE_URL = os.getenv('BACKEND_DATABASE_URL')
JOBS: Dict[str, Dict] = {}
TEMPLATES_CACHE: Dict[str, Dict[str,str]] = {}

@contextmanager
def get_db_connection():
    """Get database connection - works with PostgreSQL or SQLite"""
    if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
        import psycopg2
        import psycopg2.extras
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        try:
            yield conn
        finally:
            conn.close()
    else:
        # Fallback to SQLite for local development
        db_path = os.path.join(tempfile.gettempdir(), 'jobs.db')
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

def init_jobs_table():
    """Initialize jobs table in database"""
    try:
        with get_db_connection() as conn:
            if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS jobs (
                        id VARCHAR(255) PRIMARY KEY,
                        data JSONB NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                # Create index for faster queries
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_updated_at ON jobs(updated_at)")
            else:
                cursor = conn.cursor()
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS jobs (
                        id TEXT PRIMARY KEY,
                        data TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            print("✅ Jobs table initialized")
    except Exception as e:
        print(f"❌ Failed to initialize jobs table: {e}")

def load_jobs():
    """Load recent jobs from database"""
    global JOBS
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            # Load jobs from last 24 hours to avoid memory issues
            if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
                cursor.execute("""
                    SELECT id, data FROM jobs 
                    WHERE updated_at > NOW() - INTERVAL '24 hours'
                    ORDER BY updated_at DESC
                    LIMIT 1000
                """)
            else:
                cursor.execute("""
                    SELECT id, data FROM jobs 
                    WHERE updated_at > datetime('now', '-24 hours')
                    ORDER BY updated_at DESC
                    LIMIT 1000
                """)
            
            rows = cursor.fetchall()
            JOBS = {}
            for row in rows:
                job_id = row[0] if isinstance(row, tuple) else row['id']
                data_str = row[1] if isinstance(row, tuple) else row['data']
                
                # ✅ Fix: Handle both string and dict data
                try:
                    if isinstance(data_str, str):
                        JOBS[job_id] = json.loads(data_str)
                    elif isinstance(data_str, dict):
                        JOBS[job_id] = data_str
                    else:
                        print(f"⚠️ Unexpected data type for job {job_id}: {type(data_str)}")
                        continue
                except json.JSONDecodeError as e:
                    print(f"⚠️ Failed to parse job {job_id} data: {e}")
                    continue
            
            print(f"✅ Loaded {len(JOBS)} active jobs from database")
    except Exception as e:
        print(f"❌ Failed to load jobs: {e}")
        JOBS = {}

def save_job(job_id: str):
    """Save individual job to database"""
    if job_id not in JOBS:
        return
        
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            # ✅ Ensure data is always JSON string
            data_json = json.dumps(JOBS[job_id])
            
            if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
                cursor.execute("""
                    INSERT INTO jobs (id, data, updated_at) 
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (id) 
                    DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
                """, (job_id, data_json))
            else:
                cursor.execute("""
                    INSERT OR REPLACE INTO jobs (id, data, updated_at) 
                    VALUES (?, ?, datetime('now'))
                """, (job_id, data_json))
                
            conn.commit()
            # Removed verbose logging - only log errors
    except Exception as e:
        print(f"❌ Failed to save job {job_id}: {e}")

def set_stage(job_id: str, stage: str) -> None:
    """Update job stage and save to database"""
    job = JOBS.get(job_id)
    if job is not None:
        job["stage"] = stage
        print(f"🔄 Job {job_id}: {stage}")
        save_job(job_id)

def cleanup_old_jobs():
    """Clean up jobs older than 7 days"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
                cursor.execute("DELETE FROM jobs WHERE updated_at < NOW() - INTERVAL '7 days'")
            else:
                cursor.execute("DELETE FROM jobs WHERE updated_at < datetime('now', '-7 days')")
            conn.commit()
            print("✅ Cleaned up old jobs")
    except Exception as e:
        print(f"❌ Failed to cleanup old jobs: {e}")

def _pull_templates(job_id: str):
    """Pull templates for this job - IMPORTANT BUSINESS LOGIC"""
    ids = JOBS[job_id].get("templates") or []
    presets = [TEMPLATES_CACHE.get(tid) for tid in ids if tid in TEMPLATES_CACHE]
    # keep newest per kind
    by_kind = {}
    for p in presets:
        if not p: 
            continue
        by_kind[p["kind"]] = p
    return by_kind

def _ensure_result(job_id: str) -> Dict:
    """Ensure JOBS[job_id]['result'] exists and return it."""
    job = JOBS.get(job_id)
    if job is None:
        return {}
    if "result" not in job or not isinstance(job["result"], dict):
        job["result"] = {}
        save_job(job_id)
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

        print(f"📱 Creating notification for {user_email}: {title}")
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
                print(f"✅ Notification created for {user_email}")
            else:
                print(f"❌ Failed to create notification: HTTP {response.status}")
                
    except Exception as e:
        print(f"❌ Error creating notification: {e}")
        # Don't fail the main job if notification fails
        pass

# ✅ Enhanced completion function
def mark_job_completed(job_id: str, user_email: str = None) -> None:
    """Mark job as completed and trigger all notifications"""
    job = JOBS.get(job_id)
    if job is not None:
        job["stage"] = "finished"
        job["completed_at"] = json.dumps({"timestamp": "now"})
        
        print(f"✅ Job {job_id} marked as completed")
        save_job(job_id)
        
        # ✅ Try multiple ways to get user_email
        final_user_email = None
        
        # 1. Use provided parameter
        if user_email:
            final_user_email = user_email
            print(f"👤 Using provided user_email: {user_email}")
        
        # 2. Try to get from job data
        elif job.get("user_email"):
            final_user_email = job.get("user_email")
            print(f"👤 Using job stored user_email: {final_user_email}")
        
        # 3. Debug what's in the job
        print(f"🔍 Job {job_id} data keys: {list(job.keys())}")
        print(f"🔍 Job {job_id} user_email from job: {job.get('user_email')}")
        print(f"🔍 Final user_email to use: {final_user_email}")
        
        # Send notifications only if we have an email
        if final_user_email and final_user_email.strip():
            try:
                print(f"📧 Sending completion notifications to {final_user_email}")
                result = job.get("result", {})
                content_type = job.get("content_type", "content")

                # Send email notification
                success = send_completion_email(final_user_email, result, content_type, job_id)
                if success:
                    print(f"✅ Completion email sent to {final_user_email}")
                else:
                    print(f"❌ Failed to send completion email to {final_user_email}")
                
                # Send in-app notification
                create_user_notification(
                    user_email=final_user_email,
                    title="🎉 Content Ready!",
                    message=f"Your {content_type} content has been generated successfully.",
                    notification_type="success",
                    action_url=f"/results/{job_id}",
                    action_label="View Content"
                )
                    
            except Exception as e:
                print(f"❌ Error sending completion notifications: {e}")
        else:
            print(f"⚠️ No valid user_email found for job {job_id} - skipping notifications")
            # List what we tried
            print(f"   - Provided user_email: {user_email}")
            print(f"   - Job stored user_email: {job.get('user_email')}")

def mark_job_failed(job_id: str, error_message: str, user_email: str = None) -> None:
    """Mark job as failed and send error notifications"""
    job = JOBS.get(job_id)
    if job is not None:
        job["stage"] = "failed"
        job["error"] = error_message
        job["failed_at"] = json.dumps({"timestamp": "now"})
        
        print(f"❌ Job {job_id} marked as failed: {error_message}")
        save_job(job_id)
        
        # Get user email from job if not provided
        if not user_email:
            user_email = job.get("user_email")
        
        # Send error notifications
        if user_email:
            try:
                source_url = job.get("url", "")
                success = send_error_email(user_email, error_message, source_url)
                if success:
                    print(f"✅ Error email sent to {user_email}")
                
                # Send in-app error notification
                create_user_notification(
                    user_email=user_email,
                    title="❌ Processing Failed",
                    message="Something went wrong while processing your content.",
                    notification_type="error",
                    action_url="/generate",
                    action_label="Try Again"
                )
            except Exception as e:
                print(f"❌ Error sending error notifications: {e}")

def process_job_pipeline(job_id: str, transcript: str, feature_set: Set[str], language: str = "auto") -> None:
    """
    ✅ ENHANCED: Shared pipeline for processing transcript with your template logic intact.
    Writes partial results to JOBS[job_id]['result'] after each step so the frontend 
    can render progressively without waiting for completion.
    """
    try:
        job = JOBS.get(job_id)
        if not job:
            print(f"❌ Job {job_id} not found")
            return

        res = _ensure_result(job_id)
        res["transcript"] = transcript
        
        # ✅ KEEP YOUR TEMPLATE LOGIC - this is crucial business functionality
        presets = _pull_templates(job_id)
        print(f"📋 Using {len(presets)} custom templates for job {job_id}")
        
        JOBS[job_id]["status"] = "processing"
        save_job(job_id)

        # ✅ Generate content with your custom templates
        if "summary" in feature_set:
            set_stage(job_id, "generating summary")
            preset = presets.get("summary")
            res["summary"] = generate_summary(transcript, language=language, preset=preset)
            save_job(job_id)  # Save after each step

        if "show_notes" in feature_set:
            set_stage(job_id, "generating show notes")
            preset = presets.get("show_notes")
            res["show_notes"] = generate_show_notes(transcript, res.get("summary", ""), language=language, preset=preset)
            save_job(job_id)

        if "timestamps" in feature_set:
            set_stage(job_id, "generating timestamps")
            res["timestamps"] = generate_timestamps(transcript, language=language)
            save_job(job_id)

        if "social_snippets" in feature_set:
            set_stage(job_id, "generating social snippets")
            res["social_snippets"] = generate_social_snippets(
                res.get("summary", ""), res.get("show_notes", ""), transcript, language=language
            )
            save_job(job_id)

        if "seo" in feature_set:
            set_stage(job_id, "generating SEO")
            preset = presets.get("seo")
            res["seo"] = generate_seo(transcript, res.get("summary", ""), language=language, preset=preset)
            save_job(job_id)

        if "newsletter" in feature_set:
            set_stage(job_id, "generating newsletter")
            preset = presets.get("newsletter")
            res["newsletter"] = generate_newsletter(
                transcript, res.get("summary", ""), res.get("show_notes", ""), language=language, preset=preset
            )
            save_job(job_id)

        set_stage(job_id, "finished")
        JOBS[job_id]["status"] = "complete"
        save_job(job_id)
        
        # ✅ Then trigger notifications
        mark_job_completed(job_id)
        
    except Exception as e:
        error_msg = f"Pipeline failed: {str(e)}"
        print(f"❌ {error_msg}")
        JOBS[job_id]["status"] = "failed"
        save_job(job_id)  # ✅ Save the failed status
        mark_job_failed(job_id, error_msg)

def process_audio_job(job_id: str, audio_path: str, feature_set: Set[str], language: str = "auto", user_email: str = None) -> None:
    """✅ ENHANCED: Pipeline for audio input with proper error handling and notifications"""
    try:
        print(f"🎵 Starting audio processing for job {job_id}")
        
        # Store user info in job for notifications
        if user_email:
            JOBS[job_id]["user_email"] = user_email
            JOBS[job_id]["source_type"] = "manual"  # or "rss" - you can pass this as parameter too
            JOBS[job_id]["content_type"] = "audio upload"
            save_job(job_id)
            
        set_stage(job_id, "transcribing")
        transcript = transcribe(audio_path)
        
        if not transcript or transcript.strip() == "":
            raise Exception("Failed to transcribe audio - empty result")
        
        _ensure_result(job_id)["transcript"] = transcript
        save_job(job_id)

        # Process with your template logic
        process_job_pipeline(job_id, transcript, feature_set, language=language)
        
    except Exception as e:
        error_msg = f"Audio processing failed: {str(e)}"
        print(f"❌ {error_msg}")
        mark_job_failed(job_id, error_msg, user_email)
    finally:
        # Cleanup temporary audio file
        try:
            if audio_path and os.path.exists(audio_path):
                os.unlink(audio_path)
                print(f"🗑️ Cleaned up audio file: {audio_path}")
        except Exception as e:
            print(f"⚠️ Failed to cleanup audio file: {e}")

def process_text_job(job_id: str, transcript: str, feature_set: Set[str], language: str = "auto", user_email: str = None) -> None:
    """✅ ENHANCED: Pipeline for text input with proper error handling and notifications"""
    try:
        print(f"📝 Starting text processing for job {job_id}")
        
        if not transcript or transcript.strip() == "":
            raise Exception("Empty text content provided")
        
        # Store user info in job for notifications
        if user_email:
            JOBS[job_id]["user_email"] = user_email
            JOBS[job_id]["source_type"] = "manual"  # or "rss" - you can pass this as parameter too
            JOBS[job_id]["content_type"] = "URL/transcript"
            save_job(job_id)
            
        _ensure_result(job_id)["transcript"] = transcript
        save_job(job_id)

        # Process with your template logic
        process_job_pipeline(job_id, transcript, feature_set, language=language)
        
    except Exception as e:
        error_msg = f"Text processing failed: {str(e)}"
        print(f"❌ {error_msg}")
        mark_job_failed(job_id, error_msg, user_email)

def process_guest_research_job(job_id: str, guest_name: str, guest_info: str, additional_context: str, show_focus: str, feature_set: Set[str], language: str = "en", user_email: str = None) -> None:
    """Process guest research job"""
    try:
        print(f"🔍 Starting guest research for job {job_id}: {guest_name}")
        
        # Store user info in job for notifications
        if user_email:
            JOBS[job_id]["user_email"] = user_email
            JOBS[job_id]["source_type"] = "guest research"
            save_job(job_id)
        
        res = _ensure_result(job_id)
        res["guest_name"] = guest_name
        res["guest_info"] = guest_info
        
        # Get custom templates
        presets = _pull_templates(job_id)
        print(f"📋 Using {len(presets)} custom templates for guest research {job_id}")
        
        JOBS[job_id]["status"] = "processing"
        save_job(job_id)

        # Generate guest research components
        if "guest_research" in feature_set:
            set_stage(job_id, "analyzing guest background")
            preset = presets.get("guest_research")
            full_context = f"Guest: {guest_name}\n\nBackground:\n{guest_info}"
            if additional_context:
                full_context += f"\n\nAdditional Context:\n{additional_context}"
            res["guest_research"] = generate_guest_research(full_context, additional_context, language=language, preset=preset)
            save_job(job_id)

        if "interview_questions" in feature_set:
            set_stage(job_id, "generating interview questions")
            preset = presets.get("interview_questions")
            background_text = f"{guest_info}\n{additional_context}".strip()
            res["interview_questions"] = generate_interview_questions(background_text, show_focus, language=language, preset=preset)
            save_job(job_id)

        if "conversation_starters" in feature_set:
            set_stage(job_id, "creating conversation starters")
            preset = presets.get("conversation_starters")
            full_info = f"Guest: {guest_name}\n{guest_info}\nShow Focus: {show_focus}".strip()
            res["conversation_starters"] = generate_conversation_starters(full_info, language=language, preset=preset)
            save_job(job_id)

        # Mark as complete
        set_stage(job_id, "finished")
        JOBS[job_id]["status"] = "complete"
        save_job(job_id)
        
        # Send notifications
        mark_job_completed(job_id)
        
    except Exception as e:
        error_msg = f"Guest research failed: {str(e)}"
        print(f"❌ {error_msg}")
        JOBS[job_id]["status"] = "failed"
        save_job(job_id)
        mark_job_failed(job_id, error_msg, user_email)

# ✅ Initialize on startup
print("🚀 Initializing jobs system...")
init_jobs_table()
load_jobs()
print(f"📊 Jobs system ready with {len(JOBS)} active jobs")
