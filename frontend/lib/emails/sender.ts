import { sendMail } from "../smtp";
import { emailTemplates } from "./templates";

export class EmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com";
  }

  async sendWelcomeSubscription(email: string) {
    const template = emailTemplates.welcomeSubscription(this.baseUrl);
    return sendMail(email, template.subject, template.html);
  }

  async sendPaymentReceived(email: string, amount: string, currency: string) {
    const template = emailTemplates.paymentReceived(amount, currency);
    return sendMail(email, template.subject, template.html);
  }

  async sendTeamInvitation(
    email: string, 
    inviterName: string, 
    teamName: string, 
    teamUrl: string, 
    inviterEmail: string
  ) {
    const template = emailTemplates.teamInvitation(inviterName, teamName, teamUrl, inviterEmail);
    return sendMail(email, template.subject, template.html);
  }

  // NEW: Welcome email for new user registration
  async sendWelcomeUser(email: string, userName: string) {
    const template = emailTemplates.welcomeUser(userName, this.baseUrl);
    return sendMail(email, template.subject, template.html);
  }

  // NEW: Password reset email
  async sendPasswordReset(email: string, userName: string, resetToken: string) {
    const resetUrl = `${this.baseUrl}/reset-password?token=${resetToken}`;
    const template = emailTemplates.passwordReset(userName, resetUrl, this.baseUrl);
    return sendMail(email, template.subject, template.html);
  }

  async sendPaymentFailed(email: string) {
    const subject = "Zahlung fehlgeschlagen - CastLumen";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Zahlung fehlgeschlagen</h1>
        <p>Hallo,</p>
        <p>Ihre letzte Zahlung für CastLumen konnte nicht abgebucht werden.</p>
        <p><strong>Was Sie tun können:</strong></p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" 
             style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Zahlungsdetails aktualisieren
          </a>
        </p>
        <p>Ihr CastLumen Team</p>
        <hr>
        <small style="color: #666;">
          CastLumen GmbH | Bei Fragen: support@castlumen.com
        </small>
      </div>
    `;
    
    await sendMail(email, subject, html);
  }

  async sendPaymentRetry(email: string) {
    const subject = "Zahlungsversuch wird wiederholt - CastLumen";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Zahlungsversuch wird wiederholt</h1>
        <p>Hallo,</p>
        <p>Wir versuchen in den nächsten Tagen erneut, den Betrag für Ihr CastLumen Abonnement abzubuchen.</p>
        <p>Bitte stellen Sie sicher, dass Ihr Konto ausreichend gedeckt ist.</p>
        <p>Ihr CastLumen Team</p>
      </div>
    `;
    
    await sendMail(email, subject, html);
  }

  // ✅ ADD THIS METHOD
  async sendContactForm({ name, email, subject, message }: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const emailSubject = `[CastLumen Kontakt] ${subject}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
          Neue Kontaktanfrage
        </h1>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; margin-top: 0;">Kontaktdetails</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Betreff:</strong> ${subject}</p>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #374151; margin-top: 0;">Nachricht</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">
            <strong>Antwort erforderlich:</strong> Bitte antworten Sie innerhalb von 24 Stunden an 
            <a href="mailto:${email}" style="color: #1d4ed8;">${email}</a>
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <footer style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>Diese E-Mail wurde automatisch über das CastLumen Kontaktformular generiert.</p>
          <p>CastLumen GmbH | support@castlumen.com</p>
        </footer>
      </div>
    `;

    // Send to your support email
    await sendMail(
      process.env.SUPPORT_EMAIL || 'support@castlumen.com', 
      emailSubject, 
      html
    );

    // Optional: Send confirmation email to the user
    await this.sendContactConfirmation(email, name);
  }

  // ✅ BONUS: Send confirmation to user
  async sendContactConfirmation(email: string, name: string) {
    const subject = "Ihre Anfrage wurde empfangen - CastLumen";
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1f2937;">Vielen Dank für Ihre Anfrage!</h1>
        
        <p>Hallo ${name},</p>
        
        <p>wir haben Ihre Nachricht erhalten und werden uns binnen <strong>24 Stunden</strong> bei Ihnen melden.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Was passiert als Nächstes?</h3>
          <ul style="color: #374151;">
            <li>Unser Team prüft Ihre Anfrage</li>
            <li>Sie erhalten eine persönliche Antwort</li>
            <li>Bei technischen Fragen: Direkter Kontakt zu unserem Support-Team</li>
            <li>Bei Vertriebsfragen: Terminvereinbarung für ein Beratungsgespräch</li>
          </ul>
        </div>
        
        <div style="background: #fef7cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>Dringende Anfragen?</strong> 
            Schreiben Sie direkt an <a href="mailto:support@castlumen.com" style="color: #1d4ed8;">support@castlumen.com</a>
          </p>
        </div>
        
        <p>Mit freundlichen Grüßen<br>
        Ihr CastLumen Team</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <footer style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>CastLumen GmbH | Musterstraße 123, 10115 Berlin</p>
          <p>USt-IdNr: DE123456789 | <a href="${process.env.NEXT_PUBLIC_APP_URL}/impressum" style="color: #6b7280;">Impressum</a></p>
        </footer>
      </div>
    `;

    await sendMail(email, subject, html);
  }
}

export const emailService = new EmailService();
