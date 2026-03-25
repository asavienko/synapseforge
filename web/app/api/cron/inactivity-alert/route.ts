import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron job: Daily inactivity detection
 * 
 * Finds clients with no AI conversations in the last 7 days
 * and notifies their managers for follow-up.
 * 
 * Vercel Cron: 0 9 * * * (daily at 9 AM, after manager-alerts)
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

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all managers with their clients
  const managers = await prisma.manager.findMany({
    include: {
      users: {
        include: {
          instances: {
            select: { id: true },
          },
        },
      },
    },
  });

  let alertsSent = 0;

  for (const manager of managers) {
    if (!manager.email) continue;

    const inactiveClients: Array<{
      clientName: string;
      daysSinceLastMessage: number;
    }> = [];

    for (const user of manager.users) {
      // Skip if no instances
      if (user.instances.length === 0) continue;

      // Check for any recent messages
      let totalRecentMessages = 0;
      for (const instance of user.instances) {
        const recentCount = await prisma.chatMessage.count({
          where: {
            instanceId: instance.id,
            createdAt: { gte: sevenDaysAgo },
          },
        });
        totalRecentMessages += recentCount;
      }

      if (totalRecentMessages === 0) {
        // Find last message date
        const lastMessage = await prisma.chatMessage.findFirst({
          where: {
            instance: { userId: user.id },
          },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        });

        const daysSince = lastMessage
          ? Math.floor((Date.now() - lastMessage.createdAt.getTime()) / (24 * 60 * 60 * 1000))
          : 999; // Never used

        inactiveClients.push({
          clientName: user.name ?? user.email ?? "Client",
          daysSinceLastMessage: daysSince,
        });
      }
    }

    // Send manager alert if there are inactive clients
    if (inactiveClients.length > 0) {
      const html = buildInactivityEmail(inactiveClients);
      
      await sendEmail({
        to: manager.email,
        subject: `👋 ${inactiveClients.length} client${inactiveClients.length > 1 ? "s" : ""} inactive this week`,
        html,
      }).catch(console.error);

      alertsSent++;
    }
  }

  return NextResponse.json({ 
    ok: true, 
    managersChecked: managers.length,
    alertsSent 
  });
}

function buildInactivityEmail(
  clients: Array<{ clientName: string; daysSinceLastMessage: number }>
): string {
  const rows = clients
    .map(
      (c) => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
      <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 4px;">${c.clientName}</div>
      <div style="color: #94a3b8; font-size: 13px;">
        ${c.daysSinceLastMessage === 999 
          ? "Never used their AI instance" 
          : `Last activity: ${c.daysSinceLastMessage} days ago`}
      </div>
    </div>
  `
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
    <h1 style="color: #fbbf24; font-size: 24px; margin: 0 0 8px;">⚠️ Client Inactivity Alert</h1>
    <p style="color: #94a3b8; margin: 0 0 24px;">
      The following clients haven't had any AI conversations in the last 7 days.
      Consider reaching out to check if they need help.
    </p>
    
    ${rows}
    
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
      <a href="${process.env.NEXTAUTH_URL ?? "https://openhelixai.com"}/manager" 
         style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
        View Manager Portal →
      </a>
    </div>
    
    <p style="color: #475569; font-size: 12px; margin-top: 32px;">
      You're receiving this because you're a manager on OpenHelix AI.
    </p>
  </div>
</body>
</html>`;
}
