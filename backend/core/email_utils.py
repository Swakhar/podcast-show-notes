import os
import requests
from typing import Dict, Any

FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://castlumen.com')
MAILERSEND_API_KEY = os.getenv('MAILERSEND_API_KEY')
MAILERSEND_DOMAIN = os.getenv('MAILERSEND_DOMAIN', 'castlumen.com')
FROM_EMAIL = f"noreply@{MAILERSEND_DOMAIN}"
FROM_NAME = "CastLumen"

def send_email_via_mailersend(to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
    """Send email using MailerSend API"""
    if not MAILERSEND_API_KEY:
        print("❌ MAILERSEND_API_KEY not configured")
        return False
    
    url = "https://api.mailersend.com/v1/email"
    
    payload = {
        "from": {
            "email": FROM_EMAIL,
            "name": FROM_NAME
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "html": html_content,
        "text": text_content or html_content
    }
    
    headers = {
        "Authorization": f"Bearer {MAILERSEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        print(f"📧 Sending email to {to_email}: {subject}")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 202:
            print(f"✅ Email sent successfully to {to_email}")
            return True
        else:
            print(f"❌ Email failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Email send error: {e}")
        return False

def send_completion_email(user_email: str, result: Dict[str, Any], content_type: str, job_id: str) -> bool:
    """Send completion notification email"""
    
    subject = f"🎉 Your {content_type} content is ready!"
    
    # Count generated features
    features_generated = []
    if result.get('summary'):
        features_generated.append("📋 Summary")
    if result.get('show_notes'):
        features_generated.append("📝 Show Notes")
    if result.get('timestamps'):
        features_generated.append("⏰ Timestamps")
    if result.get('social_snippets'):
        features_generated.append("📱 Social Snippets")
    if result.get('seo'):
        features_generated.append("🔍 SEO Content")
    if result.get('newsletter'):
        features_generated.append("📧 Newsletter")
    
    features_html = "".join(f"<li>{feature}</li>" for feature in features_generated)
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Content Ready - CastLumen</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2d3748;">🎉 Your Content is Ready!</h1>
        </div>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>Hi there!</p>
            <p>Great news! We've successfully processed your <strong>{content_type}</strong> content and generated:</p>
            
            <ul style="line-height: 1.6;">
                {features_html}
            </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{FRONTEND_URL}/results/{job_id}" 
               style="background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Your Content
            </a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
            <p>Thanks for using CastLumen!</p>
            <p>Need help? Reply to this email or visit our <a href="{FRONTEND_URL}/support">support page</a>.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    🎉 Your Content is Ready!
    
    Hi there!
    
    Great news! We've successfully processed your {content_type} content.
    
    Generated content:
    {chr(10).join(f"• {feature}" for feature in features_generated)}

    View your content: {FRONTEND_URL}/results/{job_id}

    Thanks for using CastLumen!
    """
    
    return send_email_via_mailersend(user_email, subject, html_content, text_content)

def send_error_email(user_email: str, error_message: str, source_url: str = "") -> bool:
    """Send error notification email"""
    
    subject = "❌ Processing failed - CastLumen"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Processing Failed - CastLumen</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e53e3e;">❌ Processing Failed</h1>
        </div>
        
        <div style="background: #fed7d7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>Hi there,</p>
            <p>We encountered an issue while processing your content:</p>
            <p style="font-family: monospace; background: #fff; padding: 10px; border-radius: 4px;">
                {error_message}
            </p>
            {f"<p><strong>Source:</strong> {source_url}</p>" if source_url else ""}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{FRONTEND_URL}/generate" 
               style="background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Try Again
            </a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #718096;">
            <p>If this issue persists, please contact our support team.</p>
            <p>Thanks for using CastLumen!</p>
        </div>
    </body>
    </html>
    """
    
    return send_email_via_mailersend(user_email, subject, html_content)
