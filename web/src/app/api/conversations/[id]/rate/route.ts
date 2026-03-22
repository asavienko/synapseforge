import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/conversations/[id]/rate
 * 
 * Submit a satisfaction rating for a conversation.
 * Called from the widget/chat UI after a conversation ends.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { rating, comment } = body; // rating: 1 (thumbs up) or -1 (thumbs down)

  if (!rating || (rating !== 1 && rating !== -1)) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  try {
    // Find the instance this conversation belongs to
    const conversation = await prisma.chatMessage.findFirst({
      where: { id },
      select: { instanceId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Create or update rating
    const ratingRecord = await prisma.conversationRating.upsert({
      where: { conversationId: id },
      update: { rating, comment: comment ?? null },
      create: {
        conversationId: id,
        instanceId: conversation.instanceId,
        rating,
        comment: comment ?? null,
      },
    });

    return NextResponse.json({ ok: true, rating: ratingRecord });
  } catch (error) {
    console.error("[conversation-rating] Error:", error);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}
