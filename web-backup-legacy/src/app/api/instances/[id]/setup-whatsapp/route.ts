import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { accountSid, authToken, whatsappNumber } = body;

  if (!accountSid || !authToken || !whatsappNumber) {
    return NextResponse.json({ error: "accountSid, authToken, and whatsappNumber are required" }, { status: 400 });
  }

  // Validate Twilio credentials by calling their API
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Invalid Twilio credentials" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Could not validate Twilio credentials" }, { status: 400 });
  }

  // Store credentials
  await prisma.instanceCredential.upsert({
    where: { instanceId_key: { instanceId: id, key: "twilio_account_sid" } },
    update: { value: encrypt(accountSid) },
    create: { instanceId: id, key: "twilio_account_sid", value: encrypt(accountSid) },
  });
  await prisma.instanceCredential.upsert({
    where: { instanceId_key: { instanceId: id, key: "twilio_auth_token" } },
    update: { value: encrypt(authToken) },
    create: { instanceId: id, key: "twilio_auth_token", value: encrypt(authToken) },
  });
  await prisma.instanceCredential.upsert({
    where: { instanceId_key: { instanceId: id, key: "twilio_whatsapp_number" } },
    update: { value: encrypt(whatsappNumber) },
    create: { instanceId: id, key: "twilio_whatsapp_number", value: encrypt(whatsappNumber) },
  });

  // Mark instance config as out of sync (needs VPS push)
  await prisma.aIInstance.update({
    where: { id },
    data: { configSynced: false },
  });

  return NextResponse.json({ ok: true, channel: "whatsapp", number: whatsappNumber });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.instanceCredential.deleteMany({
    where: {
      instanceId: id,
      key: { in: ["twilio_account_sid", "twilio_auth_token", "twilio_whatsapp_number"] },
    },
  });

  await prisma.aIInstance.update({ where: { id }, data: { configSynced: false } });

  return NextResponse.json({ ok: true });
}
