import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

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
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // rate limit
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";
  if (!rateLimit(ip)) return res.status(429).json({ error: "Too many attempts, try again later." });

  try {
    let { name, email, password, confirmPassword, captchaToken } = req.body || {};

    // normalize
    name = (name || "").toString().trim();
    email = (email || "").toString().trim().toLowerCase();
    password = (password || "").toString();
    confirmPassword = (confirmPassword || "").toString();

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    // captcha
    const captchaOk = await verifyRecaptcha(captchaToken, ip);
    if (!captchaOk) return res.status(400).json({ error: "Captcha verification failed" });

    // unique email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email is already registered." });

    // hash & create
    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,          // <-- requires `password String?` in Prisma schema
        plan: "FREE",
        subscriptionStatus: null,
        monthlyMinutesLimit: 30,
        monthlyMinutesUsed: 0,
      },
      select: { id: true, email: true, name: true, plan: true },
    });

    return res.status(200).json({ ok: true, user });
  } catch (e: any) {
    console.error("[register] error:", e);
    return res.status(500).json({ error: "Registration failed" });
  }
}
