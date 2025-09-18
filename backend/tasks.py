"""
Celery task definitions for processing podcast audio.  These tasks
mirror the logic used by the FastAPI background tasks in `main.py`,
allowing heavy workloads to run outside the web process.  To enable
Celery, ensure you have a broker (such as Redis or RabbitMQ) running
and start a Celery worker with:

    celery -A tasks worker --loglevel=info

The web API can then dispatch jobs to Celery instead of using
BackgroundTasks.  Persist your job state in a database or cache so
both the web and worker processes can share progress.
"""

import os
import tempfile
import shutil
import asyncio
from typing import Optional, Dict, Any, List

from celery import Celery
import httpx

from core.email_utils import send_completion_email, send_error_email

try:
    import openai
except ImportError:
    openai = None  # type: ignore

try:
    import whisper  # type: ignore
except ImportError:
    whisper = None  # type: ignore

# Load environment variables for OpenAI and Celery
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if openai is not None and OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

# Initialise Celery app using config from celeryconfig.py
celery_app = Celery("podcast_tasks")
celery_app.config_from_object("celeryconfig")  # type: ignore


async def download_audio_from_url(url: str, target_path: str) -> None:
    """Download an audio file from a remote URL and save it to target_path."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        with open(target_path, "wb") as out:
            out.write(resp.content)


async def transcribe_audio(file_path: str) -> str:
    """Transcribe an audio file to text using Whisper or OpenAI."""
    if whisper is not None:
        try:
            model = whisper.load_model("base")
            result = model.transcribe(file_path)
            return result["text"]
        except Exception:
            pass
    if openai is None or not OPENAI_API_KEY:
        raise RuntimeError("Transcription failed: whisper not available and OpenAI API key missing.")
    with open(file_path, "rb") as audio_file:
        response = await openai.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
        )
        return response.text  # type: ignore


async def call_openai_chat(messages: List[Dict[str, str]], model: str = "gpt-3.5-turbo") -> str:
    if openai is None or not OPENAI_API_KEY:
        raise RuntimeError("OpenAI Chat API is unavailable.")
    response = await openai.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=1024,
        temperature=0.5,
    )
    return response.choices[0].message.content.strip()  # type: ignore


async def generate_summary(transcript: str) -> str:
    system_prompt = (
        "You are an expert content summarizer.  Given a raw podcast transcription, "
        "return a concise, engaging summary highlighting the key points discussed."
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Transcript:\n{transcript}\n\nSummarise in 4–6 sentences."},
    ]
    return await call_openai_chat(messages)


async def generate_show_notes(transcript: str) -> str:
    system_prompt = (
        "You are a helpful assistant that writes detailed show notes for podcast episodes. "
        "Given a podcast transcript, return bullet‑point notes covering all major topics, "
        "guest names and actions.  Notes should be well structured."
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Transcript:\n{transcript}\n\nWrite show notes as an ordered list."},
    ]
    return await call_openai_chat(messages)


async def generate_timestamps(transcript: str) -> List[str]:
    words = transcript.split()
    parts = 4
    size = max(1, len(words) // parts)
    return [f"Section {i+1}: {' '.join(words[i*size:(i+1)*size])[:80]}..." for i in range(parts)]


async def generate_social_snippets(summary: str) -> List[str]:
    system_prompt = (
        "You are a social media expert.  Given a podcast episode summary, "
        "create two catchy promotional posts for platforms like Twitter or LinkedIn."
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Summary:\n{summary}\n\nProvide two distinct posts."},
    ]
    raw = await call_openai_chat(messages)
    posts = [line.strip() for line in raw.split("\n") if line.strip()]
    return posts[:2]


@celery_app.task
def process_podcast_task(job_id: str, file_data: Optional[bytes] = None, url: Optional[str] = None, user_email: Optional[str] = None, source_type: str = "manual") -> Dict[str, Any]:
    """Celery task to process a podcast audio.  Accepts either raw file
    bytes or a URL.  Returns a dictionary containing the transcript,
    summary, show notes, timestamps and social snippets.  Any errors
    raised within the task will result in task failure.

    In a real deployment you would persist results to a database or
    cache keyed by `job_id` so the web process can retrieve them.
    """
    try:
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(_process_podcast(file_data, url))
        
        # Send completion email if user_email provided
        if user_email:
            send_completion_email(user_email, result, source_type)
            
        return result
    except Exception as e:
        # Send error email if user_email provided
        if user_email:
            send_error_email(user_email, str(e), url or "")
        raise


async def _process_podcast(file_data: Optional[bytes], url: Optional[str]) -> Dict[str, Any]:
    temp_dir = tempfile.mkdtemp(prefix="celery_podcast_")
    audio_path = os.path.join(temp_dir, "input_audio")
    try:
        if file_data:
            with open(audio_path, "wb") as dest:
                dest.write(file_data)
        elif url:
            await download_audio_from_url(url, audio_path)
        else:
            raise ValueError("No audio data provided.")

        transcript = await transcribe_audio(audio_path)
        summary = await generate_summary(transcript)
        notes = await generate_show_notes(transcript)
        timestamps = await generate_timestamps(transcript)
        snippets = await generate_social_snippets(summary)
        return {
            "transcript": transcript,
            "summary": summary,
            "show_notes": notes,
            "timestamps": timestamps,
            "social_snippets": snippets,
        }
    finally:
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass
