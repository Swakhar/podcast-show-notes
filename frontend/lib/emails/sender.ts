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
}

export const emailService = new EmailService();
