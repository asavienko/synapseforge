import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/webhooks/facebook
 * Facebook webhook verification (hub challenge).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/**
 * POST /api/webhooks/facebook
 * Receive Facebook Page Messenger events and route them to the matching instance chat.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.object === "page") {
    for (const entry of body.entry || []) {
      for (const messaging of entry.messaging || []) {
        // Find the instance whose facebook_page_id matches this page entry
        const cred = await prisma.instanceCredential.findFirst({
          where: { key: "facebook_page_id", value: entry.id },
          include: { instance: true },
        });
        if (!cred) continue;

        const senderId = messaging.sender?.id as string | undefined;
        const messageText = messaging.message?.text as string | undefined;
        if (!messageText || !senderId) continue;

        // Route to instance chat — fire and forget
        fetch(
          `${process.env.NEXTAUTH_URL}/api/instances/${cred.instanceId}/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal": "facebook-webhook",
            },
            body: JSON.stringify({
              message: messageText,
              sessionId: `fb_${senderId}`,
            }),
          }
        ).catch(console.error);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
