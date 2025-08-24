from typing import List, Dict
from core.text_utils import chunk_text
from core.openai_utils import call_openai_chat

def generate_summary(transcript: str) -> str:
    # If short, one shot:
    if len(transcript) <= 3500:
        system = "You are an expert podcast note-taker. Be concise, factual, and structured."
        user = (
            "Summarize the following podcast transcript in 3–5 bullet points. "
            "Avoid fluff, include concrete takeaways.\n\nTranscript:\n" + transcript
        )
        return call_openai_chat(system, user)

    # If long, map-reduce:
    parts = chunk_text(transcript, 3500, 300)
    partial_summaries = []
    for i, part in enumerate(parts, 1):
        system = "You are an expert podcast note-taker. Be concise, factual, and structured."
        user = (
            f"Summarize part {i} of a podcast transcript in 3–5 bullet points. "
            "Avoid fluff, include concrete takeaways.\n\nTranscript:\n" + part
        )
        partial_summaries.append(call_openai_chat(system, user))

    system_final = "You are an expert podcast note-taker. Produce a final, non-redundant summary."
    user_final = (
        "Combine the following partial summaries into one concise list of 5–8 bullets, "
        "deduplicated, ordered logically, and focused on key outcomes:\n\n" +
        "\n\n".join(partial_summaries)
    )
    return call_openai_chat(system_final, user_final)

def generate_show_notes(transcript: str, summary: str) -> str:
    system = "You create clear, scannable podcast show notes."
    user = (
        "Using the summary and transcript, produce concise show notes with bullets. "
        "Include: key topics, guest(s) if any, and optional links section.\n\n"
        f"Summary:\n{summary}\n\nTranscript:\n{transcript}"
    )
    return call_openai_chat(system, user)

def generate_timestamps(transcript: str) -> List[str]:
    system = "You infer timestamps from transcripts."
    user = (
        "Create a short list of 3–6 timestamps in the format 'MM:SS - Title'. "
        "If exact times are unknown, approximate evenly across the content.\n\n"
        "Transcript:\n" + transcript
    )
    text = call_openai_chat(system, user)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return lines[:8] if lines else ["00:00 - Intro", "00:30 - Segment A", "01:00 - Segment B"]

def generate_social_snippets(summary: str, show_notes: str, transcript: str) -> List[str]:
    system = "You write catchy, short social media snippets."
    user = (
        "Generate 2–3 engaging social posts (max 120 characters each), "
        "no hashtags, no emojis unless natural. Focus on curiosity + value.\n\n"
        f"Summary:\n{summary}\n\nShow Notes:\n{show_notes}"
    )
    text = call_openai_chat(system, user)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return lines[:3] if lines else [
        "New episode live—key insights in minutes!",
        "Quick highlights from the latest show.",
    ]

def generate_seo(transcript: str, summary: str) -> Dict[str, str]:
    system = "You are an SEO expert for podcasts."
    user = (
        "Given the transcript and summary, generate a concise SEO title and a comma-separated list of keywords.\n\n"
        f"Summary:\n{summary}\n\nTranscript:\n{transcript}"
    )
    text = call_openai_chat(system, user)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    return {
        "title": lines[0] if lines else "Untitled Episode",
        "keywords": ", ".join(lines[1:]) if len(lines) > 1 else ""
    }

def generate_newsletter(transcript: str, summary: str, show_notes: str) -> dict:
    """
    Returns:
      - subject: short subject line
      - body_markdown: 150–300 word markdown draft
    """
    system = "You are a copywriter who turns podcast episodes into concise newsletters."
    user = (
        "Create a short newsletter/email draft from this episode. "
        "Requirements:\n"
        "- Subject line (max 80 chars)\n"
        "- 2–3 sentence intro hook\n"
        "- 3–6 bullet key takeaways\n"
        "- 1 sentence CTA to listen\n"
        "- Output the body in clean Markdown.\n\n"
        f"Summary:\n{summary}\n\nShow Notes:\n{show_notes}\n\nTranscript (for context):\n{transcript[:4000]}"
    )
    text = call_openai_chat(system, user)
    lines = [ln for ln in text.splitlines() if ln.strip()]
    subject = ""
    body_lines = []
    if lines and lines[0].lower().startswith("subject:"):
        subject = lines[0].split(":", 1)[1].strip()
        body_lines = lines[1:]
    else:
        subject = "New Episode Highlights"
        body_lines = lines
    body_md = "\n".join(body_lines).strip()
    return {"subject": subject or "New Episode Highlights", "body_markdown": body_md or text}
