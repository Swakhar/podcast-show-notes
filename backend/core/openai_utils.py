import os
from core.audio_utils import make_transcription_friendly, file_mb, segment_audio

OPENAI_AVAILABLE = False
CLIENT = None
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
WHISPER_MODEL = os.getenv("OPENAI_WHISPER_MODEL", "whisper-1")

try:
    from openai import OpenAI
    if os.getenv("OPENAI_API_KEY"):
        CLIENT = OpenAI()
        OPENAI_AVAILABLE = True
except Exception:
    OPENAI_AVAILABLE = False

def call_openai_chat(system: str, user: str, model: str = CHAT_MODEL) -> str:
    """
    Central helper for chat completions. Returns message content string.
    Falls back to stub text if OpenAI isn't available.
    """
    if OPENAI_AVAILABLE and CLIENT:
        try:
            resp = CLIENT.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                temperature=0.4,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception as e:
            print(f"[openai] chat error: {e}")
    return "LLM placeholder output (set OPENAI_API_KEY to enable real results)."

def transcribe(audio_path: str) -> str:
    """
    Transcribe audio using OpenAI Whisper if available; otherwise fallback stub.
    We first downsample to reduce size; if still too large, we segment and stitch.
    """
    path = make_transcription_friendly(audio_path, target_kbps=48, target_hz=16000)

    if OPENAI_AVAILABLE and CLIENT:
        try:
            # If file is small enough, transcribe directly
            if file_mb(path) < 24:
                with open(path, "rb") as f:
                    resp = CLIENT.audio.transcriptions.create(model=WHISPER_MODEL, file=f)
                return getattr(resp, "text", "") or " "
            # Otherwise, segment and stitch
            segments = segment_audio(path)
            texts = []
            for seg in segments:
                with open(seg, "rb") as f:
                    resp = CLIENT.audio.transcriptions.create(model=WHISPER_MODEL, file=f)
                texts.append(getattr(resp, "text", "") or " ")
            return "\n".join(texts)
        except Exception as e:
            print(f"[openai] transcription failed: {e}")

    return "Placeholder transcript (enable OPENAI_API_KEY to use Whisper)."
