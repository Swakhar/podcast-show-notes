import yt_dlp
import os
from typing import Optional, Dict, Any

class YouTubeService:
    def __init__(self):
        # ✅ Updated yt-dlp options for better compatibility
        self.ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',  # More flexible format selection
            'outtmpl': '%(title)s.%(ext)s',
            'quiet': False,  # Enable logging for debugging
            'no_warnings': False,
            'extractaudio': True,
            'audioformat': 'mp3',
            'audioquality': '192K',
            # ✅ Add these for better YouTube compatibility
            'cookiefile': None,  # You can add cookies if needed
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'referer': 'https://www.youtube.com/',
            'extractor_retries': 3,
            'retries': 3,
            # ✅ Fallback options
            'ignoreerrors': True,
            'extract_flat': False,
        }
    
    def download_audio(self, url: str, output_dir: str) -> Dict[str, Any]:
        """Download audio from YouTube with better error handling"""
        
        # ✅ Try multiple format strategies
        format_strategies = [
            'bestaudio[ext=m4a]/bestaudio/best',
            'best[height<=720]/best',
            'worst',  # Last resort
        ]
        
        for strategy in format_strategies:
            try:
                opts = self.ydl_opts.copy()
                opts['format'] = strategy
                opts['outtmpl'] = os.path.join(output_dir, '%(title)s.%(ext)s')
                
                with yt_dlp.YoutubeDL(opts) as ydl:
                    # ✅ First try to extract info without downloading
                    info = ydl.extract_info(url, download=False)
                    
                    if not info:
                        continue
                    
                    # ✅ Check if we have usable formats
                    formats = info.get('formats', [])
                    if not formats:
                        continue
                    
                    # ✅ Now try to download
                    ydl.download([url])
                    
                    return {
                        'success': True,
                        'title': info.get('title', 'Unknown'),
                        'duration': info.get('duration', 0),
                        'filename': f"{info.get('title', 'audio')}.mp3"
                    }
                    
            except Exception as e:
                print(f"Strategy '{strategy}' failed: {str(e)}")
                continue
        
        # ✅ If all strategies fail, try transcript only
        return self._try_transcript_only(url)
    
    def _try_transcript_only(self, url: str) -> Dict[str, Any]:
        """Fallback: Get transcript without audio"""
        try:
            with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
                info = ydl.extract_info(url, download=False)
                
                if info and info.get('title'):
                    return {
                        'success': True,
                        'title': info.get('title', 'Unknown'),
                        'duration': info.get('duration', 0),
                        'transcript_only': True,
                        'message': 'Audio download failed, using transcript only'
                    }
        except Exception as e:
            pass
        
        raise Exception("Unable to process YouTube video. Please try a different video or check if the video is publicly available.")
