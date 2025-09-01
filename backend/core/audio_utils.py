import os
import subprocess
import tempfile
from typing import List

def ffmpeg_available() -> bool:
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception:
        return False

def trim_audio(input_path: str, seconds: int) -> str:
    base, ext = os.path.splitext(input_path)
    out_path = f"{base}.trim{ext or '.mp3'}"
    cmd = [
        "ffmpeg", "-y",
        "-t", str(seconds),
        "-i", input_path,
        "-c", "copy",
        out_path
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return out_path
    except subprocess.CalledProcessError:
        return input_path

def file_mb(path: str) -> float:
    return os.path.getsize(path) / (1024.0 * 1024.0)

def make_transcription_friendly(input_path: str, target_kbps: int = 48, target_hz: int = 16000) -> str:
    if not ffmpeg_available():
        return input_path
    base, _ = os.path.splitext(input_path)
    out_path = f"{base}.mono16k.mp3"
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ac", "1",
        "-ar", str(target_hz),
        "-b:a", f"{target_kbps}k",
        out_path
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return out_path
    except subprocess.CalledProcessError:
        return input_path

def segment_audio(input_path: str, segment_seconds: int = 600) -> List[str]:
    if not ffmpeg_available():
        return [input_path]
    out_dir = tempfile.mkdtemp(prefix="seg-")
    pattern = os.path.join(out_dir, "part_%03d.mp3")
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-f", "segment",
        "-segment_time", str(segment_seconds),
        "-c", "copy",
        pattern
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        files = sorted([os.path.join(out_dir, f) for f in os.listdir(out_dir) if f.endswith(".mp3")])
        return files if files else [input_path]
    except subprocess.CalledProcessError:
        return [input_path]

def get_audio_duration_seconds(path: str) -> float:
    """
    Returns duration in seconds using ffprobe (ffmpeg). Works for most formats.
    """
    try:
        out = subprocess.check_output([
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path
        ], stderr=subprocess.STDOUT).decode().strip()
        return float(out)
    except Exception:
        # Optional pydub fallback (requires ffmpeg + pydub)
        try:
            from pydub import AudioSegment
            return len(AudioSegment.from_file(path)) / 1000.0
        except Exception:
            return 0.0
