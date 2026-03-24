import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/manager/insights
 * 
 * Returns conversation intelligence insights for a manager's clients:
 * - Unanswered questions (knowledge gaps)
 * - Complaint sentiment
 * - High-value intents (booking, pricing)
 * 
 * Query params:
 * - since: ISO date string (default: 24h ago)
 * - clientId: optional filter by specific client
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify manager
  const manager = await prisma.manager.findUnique({
    where: { email: session.user.email },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
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

  if (!manager) {
    return NextResponse.json({ error: "Not a manager" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get("since");
  const clientIdFilter = searchParams.get("clientId");

  const since = sinceParam 
    ? new Date(sinceParam) 
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Filter users if clientId specified
  const users = clientIdFilter
    ? manager.users.filter((u) => u.id === clientIdFilter)
    : manager.users;

  const insights: Array<{
    id: string;
    type: "unanswered" | "complaint" | "booking" | "pricing" | "faq" | "other";
    severity: "high" | "medium" | "low";
    clientId: string;
    clientName: string;
    instanceId: string;
    instanceName: string;
    message: string;
    suggestedAction: string;
    createdAt: string;
  }> = [];

  for (const user of users) {
    const clientName = user.name ?? user.email ?? "Unknown";

    for (const instance of user.instances) {
      // 1. Unanswered questions (high priority)
      const unanswered = await prisma.chatMessage.findMany({
        where: {
          instanceId: instance.id,
          wasAnswered: false,
          createdAt: { gte: since },
          role: "assistant",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Get user questions for context
      const recentMessages = await prisma.chatMessage.findMany({
        where: {
          instanceId: instance.id,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      for (const msg of unanswered) {
        // Find the preceding user message
        const msgIndex = recentMessages.findIndex((m) => m.id === msg.id);
        const userMessage = msgIndex > 0 ? recentMessages[msgIndex - 1] : null;

        insights.push({
          id: `unanswered-${msg.id}`,
          type: "unanswered",
          severity: "high",
          clientId: user.id,
          clientName,
          instanceId: instance.id,
          instanceName: instance.name,
          message: userMessage?.content ?? msg.content,
          suggestedAction: "Add answer to knowledge base",
          createdAt: msg.createdAt.toISOString(),
        });
      }

      // 2. Complaints (high priority)
      const complaints = await prisma.chatMessage.findMany({
        where: {
          instanceId: instance.id,
          intent: "complaint",
          createdAt: { gte: since },
          role: "user",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      for (const msg of complaints) {
        insights.push({
          id: `complaint-${msg.id}`,
          type: "complaint",
          severity: "high",
          clientId: user.id,
          clientName,
          instanceId: instance.id,
          instanceName: instance.name,
          message: msg.content.slice(0, 200),
          suggestedAction: "Review and follow up with client",
          createdAt: msg.createdAt.toISOString(),
        });
      }

      // 3. Booking intents (medium priority)
      const bookings = await prisma.chatMessage.findMany({
        where: {
          instanceId: instance.id,
          intent: "booking",
          createdAt: { gte: since },
          role: "user",
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      for (const msg of bookings) {
        insights.push({
          id: `booking-${msg.id}`,
          type: "booking",
          severity: "medium",
          clientId: user.id,
          clientName,
          instanceId: instance.id,
          instanceName: instance.name,
          message: msg.content.slice(0, 200),
          suggestedAction: "Verify booking flow is working",
          createdAt: msg.createdAt.toISOString(),
        });
      }

      // 4. Pricing intents (medium priority)
      const pricing = await prisma.chatMessage.findMany({
        where: {
          instanceId: instance.id,
          intent: "pricing",
          createdAt: { gte: since },
          role: "user",
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      for (const msg of pricing) {
        insights.push({
          id: `pricing-${msg.id}`,
          type: "pricing",
          severity: "medium",
          clientId: user.id,
          clientName,
          instanceId: instance.id,
          instanceName: instance.name,
          message: msg.content.slice(0, 200),
          suggestedAction: "Review pricing responses for accuracy",
          createdAt: msg.createdAt.toISOString(),
        });
      }
    }
  }

  // Sort by severity (high first) then by date
  insights.sort((a, b) => {
    if (a.severity === "high" && b.severity !== "high") return -1;
    if (a.severity !== "high" && b.severity === "high") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json({
    insights,
    summary: {
      total: insights.length,
      highPriority: insights.filter((i) => i.severity === "high").length,
      mediumPriority: insights.filter((i) => i.severity === "medium").length,
      unanswered: insights.filter((i) => i.type === "unanswered").length,
      complaints: insights.filter((i) => i.type === "complaint").length,
      bookings: insights.filter((i) => i.type === "booking").length,
      pricing: insights.filter((i) => i.type === "pricing").length,
    },
  });
}
