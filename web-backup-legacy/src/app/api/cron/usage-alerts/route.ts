import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron job: Daily usage limit alerts
 * 
 * Checks user usage against plan limits and sends alerts at:
 * - 80% threshold (warning)
 * - 100% threshold (limit reached)
 * 
 * Vercel Cron: 0 10 * * * (daily at 10 AM)
 */
export async function GET(req: Request) {
  // Verify cron secret
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all non-free users with emails
  const users = await prisma.user.findMany({
    where: { 
      plan: { not: { equals: "free" } },
    },
  });

  let alertsSent = 0;

  for (const user of users) {
    if (!user.email) continue;

    // Get instance count for this user
    const instanceCount = await prisma.aIInstance.count({
      where: { userId: user.id },
    });

    // Get monthly message count from UsageEvent
    const messageCount = await prisma.usageEvent.count({
      where: {
        userId: user.id,
        type: "chat",
        createdAt: { gte: startOfMonth },
      },
    });

    const planLimits = getPlanLimits(user.plan);
    const alerts: Array<{
      type: "instances" | "messages";
      current: number;
      limit: number;
      percentage: number;
      threshold: "warning" | "critical";
    }> = [];

    // Check instance count
    const instancePercentage = (instanceCount / planLimits.instances) * 100;
    
    if (instancePercentage >= 100) {
      alerts.push({
        type: "instances",
        current: instanceCount,
        limit: planLimits.instances,
        percentage: instancePercentage,
        threshold: "critical",
      });
    } else if (instancePercentage >= 80) {
      alerts.push({
        type: "instances",
        current: instanceCount,
        limit: planLimits.instances,
        percentage: instancePercentage,
        threshold: "warning",
      });
    }

    // Check monthly message count (already fetched above)
    const messagePercentage = (messageCount / planLimits.messages) * 100;

    if (messagePercentage >= 100) {
      alerts.push({
        type: "messages",
        current: messageCount,
        limit: planLimits.messages,
        percentage: messagePercentage,
        threshold: "critical",
      });
    } else if (messagePercentage >= 80) {
      alerts.push({
        type: "messages",
        current: messageCount,
        limit: planLimits.messages,
        percentage: messagePercentage,
        threshold: "warning",
      });
    }

    // Send email if there are alerts
    if (alerts.length > 0) {
      const hasCritical = alerts.some(a => a.threshold === "critical");
      const html = buildUsageAlertEmail(alerts, user.plan);
      
      await sendEmail({
        to: user.email,
        subject: hasCritical 
          ? `⚠️ You've reached your ${user.plan} plan limit`
          : `📊 Approaching your ${user.plan} plan limits`,
        html,
      }).catch(console.error);

      alertsSent++;
    }
  }

  return NextResponse.json({ 
    ok: true, 
    usersChecked: users.length,
    alertsSent 
  });
}

function getPlanLimits(plan: string): { instances: number; messages: number } {
  const limits: Record<string, { instances: number; messages: number }> = {
    free: { instances: 1, messages: 100 },
    pro: { instances: 3, messages: 10000 },
    enterprise: { instances: 10, messages: 100000 },
    managed_starter: { instances: 1, messages: 5000 },
    managed_growth: { instances: 3, messages: 25000 },
    managed_scale: { instances: 10, messages: 100000 },
  };
  
  return limits[plan] ?? limits.free;
}

function buildUsageAlertEmail(
  alerts: Array<{
    type: "instances" | "messages";
    current: number;
    limit: number;
    percentage: number;
    threshold: "warning" | "critical";
  }>,
  plan: string
): string {
  const hasCritical = alerts.some(a => a.threshold === "critical");

  const alertRows = alerts.map(alert => {
    const color = alert.threshold === "critical" ? "#f87171" : "#fbbf24";
    const icon = alert.type === "instances" ? "🤖" : "💬";
    const label = alert.type === "instances" ? "AI Instances" : "Monthly Messages";
    
    return `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${color};">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">${icon}</span>
          <span style="color: ${color}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
            ${alert.threshold === "critical" ? "Limit Reached" : "Approaching Limit"}
          </span>
        </div>
        <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 4px;">${label}</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="flex: 1; background: rgba(255,255,255,0.05); border-radius: 4px; height: 8px; overflow: hidden;">
            <div style="background: ${color}; height: 100%; border-radius: 4px; width: ${Math.min(alert.percentage, 100)}%;"></div>
          </div>
          <span style="color: ${color}; font-weight: 600; font-size: 14px;">${Math.round(alert.percentage)}%</span>
        </div>
        <div style="color: #94a3b8; font-size: 13px; margin-top: 8px;">
          ${alert.current.toLocaleString()} / ${alert.limit.toLocaleString()} ${alert.type === "messages" ? "messages this month" : "instances"}
        </div>
      </div>
    `;
  }).join("");

  const ctaText = hasCritical 
    ? "Upgrade now to restore full access"
    : "Upgrade now to increase your limits";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 48px; margin-bottom: 16px;">${hasCritical ? "⚠️" : "📊"}</div>
      <h1 style="color: ${hasCritical ? "#f87171" : "#fbbf24"}; font-size: 24px; margin: 0 0 8px;">
        ${hasCritical ? "Plan Limit Reached" : "Approaching Plan Limits"}
      </h1>
      <p style="color: #94a3b8; margin: 0;">
        ${hasCritical 
          ? "You've reached one or more limits on your " + plan + " plan."
          : "You're approaching the limits of your " + plan + " plan."}
      </p>
    </div>

    ${alertRows}

    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
      <a href="${process.env.NEXTAUTH_URL ?? "https://openhelixai.com"}/dashboard/billing" 
         style="display: block; background: #7c3aed; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin-bottom: 12px;">
        ${ctaText} →
      </a>
      
      <p style="color: #52525b; font-size: 12px; text-align: center; margin: 0;">
        Need help? Reply to this email or{" "}
        <a href="${process.env.NEXTAUTH_URL ?? "https://openhelixai.com"}/contact" style="color: #7c3aed;">contact support</a>
      </p>
    </div>

    <p style="color: #475569; font-size: 12px; margin-top: 32px;">
      You're receiving this because you're a SynapseForge user on the ${plan} plan.
      <a href="${process.env.NEXTAUTH_URL ?? "https://openhelixai.com"}/dashboard/settings" style="color: #7c3aed;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>`;
}
