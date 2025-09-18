import os
from dotenv import load_dotenv
from core.email_utils import send_completion_email

# Load environment variables from .env file
load_dotenv()

# Test with a real email address
test_result = {
    "seo": {"title": "Test Episode from RSS Pull"},
    "summary": "This is a test AI summary of the podcast episode.",
    "show_notes": "• Introduction\n• Main topic discussion\n• Q&A session", 
    "timestamps": [{"time": "00:00", "text": "Introduction"}],
    "social_snippets": ["Great insights on this topic!"],
    "newsletter": "This week's episode covers..."
}

# Debug: Check if environment variables are loaded
print("SMTP_SERVER:", os.getenv("SMTP_SERVER"))
print("FROM_EMAIL:", os.getenv("FROM_EMAIL"))

# Replace with your actual email
success = send_completion_email("your-actual-email@example.com", test_result, "rss")
print(f"Email sent: {success}")
