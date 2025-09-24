from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import Optional, Dict, Any

def extract_video_id(url: str) -> Optional[str]:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\n?#]+)',
        r'youtube\.com/watch\?.*v=([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_youtube_transcript(url: str) -> Dict[str, Any]:
    """Get transcript directly from YouTube"""
    video_id = extract_video_id(url)
    if not video_id:
        raise Exception("Invalid YouTube URL")
    
    try:
        # ✅ Try to get transcript
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Prefer manually created transcripts
        transcript = None
        try:
            transcript = transcript_list.find_manually_created_transcript(['en'])
        except:
            try:
                transcript = transcript_list.find_generated_transcript(['en'])
            except:
                # Try any available transcript
                transcripts = list(transcript_list)
                if transcripts:
                    transcript = transcripts[0]
        
        if not transcript:
            raise Exception("No transcript available")
        
        # Get the actual transcript text
        transcript_data = transcript.fetch()
        
        # Combine all text
        full_text = ' '.join([entry['text'] for entry in transcript_data])
        
        return {
            'success': True,
            'transcript': full_text,
            'video_id': video_id,
            'method': 'transcript_api'
        }
        
    except Exception as e:
        raise Exception(f"Could not retrieve transcript: {str(e)}")
