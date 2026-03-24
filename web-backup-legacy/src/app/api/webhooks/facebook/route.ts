import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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
 * Receive Facebook Page Messenger events with signature verification.
 */
export async function POST(req: NextRequest) {
  // Get Facebook signature from header (X-Hub-Signature-256)
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 403 });
  }

  // Read raw body for signature verification
  const rawBody = await req.text();

  // Compute expected signature using app secret
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) {
    console.error("[Facebook webhook] Missing FACEBOOK_APP_SECRET");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const expectedSignature = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.warn("[Facebook webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  // Parse JSON after verification
  const body = JSON.parse(rawBody);

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

        // Route to instance chat
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
