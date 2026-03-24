import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Vercel Cron: runs every Monday at 09:00 UTC
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const APP_URL = process.env.NEXTAUTH_URL ?? "https://openhelixai.com";

export async function GET(req: Request) {
  // Allow Vercel Cron invocations (x-vercel-cron: 1) OR explicit Bearer CRON_SECRET
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: { instances: { some: {} } },
    include: {
      instances: {
        include: { _count: { select: { chatMessages: true } } },
      },
    },
  });

  let sent = 0;

  for (const user of users) {
    if (!user.email) continue;

    // Weekly message count
    const weeklyMessages = await prisma.chatMessage.count({
      where: {
        instance: { userId: user.id },
        createdAt: { gte: oneWeekAgo },
      },
    });

    if (weeklyMessages === 0) continue;

    // Top questions this week (first 3 unique user messages, truncated to 120 chars)
    const topQuestions = await prisma.chatMessage.findMany({
      where: {
        instance: { userId: user.id },
        role: "user",
        createdAt: { gte: oneWeekAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { content: true },
    });
    const uniqueQuestions = Array.from(
      new Map(topQuestions.map((q) => [q.content.slice(0, 60), q.content])).values()
    ).slice(0, 3);

    // All-time message count (for context)
    const totalMessages = await prisma.chatMessage.count({
      where: { instance: { userId: user.id } },
    });

    // Estimated time saved: ~3 min per conversation (industry average for support queries)
    const minutesSaved = weeklyMessages * 3;
    const timeSaved = minutesSaved >= 60
      ? `${(minutesSaved / 60).toFixed(1)} hours`
      : `${minutesSaved} minutes`;

    // Subject line — make it specific and valuable
    const subject = `Your AI handled ${weeklyMessages} questions this week — ${timeSaved} saved`;

    // Agent status rows
    const agentRows = user.instances
      .map((inst) => {
        const statusColor = inst.status === "running" ? "#34d399" : "#6b7280";
        const statusLabel = inst.status === "running" ? "● Running" : `○ ${inst.status}`;
        const msgCount = inst._count.chatMessages;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div>
            <span style="color:#e2e8f0;font-weight:500;">${inst.name}</span>
            <span style="color:#52525b;font-size:12px;margin-left:8px;">${msgCount} total</span>
          </div>
          <span style="color:${statusColor};font-size:12px;font-weight:500;">${statusLabel}</span>
        </div>`;
      })
      .join("");

    // Top questions section (only if there are any)
    const questionsHtml = uniqueQuestions.length > 0
      ? `<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:20px;margin-bottom:24px;">
          <h3 style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">
            Recent questions from customers
          </h3>
          ${uniqueQuestions.map((q) => `
            <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
              <span style="color:#7c3aed;font-size:14px;flex-shrink:0;">❝</span>
              <span style="color:#94a3b8;font-size:13px;line-height:1.5;">${q.length > 120 ? q.slice(0, 120) + "…" : q}</span>
            </div>`).join("")}
        </div>`
      : "";

    // Upgrade CTA for free-plan users
    const upgradeCta = user.plan === "free"
      ? `<div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="color:#a78bfa;font-weight:600;margin:0 0 6px;">Ready to remove limits?</p>
          <p style="color:#94a3b8;font-size:13px;margin:0 0 14px;">Add your own API key to get unlimited conversations and go live on WhatsApp, Telegram, or your website.</p>
          <a href="${APP_URL}/dashboard/billing" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:13px;">
            See plans →
          </a>
        </div>`
      : "";

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e2e8f0;max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:#12121a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
    <h1 style="color:#a78bfa;font-size:24px;margin:0 0 8px;">Your weekly digest ⚡</h1>
    <p style="color:#94a3b8;margin:0 0 28px;">Week ending ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>

    <!-- Key metrics row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
      <div style="background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:16px;">
        <div style="font-size:28px;font-weight:700;color:#a78bfa;">${weeklyMessages}</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:2px;">conversations this week</div>
      </div>
      <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);border-radius:12px;padding:16px;">
        <div style="font-size:28px;font-weight:700;color:#34d399;">${timeSaved}</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:2px;">estimated time saved</div>
      </div>
    </div>

    <!-- All-time context -->
    <p style="color:#52525b;font-size:12px;margin:0 0 28px;">
      All-time: <strong style="color:#71717a;">${totalMessages} total conversations</strong>
    </p>

    <!-- Recent questions -->
    ${questionsHtml}

    <!-- Agent status -->
    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Your agents</h3>
      ${agentRows}
    </div>

    <!-- Upgrade CTA if applicable -->
    ${upgradeCta}

    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
      View dashboard →
    </a>

    <p style="color:#475569;font-size:12px;margin-top:32px;">
      You're receiving this because you have an active OpenHelix AI account.
      <a href="${APP_URL}/dashboard/settings" style="color:#7c3aed;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>`;

    await sendEmail({ to: user.email, subject, html }).catch(console.error);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
