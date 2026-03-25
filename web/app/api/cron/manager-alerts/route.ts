import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron job: Daily manager intelligence alerts
 * 
 * Runs daily to notify managers about:
 * 1. Unanswered questions from their clients (knowledge gaps)
 * 2. Complaint sentiment detected
 * 3. High-value intents (booking, pricing) not converted
 * 
 * Vercel Cron: 0 9 * * * (daily at 9 AM)
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

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Get all managers with their clients
  const managers = await prisma.manager.findMany({
    include: {
      users: {
        include: {
          instances: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  let alertsSent = 0;

  for (const manager of managers) {
    if (!manager.email) continue;

    const alerts: Array<{
      type: "unanswered" | "complaint" | "booking_intent" | "pricing_intent";
      clientName: string;
      instanceName: string;
      details: string;
      count: number;
    }> = [];

    for (const user of manager.users) {
      const clientName = user.name ?? user.email ?? "Client";
      
      for (const instance of user.instances) {
        // 1. Find unanswered questions from last 24h
        const unanswered = await prisma.chatMessage.findMany({
          where: {
            instanceId: instance.id,
            wasAnswered: false,
            createdAt: { gte: yesterday },
            role: "assistant",
          },
          include: {
            instance: {
              select: {
                _count: {
                  select: { chatMessages: true },
                },
              },
            },
          },
          take: 5,
        });

        if (unanswered.length > 0) {
          // Get the user questions that triggered these unanswered responses
          const userQuestions = await prisma.chatMessage.findMany({
            where: {
              instanceId: instance.id,
              role: "user",
              createdAt: { gte: yesterday },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          });

          // Match user questions to unanswered responses
          const questionMap = new Map();
          for (let i = 0; i < userQuestions.length; i++) {
            questionMap.set(i, userQuestions[i].content);
          }

          alerts.push({
            type: "unanswered",
            clientName,
            instanceName: instance.name,
            details: unanswered.length === 1 
              ? `"${unanswered[0].content.slice(0, 80)}..."`
              : `${unanswered.length} unanswered questions`,
            count: unanswered.length,
          });
        }

        // 2. Find complaints from last 24h
        const complaints = await prisma.chatMessage.count({
          where: {
            instanceId: instance.id,
            intent: "complaint",
            createdAt: { gte: yesterday },
            role: "user",
          },
        });

        if (complaints > 0) {
          alerts.push({
            type: "complaint",
            clientName,
            instanceName: instance.name,
            details: `${complaints} complaint${complaints > 1 ? "s" : ""} detected`,
            count: complaints,
          });
        }

        // 3. Find booking intents from last 24h
        const bookingIntents = await prisma.chatMessage.count({
          where: {
            instanceId: instance.id,
            intent: "booking",
            createdAt: { gte: yesterday },
            role: "user",
          },
        });

        if (bookingIntents > 0) {
          alerts.push({
            type: "booking_intent",
            clientName,
            instanceName: instance.name,
            details: `${bookingIntents} booking inquiry${bookingIntents > 1 ? "ies" : "y"}`,
            count: bookingIntents,
          });
        }

        // 4. Find pricing intents from last 24h
        const pricingIntents = await prisma.chatMessage.count({
          where: {
            instanceId: instance.id,
            intent: "pricing",
            createdAt: { gte: yesterday },
            role: "user",
          },
        });

        if (pricingIntents > 0) {
          alerts.push({
            type: "pricing_intent",
            clientName,
            instanceName: instance.name,
            details: `${pricingIntents} pricing question${pricingIntents > 1 ? "s" : ""}`,
            count: pricingIntents,
          });
        }
      }
    }

    // Send email if there are alerts
    if (alerts.length > 0) {
      const html = buildManagerAlertEmail(alerts);
      
      await sendEmail({
        to: manager.email,
        subject: `🎯 ${alerts.length} insight${alerts.length > 1 ? "s" : ""} from your clients' AI conversations`,
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

function buildManagerAlertEmail(
  alerts: Array<{
    type: "unanswered" | "complaint" | "booking_intent" | "pricing_intent";
    clientName: string;
    instanceName: string;
    details: string;
    count: number;
  }>
): string {
  const typeIcons: Record<string, string> = {
    unanswered: "❓",
    complaint: "⚠️",
    booking_intent: "📅",
    pricing_intent: "💰",
  };

  const typeLabels: Record<string, string> = {
    unanswered: "Knowledge Gap",
    complaint: "Complaint Detected",
    booking_intent: "Booking Intent",
    pricing_intent: "Pricing Question",
  };

  const typeColors: Record<string, string> = {
    unanswered: "#a78bfa", // violet
    complaint: "#f87171", // red
    booking_intent: "#34d399", // emerald
    pricing_intent: "#fbbf24", // amber
  };

  const alertsHtml = alerts
    .map(
      (alert) => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid ${typeColors[alert.type]};">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">${typeIcons[alert.type]}</span>
        <span style="color: ${typeColors[alert.type]}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${typeLabels[alert.type]}</span>
      </div>
      <div style="color: #e2e8f0; font-weight: 500; margin-bottom: 4px;">${alert.clientName} — ${alert.instanceName}</div>
      <div style="color: #94a3b8; font-size: 14px;">${alert.details}</div>
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
    <h1 style="color: #a78bfa; font-size: 24px; margin: 0 0 8px;">Daily Intelligence Report</h1>
    <p style="color: #94a3b8; margin: 0 0 24px;">Here's what happened with your clients' AI agents in the last 24 hours.</p>
    
    ${alertsHtml}
    
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
      <a href="${process.env.NEXTAUTH_URL ?? "https://openhelixai.com"}/manager" 
         style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
        View Manager Portal →
      </a>
    </div>
    
    <p style="color: #475569; font-size: 12px; margin-top: 32px;">
      You're receiving this because you're a manager on OpenHelix AI. 
      <a href="${process.env.NEXTAUTH_URL ?? "https://openhelixai.com"}/dashboard/settings" style="color: #7c3aed;">Manage email preferences</a>
    </p>
  </div>
</body>
</html>`;
}
