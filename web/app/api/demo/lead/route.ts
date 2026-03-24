import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Simple in-memory dedup: don't notify twice for same email in same process lifetime
const seen = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    if (seen.has(normalized)) {
      return NextResponse.json({ ok: true });
    }
    seen.add(normalized);

    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM ?? "OpenHelix AI <onboarding@resend.dev>";

    if (adminEmails.length > 0 && apiKey) {
      const resend = new Resend(apiKey);
      resend.emails.send({
        from,
        to: adminEmails,
        replyTo: normalized,
        subject: "🔥 New demo lead — OpenHelix AI",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
            <h2 style="color:#7c3aed;margin-bottom:8px;">New Demo Lead 🔥</h2>
            <p style="color:#333;">Someone tried the live demo on <strong>openhelixai.com</strong> and asked for a personalised setup:</p>
            <p style="font-size:1.3em;font-weight:bold;color:#111;margin:16px 0;">${normalized}</p>
            <p style="color:#666;font-size:0.9em;">They hit the demo rate limit and chose "get a personalised setup" — they&apos;re warm, reach out now.</p>
            <a href="mailto:${normalized}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Email ${normalized} →</a>
          </div>
        `,
      }).catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
