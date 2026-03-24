import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { verifyWebhookSignature, parseIncomingMessage } from "@/lib/whatsapp/meta";
import { callLLM } from "@/lib/llm";
import { isSandboxExhausted } from "@/lib/sandbox";

export const maxDuration = 60;

/**
 * POST /api/webhooks/whatsapp/meta
 * 
 * Receive incoming WhatsApp messages from Meta Business API
 * Verify webhook signature and forward to agent for response
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-hub-signature-256");

    // Extract phone number from the webhook payload to find the instance
    const phoneNumberId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
    
    if (!phoneNumberId) {
      console.warn("[WhatsApp Webhook] Missing phone_number_id in payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Find instance by WhatsApp phone number ID
    const instance = await prisma.aIInstance.findFirst({
      where: { 
        whatsappEnabled: true,
        whatsappPhoneNumber: { not: null },
      },
      include: { credentials: true },
    });

    if (!instance) {
      console.warn("[WhatsApp Webhook] No instance found for phone:", phoneNumberId);
      return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    }

    // Verify webhook signature
    const encryptedSecret = instance.whatsappWebhookSecret;
    if (!encryptedSecret) {
      console.warn("[WhatsApp Webhook] No webhook secret configured");
      return NextResponse.json({ error: "Not configured" }, { status: 400 });
    }

    const webhookSecret = decrypt(encryptedSecret);
    const isValid = verifyWebhookSignature({
      signature: signature || "",
      body: JSON.stringify(body),
      appSecret: webhookSecret,
    });

    if (!isValid) {
      console.warn("[WhatsApp Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Parse incoming message
    const message = parseIncomingMessage(body);
    if (!message) {
      // Not a message event (could be status update, etc.)
      return NextResponse.json({ ok: true });
    }

    // Check instance status
    if (instance.status !== "running") {
      console.log("[WhatsApp Webhook] Instance not running:", instance.id);
      return NextResponse.json({ ok: true });
    }

    // Check for LLM credentials
    const llmKeys = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
    const hasLLMCreds = instance.credentials?.some((c) => llmKeys.includes(c.key));

    // Handle sandbox exhaustion
    if (!hasLLMCreds && instance.sandboxMode && isSandboxExhausted(instance.sandboxUsed ?? 0)) {
      await sendWhatsAppResponse({
        instance,
        to: message.from,
        message: "⚠️ Free messages used up. The agent owner needs to add an API key to continue.",
      });
      return NextResponse.json({ ok: true });
    }

    // Persist user message
    await prisma.chatMessage.create({
      data: {
        instanceId: instance.id,
        role: "user",
        content: message.text,
        source: "whatsapp",
      },
    });

    // Fetch conversation history
    const history = await prisma.chatMessage.findMany({
      where: { instanceId: instance.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const contextMessages = history
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Call LLM
    const result = await callLLM(instance.id, [
      ...contextMessages,
      { role: "user", content: message.text },
    ]);

    if ("error" in result) {
      console.error("[WhatsApp Webhook] LLM error:", result.error);
      return NextResponse.json({ ok: true });
    }

    const reply = result.response;

    // Send response via WhatsApp
    await sendWhatsAppResponse({
      instance,
      to: message.from,
      message: reply,
    });

    // Persist assistant reply
    await prisma.chatMessage.create({
      data: {
        instanceId: instance.id,
        role: "assistant",
        content: reply,
        source: "whatsapp",
      },
    });

    // Increment sandbox usage
    if (instance.sandboxMode && !hasLLMCreds) {
      await prisma.aIInstance.update({
        where: { id: instance.id },
        data: { sandboxUsed: { increment: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[WhatsApp Webhook] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/webhooks/whatsapp/meta
 * 
 * Webhook verification endpoint for Meta
 * Meta sends a verification challenge during webhook setup
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode !== "subscribe" || !token || !challenge) {
    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
  }

  // Find instance by verify token
  const instances = await prisma.aIInstance.findMany({
    where: { 
      whatsappEnabled: true,
      whatsappWebhookSecret: { not: null },
    },
    select: { id: true, whatsappWebhookSecret: true },
  });

  // Check if token matches any instance
  for (const instance of instances) {
    try {
      const storedSecret = decrypt(instance.whatsappWebhookSecret!);
      if (storedSecret === token) {
        return new NextResponse(challenge, { status: 200 });
      }
    } catch {
      // Continue checking other instances
    }
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// Helper function to send WhatsApp response
async function sendWhatsAppResponse({
  instance,
  to,
  message,
}: {
  instance: { id: string; whatsappAccessToken: string | null | undefined; whatsappPhoneNumber: string | null | undefined };
  to: string;
  message: string;
}) {
  if (!instance.whatsappAccessToken || !instance.whatsappPhoneNumber) {
    throw new Error("WhatsApp not fully configured");
  }

  const accessToken = decrypt(instance.whatsappAccessToken);
  const phoneNumberId = instance.whatsappPhoneNumber; // This should be the phone number ID from Meta

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: message },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send message: ${JSON.stringify(error)}`);
  }

  return response.json();
}
