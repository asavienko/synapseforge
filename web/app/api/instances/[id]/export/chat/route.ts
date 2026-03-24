import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/instances/[id]/export/chat
 * 
 * Export chat history as JSON or CSV
 * Query params:
 * - format: "json" | "csv" (default: json)
 * - since: ISO date (optional)
 * - until: ISO date (optional)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const instance = await prisma.aIInstance.findFirst({
    where: {
      id,
      user: { email: session.user.email },
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";
  const since = searchParams.get("since");
  const until = searchParams.get("until");

  // Build date filter
  const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (since || until) {
    dateFilter.createdAt = {};
    if (since) dateFilter.createdAt.gte = new Date(since);
    if (until) dateFilter.createdAt.lte = new Date(until);
  }

  // Fetch messages
  const messages = await prisma.chatMessage.findMany({
    where: {
      instanceId: id,
      ...dateFilter,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
      intent: true,
      wasAnswered: true,
    },
  });

  if (format === "csv") {
    // CSV export
    const headers = ["timestamp", "role", "content", "intent", "was_answered"];
    const rows = messages.map((m) => [
      m.createdAt.toISOString(),
      m.role,
      `"${m.content.replace(/"/g, '""')}"`, // Escape quotes
      m.intent ?? "",
      m.wasAnswered ? "yes" : "no",
    ]);
    
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="chat-export-${id}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  // JSON export
  const exportData = {
    instance: {
      id: instance.id,
      name: instance.name,
      exportedAt: new Date().toISOString(),
    },
    messages: messages.map((m) => ({
      id: m.id,
      timestamp: m.createdAt.toISOString(),
      role: m.role,
      content: m.content,
      intent: m.intent,
      wasAnswered: m.wasAnswered,
    })),
    summary: {
      totalMessages: messages.length,
      userMessages: messages.filter((m) => m.role === "user").length,
      assistantMessages: messages.filter((m) => m.role === "assistant").length,
      dateRange: {
        from: messages[0]?.createdAt.toISOString(),
        to: messages[messages.length - 1]?.createdAt.toISOString(),
      },
    },
  };

  return NextResponse.json(exportData);
}
