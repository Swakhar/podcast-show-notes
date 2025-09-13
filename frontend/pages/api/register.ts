import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { emailService } from "../../lib/emails/sender";

// --- tiny in-memory rate limiter (per IP) ---
const windowMs = 60_000;         // 1 minute
const maxReqs = 10;              // 10 attempts / minute
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
    }
  if (b.count >= maxReqs) return false;
  b.count += 1;
  return true;
}

// --- reCAPTCHA verify (v2) ---
async function verifyRecaptcha(token?: string, remoteip?: string) {
  const secret = process.env.GOOGLE_RECAPTCHA_SECRET; // v2 secret (server-side)
  if (!secret) return true; // treat as disabled in dev if not set
  if (!token) return false;

  const params = new URLSearchParams();
  params.set("secret", secret);
  params.set("response", token);
  if (remoteip) params.set("remoteip", remoteip);

  try {
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await resp.json();
    return !!data.success;
  } catch {
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, confirmPassword, captchaToken } = req.body;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords don't match" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  // Verify reCAPTCHA if enabled
  if (process.env.GOOGLE_RECAPTCHA_SECRET_KEY && captchaToken) {
    try {
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
      });
      
      const data = await response.json();
      if (!data.success) {
        return res.status(400).json({ error: "reCAPTCHA verification failed" });
      }
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return res.status(500).json({ error: "reCAPTCHA verification failed" });
    }
  }

  // rate limit
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (!rateLimit(ip)) return res.status(429).json({ error: "Too many attempts, try again later." });

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        plan: "FREE",
        monthlyMinutesLimit: 30,
        monthlyMinutesUsed: 0,
        monthlyResetAt: new Date(),
      },
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeUser(user.email, user.name || "there");
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    return res.status(201).json({ 
      message: "Account created successfully",
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Failed to create account" });
  }
}
