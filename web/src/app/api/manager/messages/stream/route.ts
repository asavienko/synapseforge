import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * SSE endpoint for managers to receive real-time message updates
 * from their assigned clients.
 * 
 * Query params:
 * - userId: The client user ID to listen for messages from
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");
  
  if (!targetUserId) {
    return new Response("userId required", { status: 400 });
  }

  // Verify manager has access to this user
  const manager = await prisma.manager.findFirst({
    where: { 
      email: session.user.email,
      users: { some: { id: targetUserId } }
    },
    select: { id: true },
  });
  
  if (!manager) {
    return new Response("Not authorized for this user", { status: 403 });
  }

  let lastMessageId: string | null = null;

  // Get the most recent message ID to start from
  const latest = await prisma.message.findFirst({
    where: { userId: targetUserId },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (latest) lastMessageId = latest.id;

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`event: connected\ndata: {"ok":true}\n\n`));

      const poll = async () => {
        if (closed) return;
        try {
          // Find new messages since lastMessageId
          const where = lastMessageId
            ? {
                userId: targetUserId,
                createdAt: {
                  gt:
                    (
                      await prisma.message.findUnique({
                        where: { id: lastMessageId },
                        select: { createdAt: true },
                      })
                    )?.createdAt ?? new Date(0),
                },
              }
            : { userId: targetUserId };

          const newMessages = await prisma.message.findMany({
            where,
            orderBy: { createdAt: "asc" },
          });

          for (const msg of newMessages) {
            controller.enqueue(
              encoder.encode(
                `event: message\ndata: ${JSON.stringify({
                  id: msg.id,
                  body: msg.body,
                  senderType: msg.senderType,
                  read: msg.read,
                  createdAt: msg.createdAt.toISOString(),
                })}\n\n`
              )
            );
            lastMessageId = msg.id;
          }
        } catch (e) {
          console.error("[SSE manager messages] poll error:", e);
        }

        if (!closed) {
          setTimeout(poll, 2000); // Poll DB every 2 seconds
        }
      };

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        closed = true;
      });

      // Start polling after a brief delay
      setTimeout(poll, 500);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
