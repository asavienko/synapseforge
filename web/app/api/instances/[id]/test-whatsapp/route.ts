import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json() as { to?: string };
  const { to } = body;
  if (!to) return NextResponse.json({ error: "to is required" }, { status: 400 });

  // Load stored Twilio credentials
  const creds = await prisma.instanceCredential.findMany({
    where: {
      instanceId: id,
      key: { in: ["twilio_account_sid", "twilio_auth_token", "twilio_whatsapp_number"] },
    },
  });

  const get = (key: string) => {
    const c = creds.find((c) => c.key === key);
    return c ? decrypt(c.value) : null;
  };

  const accountSid = get("twilio_account_sid");
  const authToken = get("twilio_auth_token");
  const whatsappNumber = get("twilio_whatsapp_number");

  if (!accountSid || !authToken || !whatsappNumber) {
    return NextResponse.json({ error: "WhatsApp credentials not configured" }, { status: 400 });
  }

  // Send test message via Twilio
  const fromNumber = whatsappNumber.startsWith("whatsapp:")
    ? whatsappNumber
    : `whatsapp:${whatsappNumber}`;
  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const formData = new URLSearchParams({
    From: fromNumber,
    To: toNumber,
    Body: "👋 Test message from your OpenHelix AI AI agent. Your WhatsApp channel is configured and working!",
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );
    const data = await res.json() as { sid?: string; status?: string; error_message?: string; message?: string };
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error_message ?? data.message ?? "Twilio error" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, sid: data.sid, status: data.status });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
