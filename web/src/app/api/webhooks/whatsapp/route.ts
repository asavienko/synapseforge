import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { callLLM } from "@/lib/llm";
import { isSandboxExhausted } from "@/lib/sandbox";

/**
 * POST /api/webhooks/whatsapp
 * Receives Twilio WhatsApp webhook events.
 * Supports text messages and voice note transcription via Whisper.
 *
 * Configure this URL in Twilio: https://yourdomain.com/api/webhooks/whatsapp
 *
 * FIXED: previously fired-and-forgot to the streaming chat API (which never
 * sent a reply back to the user). Now calls callLLM() directly and uses
 * the Twilio Messages API to send the response.
 */

// LLM calls can take 30–60s
export const maxDuration = 60;

const TWIML_OK = new Response("<Response></Response>", {
  status: 200,
  headers: { "Content-Type": "text/xml" },
});

// ── Send a WhatsApp message via Twilio Messages API ───────────────────────

async function sendWhatsAppMessage(
  accountSid: string,
  authToken: string,
  from: string, // whatsapp:+14155238886
  to: string,   // whatsapp:+1234567890
  body: string
): Promise<void> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({ From: from, To: to, Body: body });

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    signal: AbortSignal.timeout(10000),
  });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const body: Record<string, string> = {};

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    new URLSearchParams(text).forEach((value, key) => { body[key] = value; });
  } else {
    Object.assign(body, await req.json());
  }

  const to   = (body["To"]   as string | undefined) || "";
  const from = (body["From"] as string | undefined) || "";
  const numMedia          = parseInt(body["NumMedia"]          || "0");
  const mediaContentType0 = body["MediaContentType0"] as string | undefined;
  const mediaUrl0         = body["MediaUrl0"]         as string | undefined;
  let   messageText       = (body["Body"] as string | undefined) || "";

  if (!to || !from) return TWIML_OK;

  const toNumber = to.replace(/^whatsapp:/, "");

  // ── Find instance by Twilio WhatsApp number ──────────────────────────────
  const allWhatsappCreds = await prisma.instanceCredential.findMany({
    where: { key: "twilio_whatsapp_number" },
    select: { instanceId: true, value: true },
  });

  let instanceId: string | null = null;
  for (const row of allWhatsappCreds) {
    try {
      const decrypted = decrypt(row.value);
      if (decrypted.replace(/\s/g, "") === toNumber.replace(/\s/g, "")) {
        instanceId = row.instanceId;
        break;
      }
    } catch { /* skip undecryptable rows */ }
  }

  if (!instanceId) return TWIML_OK;

  // ── Load instance + credentials ──────────────────────────────────────────
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    include: { credentials: true },
  });

  if (!instance || instance.status !== "running") return TWIML_OK;

  // ── Transcribe voice note if present ─────────────────────────────────────
  if (numMedia > 0 && mediaUrl0 && mediaContentType0 &&
      (mediaContentType0.startsWith("audio/") || mediaContentType0 === "video/ogg")) {
    const sidRow    = instance.credentials.find(c => c.key === "twilio_account_sid");
    const authRow   = instance.credentials.find(c => c.key === "twilio_auth_token");
    const openaiRow = instance.credentials.find(c => c.key === "openai_api_key");

    if (sidRow && authRow && openaiRow) {
      try {
        const transcribed = await transcribeAudio(
          mediaUrl0,
          decrypt(sidRow.value),
          decrypt(authRow.value),
          decrypt(openaiRow.value)
        );
        if (transcribed) messageText = transcribed;
      } catch (err) {
        console.error("[whatsapp-webhook] Whisper error:", err);
        if (!messageText) messageText = "[Voice message — transcription failed]";
      }
    }
  }

  if (!messageText) return TWIML_OK;

  // ── Check sandbox / credentials ──────────────────────────────────────────
  const llmKeys = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
  const hasLLMCreds = instance.credentials.some(c => llmKeys.includes(c.key));

  if (!hasLLMCreds) {
    if (instance.sandboxMode && isSandboxExhausted(instance.sandboxUsed ?? 0)) {
      // Send exhausted message via Twilio
      const sidRow  = instance.credentials.find(c => c.key === "twilio_account_sid");
      const authRow = instance.credentials.find(c => c.key === "twilio_auth_token");
      if (sidRow && authRow) {
        await sendWhatsAppMessage(
          decrypt(sidRow.value),
          decrypt(authRow.value),
          to, from,
          "⚠️ Free messages used up. The agent owner needs to add an API key to continue."
        ).catch(() => {});
      }
      return TWIML_OK;
    }
    if (!instance.sandboxMode) return TWIML_OK;
  }

  // ── Persist user message ──────────────────────────────────────────────────
  await prisma.chatMessage.create({
    data: { instanceId, role: "user", content: messageText, source: "whatsapp" },
  });

  // ── Fetch recent conversation history ─────────────────────────────────────
  const history = await prisma.chatMessage.findMany({
    where: { instanceId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const contextMessages = history
    .reverse()
    .slice(0, -1)
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  // ── Call LLM ──────────────────────────────────────────────────────────────
  const result = await callLLM(instanceId, [
    ...contextMessages,
    { role: "user", content: messageText },
  ]);

  if ("error" in result) {
    console.error("[whatsapp-webhook] LLM error:", result.error);
    return TWIML_OK;
  }

  const reply = result.response;

  // ── Send reply via Twilio Messages API ───────────────────────────────────
  const sidRow  = instance.credentials.find(c => c.key === "twilio_account_sid");
  const authRow = instance.credentials.find(c => c.key === "twilio_auth_token");

  if (sidRow && authRow) {
    await sendWhatsAppMessage(
      decrypt(sidRow.value),
      decrypt(authRow.value),
      to, from, reply
    ).catch(err => console.error("[whatsapp-webhook] Twilio send error:", err));
  }

  // ── Persist assistant reply ───────────────────────────────────────────────
  await prisma.chatMessage.create({
    data: { instanceId, role: "assistant", content: reply, source: "whatsapp" },
  });

  // ── Increment sandbox usage ───────────────────────────────────────────────
  if (instance.sandboxMode && !hasLLMCreds) {
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { sandboxUsed: { increment: 1 } },
    }).catch(() => {});
  }

  return TWIML_OK;
}

// ── Whisper audio transcription ───────────────────────────────────────────

async function transcribeAudio(
  audioUrl: string,
  twilioSid: string,
  twilioAuth: string,
  openaiApiKey: string
): Promise<string> {
  const audioRes = await fetch(audioUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64")}`,
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!audioRes.ok) throw new Error(`Failed to download audio: ${audioRes.status}`);

  const audioBuffer = await audioRes.arrayBuffer();
  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: "audio/ogg" }), "voice.ogg");
  formData.append("model", "whisper-1");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiApiKey}` },
    body: formData,
    signal: AbortSignal.timeout(30000),
  });

  const res = await whisperRes.json() as { text?: string };
  return res.text || "";
}
