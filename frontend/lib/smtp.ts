import nodemailer from "nodemailer";

const url = process.env.EMAIL_SERVER!;
const parsed = new URL(url);
const transporter = nodemailer.createTransport({
  host: parsed.hostname,
  port: Number(parsed.port) || 587,
  secure: false,
  auth: { user: decodeURIComponent(parsed.username), pass: decodeURIComponent(parsed.password) },
});

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_SERVER) return;
  await transporter.sendMail({ from: process.env.EMAIL_FROM || "CastLumen <no-reply@castlumen.com>", to, subject, html });
}
