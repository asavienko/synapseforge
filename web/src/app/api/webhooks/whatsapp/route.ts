import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

/**
 * POST /api/webhooks/whatsapp
 * Receives Twilio WhatsApp webhook events.
 * Supports text messages and voice note transcription via Whisper.
 *
 * Configure this URL in Twilio: https://yourdomain.com/api/webhooks/whatsapp
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const body: Record<string, string> = {};

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    params.forEach((value, key) => {
      body[key] = value;
    });
  } else {
    const json = await req.json();
    Object.assign(body, json);
  }

  // Extract relevant fields from Twilio webhook
  const to = (body["To"] as string | undefined) || "";
  const from = (body["From"] as string | undefined) || "";
  const numMedia = parseInt(body["NumMedia"] || "0");
  const mediaContentType0 = body["MediaContentType0"] as string | undefined;
  const mediaUrl0 = body["MediaUrl0"] as string | undefined;
  let messageText = (body["Body"] as string | undefined) || "";

  if (!to || !from) {
    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Normalise the destination number: strip "whatsapp:" prefix
  const toNumber = to.replace(/^whatsapp:/, "");

  // Find the matching instance by scanning twilio_whatsapp_number credentials
  // (values are encrypted, so we must decrypt each row to compare)
  const allWhatsappCreds = await prisma.instanceCredential.findMany({
    where: { key: "twilio_whatsapp_number" },
    select: { instanceId: true, value: true },
  });

  let instanceId: string | null = null;
  for (const row of allWhatsappCreds) {
    try {
      const decrypted = decrypt(row.value);
      if (decrypted === toNumber || decrypted.replace(/\s/g, "") === toNumber.replace(/\s/g, "")) {
        instanceId = row.instanceId;
        break;
      }
    } catch {
      // skip rows that can't be decrypted
    }
  }

  if (!instanceId) {
    // No instance configured for this number
    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Handle voice note — transcribe via Whisper
  if (
    numMedia > 0 &&
    mediaUrl0 &&
    mediaContentType0 &&
    (mediaContentType0.startsWith("audio/") || mediaContentType0 === "video/ogg")
  ) {
    const [sidRow, authRow, openaiRow] = await Promise.all([
      prisma.instanceCredential.findFirst({ where: { instanceId, key: "twilio_account_sid" } }),
      prisma.instanceCredential.findFirst({ where: { instanceId, key: "twilio_auth_token" } }),
      prisma.instanceCredential.findFirst({ where: { instanceId, key: "openai_api_key" } }),
    ]);

    if (sidRow && authRow && openaiRow) {
      try {
        const transcribed = await transcribeAudio(
          mediaUrl0,
          decrypt(sidRow.value),
          decrypt(authRow.value),
          decrypt(openaiRow.value)
        );
        if (transcribed) {
          messageText = transcribed;
        }
      } catch (err) {
        console.error("[whatsapp-webhook] Whisper transcription error:", err);
        if (!messageText) messageText = "[Voice message — transcription failed]";
      }
    }
  }

  if (!messageText) {
    return new Response("<Response></Response>", {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Route to instance chat — fire and forget
  fetch(`${process.env.NEXTAUTH_URL}/api/instances/${instanceId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal": "whatsapp-webhook",
    },
    body: JSON.stringify({
      message: messageText,
      sessionId: `wa_${from.replace(/^whatsapp:/, "").replace(/\+/, "")}`,
    }),
  }).catch(console.error);

  // Return empty TwiML response (Twilio requires a valid XML reply)
  return new Response("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

async function transcribeAudio(
  audioUrl: string,
  twilioSid: string,
  twilioAuth: string,
  openaiApiKey: string
): Promise<string> {
  // 1. Download the audio from Twilio media URL
  const audioRes = await fetch(audioUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64")}`,
    },
  });

  if (!audioRes.ok) {
    throw new Error(`Failed to download audio: ${audioRes.status}`);
  }

  const audioBuffer = await audioRes.arrayBuffer();

  // 2. Send to Whisper
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([audioBuffer], { type: "audio/ogg" }),
    "voice.ogg"
  );
  formData.append("model", "whisper-1");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiApiKey}` },
    body: formData,
  });

  const result = await whisperRes.json();
  return result.text || "";
}
