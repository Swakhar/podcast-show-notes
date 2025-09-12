from typing import List, Dict
from core.text_utils import chunk_text
from core.openai_utils import call_openai_chat

# ---------- Language helpers ----------
def _lang_rule(language: str) -> str:
    """
    Returns a very explicit, hard-to-ignore rule for the output language.
    We put this both at the top and bottom of the user prompt.
    """
    if not language or language == "auto":
        # Keep same language as transcript (no translation)
        return (
            "OUTPUT LANGUAGE: Same as the transcript. "
            "Do not switch languages. Use the transcript's language consistently."
        )
    if language == "de":
        return (
            "OUTPUT LANGUAGE: Deutsch. "
            "Antwort ausschließlich auf Deutsch. Keine englischen Wörter außer Eigennamen."
        )
    if language == "en":
        return (
            "OUTPUT LANGUAGE: English. "
            "Respond only in English. Do not include any other languages."
        )
    # default fallback
    return (
        "OUTPUT LANGUAGE: Same as the transcript. "
        "Do not switch languages. Use the transcript's language consistently."
    )

def _wrap_user(task: str, transcript: str, language: str) -> str:
    """
    Place the language rule as the FIRST and LAST line of the user prompt
    so the model sees it in the highest-attention areas.
    """
    rule = _lang_rule(language)
    return f"{rule}\n\n{task}\n\nTranscript:\n{transcript}\n\n{rule}"

def _merge_prompts(base_system: str, base_user: str, preset: dict|None):
    if not preset: return base_system, base_user
    sys = (preset.get("system") or "").strip()
    usr = (preset.get("user") or "").strip()
    return (f"{sys}\n\n{base_system}".strip() if sys else base_system,
            f"{usr}\n\n{base_user}".strip() if usr else base_user)

# ---------- Generators ----------
def generate_summary(transcript: str, language: str = "auto", preset: dict|None = None) -> str:
    # short path
    if len(transcript) <= 3500:
        system = "You are an expert podcast note-taker. Be concise, factual, and structured."
        user =  "Summarize the episode in 3–5 bullet points. Avoid fluff; include concrete takeaways."
        system, user = _merge_prompts(system, user, preset)
        wrap_user = _wrap_user(user, transcript, language)
        return call_openai_chat(system, wrap_user)

    # long path (map-reduce)
    parts = chunk_text(transcript, 3500, 300)
    partial_summaries = []
    for i, part in enumerate(parts, 1):
        system = "You are an expert podcast note-taker. Be concise, factual, and structured."
        user =  f"Summarize part {i} of the episode in 3–5 bullet points. Avoid fluff; include concrete takeaways."
        system, user = _merge_prompts(system, user, preset)
        wrap_user = _wrap_user(user, part, language)
        partial_summaries.append(call_openai_chat(system, wrap_user))

    system_final = "You are an expert podcast note-taker. Produce a final, non-redundant summary."
    user_final = _wrap_user(
        "Combine the partial summaries below into one concise list of 5–8 bullets, deduplicated and logically ordered:\n\n"
        + "\n\n".join(partial_summaries),
        "",  # no extra transcript here
        language,
    )
    return call_openai_chat(system_final, user_final)

def generate_show_notes(transcript: str, summary: str, language: str = "auto", preset: dict|None = None) -> str:
    system = "You create clear, scannable podcast show notes."
    task = (
        "Using the summary and transcript, produce concise show notes with bullets. "
        "Include: key topics, guest(s) if any, and an optional links section."
        "\n\nSummary:\n" + summary
    )
    system, task = _merge_prompts(system, task, preset)
    user = _wrap_user(task, transcript, language)
    return call_openai_chat(system, user)

def generate_timestamps(transcript: str, language: str = "auto") -> List[str]:
    system = "You infer timestamps from transcripts."
    task = (
        "Create a short list of 3–6 timestamps in the format 'MM:SS - Title'. "
        "If exact times are unknown, approximate evenly across the content."
    )
    text = call_openai_chat(system, _wrap_user(task, transcript, language))
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return lines[:8] if lines else ["00:00 - Intro", "00:30 - Segment A", "01:00 - Segment B"]

def generate_social_snippets(summary: str, show_notes: str, transcript: str, language: str = "auto") -> List[str]:
    system = "You write catchy, short social media snippets."
    task = (
        "Generate 2–3 engaging social posts (max 120 characters each). "
        "No hashtags, no emojis unless they read naturally. Focus on curiosity + value."
        f"\n\nSummary:\n{summary}\n\nShow Notes:\n{show_notes}"
    )
    text = call_openai_chat(system, _wrap_user(task, transcript, language))
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return lines[:3] if lines else [
        "Neue Episode – die wichtigsten Erkenntnisse in Minuten!",
        "Schnelle Highlights aus der neuesten Folge.",
    ]

def generate_seo(transcript: str, summary: str, language: str = "auto", preset: dict|None = None) -> Dict[str, str]:
    system = "You are an SEO expert for podcasts."
    task = (
        "Given the transcript and summary, generate a concise SEO title on one line "
        "and a comma-separated list of keywords on the following line(s)."
        f"\n\nSummary:\n{summary}"
    )
    system, task = _merge_prompts(system, task, preset)
    text = call_openai_chat(system, _wrap_user(task, transcript, language))
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    return {
        "title": lines[0] if lines else ("Unbenannte Episode" if language == "de" else "Untitled Episode"),
        "keywords": ", ".join(lines[1:]) if len(lines) > 1 else ""
    }

def generate_newsletter(transcript: str, summary: str, show_notes: str, language: str = "auto", preset: dict|None = None) -> dict:
    system = "You are a copywriter who turns podcast episodes into concise newsletters."
    task = (
        "Create a short newsletter/email draft from this episode.\n"
        "- Subject line (max 80 chars)\n"
        "- 2–3 sentence intro hook\n"
        "- 3–6 bullet key takeaways\n"
        "- 1 sentence CTA to listen\n"
        "- Output the body in clean Markdown.\n\n"
        f"Summary:\n{summary}\n\nShow Notes:\n{show_notes}"
    )
    system, task = _merge_prompts(system, task, preset)
    text = call_openai_chat(system, _wrap_user(task, transcript[:4000], language))
    lines = [ln for ln in text.splitlines() if ln.strip()]
    subject = ""
    body_lines = []
    if lines and lines[0].lower().startswith("subject:"):
        subject = lines[0].split(":", 1)[1].strip()
        body_lines = lines[1:]
    else:
        subject = "Neue Episoden-Highlights" if language == "de" else "New Episode Highlights"
        body_lines = lines
    body_md = "\n".join(body_lines).strip()
    return {"subject": subject or ("Neue Episoden-Highlights" if language == "de" else "New Episode Highlights"),
            "body_markdown": body_md or text}
