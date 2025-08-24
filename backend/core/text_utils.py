import re
from typing import List, Optional

VTT_CUE_RE = re.compile(r"(?P<start>\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(?P<end>\d{2}:\d{2}:\d{2}\.\d{3})")

def _hms_to_seconds(hms_ms: str) -> float:
    h, m, s_ms = hms_ms.split(":")
    s = float(s_ms)
    return int(h) * 3600 + int(m) * 60 + s

def vtt_to_text(vtt: str, max_seconds: Optional[int] = None) -> str:
    """
    Convert VTT to plain text, optionally including only cues whose START time <= max_seconds.
    Drops timing/index lines.
    """
    lines_out = []
    keep = True
    for line in vtt.splitlines():
        m = VTT_CUE_RE.search(line)
        if m:
            start_s = _hms_to_seconds(m.group("start"))
            keep = max_seconds is None or start_s <= max_seconds
            continue  # skip timing line itself
        if line.strip().isdigit() or line.strip().startswith("WEBVTT"):
            continue
        if keep and line.strip():
            lines_out.append(line.strip())
    return "\n".join(lines_out)

def chunk_text(text: str, chunk_size: int = 3500, overlap: int = 300) -> List[str]:
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
        if start < 0:
            start = 0
    return chunks
