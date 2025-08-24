import tempfile
import os
from typing import Optional
import httpx

from core.audio_utils import trim_audio, ffmpeg_available
from core.text_utils import vtt_to_text

def is_youtube_or_streaming_site(url: str) -> bool:
    u = (url or "").lower()
    return any(host in u for host in ["youtube.com", "youtu.be", "music.youtube.com"])

async def download_to_tempfile(url: str, suffix: str = ".mp3") -> str:
    """Download a direct media file to a temp file (with redirects)."""
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    async with httpx.AsyncClient(follow_redirects=True, timeout=60) as client:
        async with client.stream("GET", url) as r:
            r.raise_for_status()
            with open(tmp_path, "wb") as out:
                async for chunk in r.aiter_bytes():
                    out.write(chunk)
    return tmp_path

def download_audio_from_youtube(url: str, preview_minutes: Optional[int] = None) -> Optional[str]:
    """Use yt-dlp to fetch best audio and convert to mp3 (requires ffmpeg)."""
    try:
        import yt_dlp
        tmpdir = tempfile.mkdtemp(prefix="dl-")
        ydl_opts = {
            "noplaylist": True,
            "format": "bestaudio[ext=m4a]/bestaudio/best",
            "outtmpl": os.path.join(tmpdir, "%(id)s.%(ext)s"),
            "quiet": True,
            "noprogress": True,
            "postprocessors": [
                {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "128"}
            ],
        }
        # Optional: trim during postprocess for preview
        if preview_minutes and preview_minutes > 0:
            ydl_opts["postprocessor_args"] = ["-t", str(preview_minutes * 60)]

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            base = ydl.prepare_filename(info)
            mp3_path = os.path.splitext(base)[0] + ".mp3"

            if os.path.exists(mp3_path):
                # If you omitted postprocessor_args, you can trim here too (copy codecs)
                if preview_minutes and preview_minutes > 0 and ffmpeg_available():
                    return trim_audio(mp3_path, preview_minutes * 60)
                return mp3_path
            return None
    except Exception as e:
        print(f"[yt-dlp] download failed: {e}")
        return None

def fetch_youtube_captions_vtt(url: str, lang_pref=("en", "en-US")) -> Optional[str]:
    """Fetch YouTube captions as raw VTT text if available."""
    try:
        import yt_dlp
        tmpdir = tempfile.mkdtemp(prefix="subs-")
        ydl_opts = {
            "noplaylist": True,
            "skip_download": True,
            "writesubtitles": True,
            "writeautomaticsub": True,
            "subtitlesformat": "vtt",
            "subtitleslangs": list(lang_pref) + ["en-*", "auto", "original"],
            "outtmpl": os.path.join(tmpdir, "%(id)s.%(ext)s"),
            "quiet": True,
            "noprogress": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            ydl.download([url])
            base = ydl.prepare_filename(info)
            base_noext = os.path.splitext(base)[0]
            for fn in os.listdir(tmpdir):
                if fn.startswith(os.path.basename(base_noext)) and fn.endswith(".vtt"):
                    vtt_path = os.path.join(tmpdir, fn)
                    with open(vtt_path, "r", encoding="utf-8") as f:
                        return f.read()
    except Exception as e:
        print(f"[yt-dlp] captions VTT fetch failed: {e}")
    return None

def fetch_youtube_captions(url: str, lang_pref=("en", "en-US")) -> Optional[str]:
    """Fetch YouTube captions and convert to plain text if available."""
    vtt = fetch_youtube_captions_vtt(url, lang_pref)
    if vtt:
        return vtt_to_text(vtt)
    return None

def retry(fn, attempts=3, base_delay=1.0, max_delay=6.0):
    import time, random
    last_exc = None
    for i in range(attempts):
        try:
            return fn()
        except Exception as e:
            last_exc = e
            sleep = min(max_delay, base_delay * (2 ** i)) + random.uniform(0, 0.5)
            time.sleep(sleep)
    if last_exc:
        raise last_exc
