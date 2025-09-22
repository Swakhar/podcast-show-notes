import type { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../lib/emails/sender';
import { logger } from "../../lib/logger";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Send email to your support team
    await emailService.sendContactForm({ name, email, subject, message });
    
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    logger.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
}
