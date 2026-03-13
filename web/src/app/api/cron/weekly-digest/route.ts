import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Vercel Cron: runs every Monday at 09:00 UTC
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: { instances: { some: {} } },
    include: {
      instances: {
        include: {
          _count: { select: { chatMessages: true } },
        },
      },
    },
  });

  let sent = 0;

  for (const user of users) {
    if (!user.email) continue;

    const weeklyMessages = await prisma.chatMessage.count({
      where: {
        instance: { userId: user.id },
        createdAt: { gte: oneWeekAgo },
      },
    });

    if (weeklyMessages === 0) continue;

    const subject = `Your AI agents had ${weeklyMessages} conversations this week`;

    const agentRows = user.instances
      .map((inst) => {
        const statusColor = inst.status === "running" ? "#34d399" : "#6b7280";
        const statusLabel = inst.status === "running" ? "● Running" : `○ ${inst.status}`;
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:#e2e8f0;">${inst.name}</span>
          <span style="color:${statusColor};font-size:12px;font-weight:500;">${statusLabel}</span>
        </div>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e2e8f0;max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:#12121a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
    <h1 style="color:#a78bfa;font-size:24px;margin:0 0 8px;">Your weekly digest ⚡</h1>
    <p style="color:#94a3b8;margin:0 0 32px;">Here's how your AI agents performed this week.</p>
    <div style="margin-bottom:32px;">
      <div style="background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:12px;padding:20px;">
        <div style="font-size:32px;font-weight:700;color:#a78bfa;">${weeklyMessages}</div>
        <div style="color:#94a3b8;font-size:14px;">conversations this week</div>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:20px;margin-bottom:24px;">
      <h3 style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.05em;">Your agents</h3>
      ${agentRows}
    </div>
    <a href="https://synapseforge.ai/dashboard" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
      View dashboard →
    </a>
    <p style="color:#475569;font-size:12px;margin-top:32px;">
      You're receiving this because you have an active SynapseForge account.
      <a href="https://synapseforge.ai/dashboard/settings" style="color:#7c3aed;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

    await sendEmail({ to: user.email, subject, html }).catch(console.error);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
