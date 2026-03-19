import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

async function notifyEmail(email: string, source: string) {
  const html = `
    <h2>New OpenHelix AI lead</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Source:</strong> ${source}</p>
    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
    <p>They hit the sandbox limit and submitted — this is a hot lead. Reply fast.</p>
  `;
  await sendEmail({
    to: "asavienko@gmail.com",
    subject: `🔥 New lead: ${email} just joined the waitlist`,
    html,
  });
}

async function notifyTelegram(email: string, source: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  const text = `🔥 *New waitlist lead*\n\nEmail: \`${email}\`\nSource: ${source}\nTime: ${new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid" })}\n\n_They hit the sandbox limit and signed up — reply fast._`;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "381562063",
      text,
      parse_mode: "Markdown",
    }),
  });
}

export async function POST(req: NextRequest) {
  const { email, source = "sandbox_exhausted" } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const existing = await prisma.waitlistEntry.findUnique({ where: { email } });

  await prisma.waitlistEntry.upsert({
    where: { email },
    update: { source },
    create: { email, source },
  });

  if (!existing) {
    // New lead — fire notifications (fire-and-forget)
    Promise.all([
      notifyEmail(email, source).catch(() => {}),
      notifyTelegram(email, source).catch(() => {}),
    ]);
  }

  return NextResponse.json({ ok: true });
}
