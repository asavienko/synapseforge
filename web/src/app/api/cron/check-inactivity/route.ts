import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const INACTIVITY_DAYS = 7;

export async function GET(req: Request) {
  // Allow Vercel Cron invocations (x-vercel-cron: 1) OR explicit Bearer CRON_SECRET
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Users inactive for 7+ days but seen within last 14 days (one-time nudge window)
  const inactiveUsers = await prisma.user.findMany({
    where: {
      updatedAt: { lte: cutoff, gte: twoWeeksAgo },
      instances: { some: {} },
    },
  });

  let sent = 0;

  for (const user of inactiveUsers) {
    if (!user.email) continue;

    const runningCount = await prisma.aIInstance.count({
      where: { userId: user.id, status: "running" },
    });

    const agentNote =
      runningCount > 0
        ? `Your ${runningCount} agent${runningCount > 1 ? "s are" : " is"} still running and ready to help your users.`
        : "Your agents are waiting to be set up.";

    const subject =
      runningCount > 0
        ? "Your AI agents are running — we miss you"
        : "Come back to SynapseForge — we miss you";

    const html = `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,sans-serif;background:#0a0a0f;color:#e2e8f0;max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:#12121a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
    <h1 style="color:#a78bfa;font-size:22px;margin-bottom:8px;">We miss you 👋</h1>
    <p style="color:#94a3b8;line-height:1.6;">
      You haven't logged in for a while. ${agentNote}
    </p>
    <a href="https://synapseforge.ai/dashboard" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin-top:20px;">
      Check your dashboard →
    </a>
    <p style="color:#475569;font-size:12px;margin-top:24px;">
      <a href="https://synapseforge.ai/dashboard/settings" style="color:#7c3aed;">Unsubscribe from emails</a>
    </p>
  </div>
</body>
</html>`;

    await sendEmail({ to: user.email, subject, html }).catch(console.error);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
