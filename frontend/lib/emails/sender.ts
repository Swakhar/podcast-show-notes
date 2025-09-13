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
}

export const emailService = new EmailService();
