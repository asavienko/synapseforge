import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { callLLM } from "@/lib/llm";
import { isSandboxExhausted } from "@/lib/sandbox";

export const maxDuration = 60;

const TWIML_OK = new Response("<Response></Response>", {
  status: 200,
  headers: { "Content-Type": "text/xml" },
});

async function sendWhatsAppMessage(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
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

/**
 * Verify Twilio webhook signature using the auth token.
 */
function verifyTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signatureHeader: string
): boolean {
  try {
    const crypto = require("crypto");
    const expected = crypto.createHmac("sha1", authToken);
    expected.update(url);
    const sortedKeys = Object.keys(params).sort();
    for (const key of sortedKeys) {
      expected.update(key);
      expected.update(params[key]);
    }
    const computed = "sha1=" + expected.digest("hex");
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
  } catch (err) {
    console.error("[Twilio] Signature verification error:", err);
    return false;
  }
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

  const signature = req.headers.get("x-twilio-signature");
  if (!signature) {
    console.warn("[WhatsApp webhook] Missing X-Twilio-Signature");
    // For safety, reject during development if signature missing
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Missing signature" }, { status: 403 });
    }
  }

  const to = (body["To"] as string | undefined) || "";
  const from = (body["From"] as string | undefined) || "";
  const numMedia = parseInt(body["NumMedia"] || "0");
  const mediaContentType0 = body["MediaContentType0"] as string | undefined;
  const mediaUrl0 = body["MediaUrl0"] as string | undefined;
  let messageText = (body["Body"] as string | undefined) || "";

  if (!to || !from) return TWIML_OK;

  const toNumber = to.replace(/^whatsapp:/, "");

  // Find instance by Twilio WhatsApp number
  const allWhatsappCreds = await prisma.instanceCredential.findMany({
    where: { key: "twilio_whatsapp_number" },
    select: { instanceId: true, value: true },
  });

  let instanceId: string | null = null;
  let instanceAuthToken: string | null = null;

  for (const row of allWhatsappCreds) {
    try {
      const decrypted = decrypt(row.value);
      if (decrypted.replace(/\s/g, "") === toNumber.replace(/\s/g, "")) {
        instanceId = row.instanceId;
        // Fetch the instance to get its Twilio auth token for signature verification
        const instance = await prisma.aIInstance.findFirst({
          where: { id: row.instanceId },
          include: { credentials: true },
        });
        if (instance) {
          const authCred = instance.credentials.find(c => c.key === "twilio_auth_token");
          if (authCred) {
            instanceAuthToken = decrypt(authCred.value);
          }
        }
        break;
      }
    } catch { /* skip */ }
  }

  if (!instanceId || !instanceAuthToken) return TWIML_OK;

  // Verify Twilio signature before processing
  const url = req.url;
  if (signature && !verifyTwilioSignature(instanceAuthToken, url, body, signature)) {
    console.warn("[WhatsApp webhook] Invalid Twilio signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    include: { credentials: true },
  });

  if (!instance || instance.status !== "running") return TWIML_OK;

  // Transcribe voice note if present
  if (numMedia > 0 && mediaUrl0 && mediaContentType0 &&
      (mediaContentType0.startsWith("audio/") || mediaContentType0 === "video/ogg")) {
    const sidRow = instance.credentials.find(c => c.key === "twilio_account_sid");
    const authRow = instance.credentials.find(c => c.key === "twilio_auth_token");
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

  // Check sandbox / credentials
  const llmKeys = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
  const hasLLMCreds = instance.credentials.some(c => llmKeys.includes(c.key));

  if (!hasLLMCreds) {
    if (instance.sandboxMode && isSandboxExhausted(instance.sandboxUsed ?? 0)) {
      const sidRow = instance.credentials.find(c => c.key === "twilio_account_sid");
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

  // Persist user message
  await prisma.chatMessage.create({
    data: { instanceId, role: "user", content: messageText, source: "whatsapp" },
  });

  // Fetch recent conversation history
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

  // Call LLM
  const result = await callLLM(instanceId, [
    ...contextMessages,
    { role: "user", content: messageText },
  ]);

  if ("error" in result) {
    console.error("[whatsapp-webhook] LLM error:", result.error);
    return TWIML_OK;
  }

  const reply = result.response;

  // Send reply via Twilio
  const sidRow = instance.credentials.find(c => c.key === "twilio_account_sid");
  const authRow = instance.credentials.find(c => c.key === "twilio_auth_token");

  if (sidRow && authRow) {
    await sendWhatsAppMessage(
      decrypt(sidRow.value),
      decrypt(authRow.value),
      to, from, reply
    ).catch(err => console.error("[whatsapp-webhook] Twilio send error:", err));
  }

  // Persist assistant reply
  await prisma.chatMessage.create({
    data: { instanceId, role: "assistant", content: reply, source: "whatsapp" },
  });

  // Increment sandbox usage
  if (instance.sandboxMode && !hasLLMCreds) {
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { sandboxUsed: { increment: 1 } },
    }).catch(() => {});
  }

  return TWIML_OK;
}

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
