import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { MILESTONES } from "@/lib/milestones";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Allow Vercel Cron invocations (x-vercel-cron: 1) OR explicit Bearer CRON_SECRET
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    include: {
      instances: {
        include: { _count: { select: { chatMessages: true } } },
      },
    },
  });

  let triggered = 0;

  for (const user of users) {
    if (!user.email) continue;

    const totalMessages = user.instances.reduce(
      (sum, i) => sum + i._count.chatMessages,
      0
    );
    const totalInstances = user.instances.filter(
      (i) => i.status === "running"
    ).length;
    const daysActive = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000
    );

    const stats = {
      totalMessages,
      totalInstances,
      daysActive,
      totalCredentials: 0,
    };

    // Fetch already-recorded milestones for this user via ActivityLog
    const existingLogs = await prisma.activityLog.findMany({
      where: {
        event: "milestone_achieved",
        instance: { userId: user.id },
      },
      select: { details: true },
    });
    const achievedKeys = new Set(
      existingLogs.map((l) => l.details).filter(Boolean) as string[]
    );

    for (const milestone of MILESTONES) {
      if (achievedKeys.has(milestone.key)) continue;
      if (!milestone.check(stats)) continue;

      const firstInstance = user.instances[0];
      if (!firstInstance) continue;

      // Record milestone in ActivityLog
      await prisma.activityLog
        .create({
          data: {
            instanceId: firstInstance.id,
            event: "milestone_achieved",
            details: milestone.key,
          },
        })
        .catch(console.error);

      const milestoneLabel = milestone.label;
      const milestoneDescription = milestone.description;

      const html = `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,sans-serif;background:#0a0a0f;color:#e2e8f0;max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="background:#12121a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">🎉</div>
    <h1 style="color:#a78bfa;font-size:24px;">${milestoneLabel}</h1>
    <p style="color:#94a3b8;">${milestoneDescription}</p>
    <a href="https://synapseforge.ai/dashboard" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin-top:16px;">
      See your progress →
    </a>
  </div>
</body>
</html>`;

      await sendEmail({
        to: user.email,
        subject: `🎉 Milestone: ${milestoneLabel}`,
        html,
      }).catch(console.error);

      triggered++;
    }
  }

  return NextResponse.json({ ok: true, triggered });
}
