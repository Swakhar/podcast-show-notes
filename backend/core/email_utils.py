import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import urlparse

def send_completion_email(user_email: str, job_result: dict, source_type: str = "manual", job_id: str = "") -> bool:
    """Send completion email when job finishes"""
    try:
        # Parse your existing SMTP_SERVER URL (with credentials)
        smtp_url = os.getenv("SMTP_SERVER")
        if not smtp_url:
            print("SMTP_SERVER not configured - skipping email")
            return False
            
        # Parse the smtp://username:password@host:port format
        parsed = urlparse(smtp_url)
        smtp_host = parsed.hostname
        smtp_port = parsed.port or 587
        smtp_user = parsed.username
        smtp_password = parsed.password
        
        from_email = os.getenv("FROM_EMAIL", "noreply@castlumen.com")
        
        if not all([smtp_host, smtp_user, smtp_password]):
            print("Email configuration incomplete - skipping email")
            return False
        
        # Create email content
        title = job_result.get("seo", {}).get("title", "Your Podcast Content")
        source_text = "RSS Feed Auto-Pull" if source_type == "rss" else "Manual Upload"
        
        subject = f"🎙️ New Podcast Content Ready: {title}"
        
        # HTML email body
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #9CEE69, #4ADE80); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #1F2937; margin: 0;">🎙️ Your podcast content is ready!</h1>
            </div>
            
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p><strong>Episode:</strong> {title}</p>
                <p><strong>Source:</strong> {source_text}</p>
            </div>
            
            <h2 style="color: #1F2937;">What's Ready:</h2>
            <ul style="background: #F3F4F6; padding: 20px; border-radius: 8px;">
        """
        
        # Add checkmarks for generated content
        features = []
        if job_result.get("summary"):
            features.append("✅ AI Summary")
        if job_result.get("show_notes"):
            features.append("✅ Show Notes")
        if job_result.get("timestamps"):
            features.append("✅ Timestamps")
        if job_result.get("social_snippets"):
            features.append("✅ Social Media Snippets")
        if job_result.get("seo"):
            features.append("✅ SEO Content")
        if job_result.get("newsletter"):
            features.append("✅ Newsletter Draft")
            
        for feature in features:
            html_content += f"<li style='margin: 8px 0;'>{feature}</li>"
        
        html_content += f"""
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3001')}/results/{job_id}" 
                   style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View Your Content
                </a>
            </div>
            
            <div style="background: #EFF6FF; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                <p style="margin: 0; color: #1E40AF; font-size: 14px;">
                    <strong>Tip:</strong> Your content is ready to download, copy, or publish directly to WordPress!
                </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
            
            <p style="color: #6B7280; font-size: 12px; text-align: center;">
                This content was automatically generated from your {source_text.lower()}.<br>
                <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3001')}/settings" style="color: #3B82F6;">Manage your notification preferences</a>
            </p>
        </body>
        </html>
        """
        
        # Create message
        msg = MIMEMultipart('alternative')  # Changed from MimeMultipart
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = user_email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')  # Changed from MimeText
        msg.attach(html_part)
        
        # Send email using your existing Mailtrap configuration
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Completion email sent to {user_email} via Mailtrap")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send completion email: {e}")
        return False

def send_error_email(user_email: str, error_message: str, job_url: str):
    """Send error notification email"""
    try:
        # Parse your existing SMTP_SERVER URL (same as send_completion_email)
        smtp_url = os.getenv("SMTP_SERVER")
        if not smtp_url:
            print("SMTP_SERVER not configured - skipping error email")
            return False
            
        # Parse the smtp://username:password@host:port format
        parsed = urlparse(smtp_url)
        smtp_host = parsed.hostname
        smtp_port = parsed.port or 587
        smtp_user = parsed.username
        smtp_password = parsed.password
        
        from_email = os.getenv("FROM_EMAIL", "noreply@castlumen.com")
        
        if not all([smtp_host, smtp_user, smtp_password]):
            print("Email configuration incomplete - skipping error email")
            return False
        
        subject = "❌ Podcast Processing Failed"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #FEE2E2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #EF4444;">
                <h1 style="color: #DC2626; margin: 0;">❌ Processing Failed</h1>
            </div>
            
            <p>We encountered an issue processing your podcast:</p>
            <p><strong>URL:</strong> {job_url}</p>
            <p><strong>Error:</strong> {error_message}</p>
            
            <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400E;">
                    <strong>What to try:</strong><br>
                    • Check if the audio URL is accessible<br>
                    • Try a different format (MP3, WAV, M4A)<br>
                    • Ensure the file isn't too large<br>
                    • Contact support if the issue persists
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3001')}/results/{job_id}" 
                   style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View Your Content
                </a>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart('alternative')  # Changed from MimeMultipart
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = user_email
        
        html_part = MIMEText(html_content, 'html')  # Changed from MimeText
        msg.attach(html_part)
        
        # Use the same method as send_completion_email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Error email sent to {user_email} via Mailtrap")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send error email: {e}")
        return False
