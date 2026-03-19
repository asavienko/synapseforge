import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// Simple in-memory rate limit: max 3 submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: { name?: string; email?: string; message?: string; subject?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, message, subject } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  if (!email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: "Message too long." }, { status: 400 });
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#12121a;border-radius:12px;color:#e2e8f0;">
      <h2 style="color:#a78bfa;margin:0 0 8px;">📩 New Contact Message</h2>
      <p style="color:#94a3b8;margin:0 0 24px;">Via SynapseForge contact form</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#6b7280;width:80px;vertical-align:top;">From</td><td style="padding:8px 0;color:#e2e8f0;">${name.trim()}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#a78bfa;">${email}</a></td></tr>
        ${subject ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Subject</td><td style="padding:8px 0;color:#e2e8f0;">${subject.trim()}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Message</td><td style="padding:8px 0;color:#e2e8f0;white-space:pre-wrap;">${message.trim()}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;">
      <p style="color:#475569;font-size:12px;">Reply directly to this email to respond to ${name.trim()}.</p>
    </div>`;

  await sendEmail({
    to: "asavienko@gmail.com",
    replyTo: email,
    subject: `[Contact] ${subject?.trim() || `Message from ${name.trim()}`}`,
    html,
  });

  return NextResponse.json({ ok: true });
}
