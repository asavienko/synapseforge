import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { sendMessage, getPhoneNumberId } from "@/lib/whatsapp/meta";

/**
 * POST /api/instances/[id]/whatsapp/test
 * 
 * Send a test WhatsApp message via Meta Business API
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  // Verify instance ownership
  // Using any type since Prisma client hasn't been regenerated with new fields yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: any = await (prisma as any).aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      whatsappEnabled: true,
      whatsappAccessToken: true,
      whatsappAccountId: true,
      whatsappPhoneNumber: true,
    },
  });
  
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!instance.whatsappEnabled || !instance.whatsappAccessToken) {
    return NextResponse.json(
      { error: "WhatsApp not configured" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { to } = body;

  if (!to) {
    return NextResponse.json({ error: "Recipient phone number is required" }, { status: 400 });
  }

  // Validate phone number format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(to.replace(/\s/g, ""))) {
    return NextResponse.json(
      { error: "Invalid phone number format. Use E.164 format (e.g., +1234567890)" },
      { status: 400 }
    );
  }

  try {
    const accessToken = decrypt(instance.whatsappAccessToken);
    
    // Get phone number ID from Meta
    const phoneNumberId = await getPhoneNumberId({
      accessToken,
      accountId: instance.whatsappAccountId!,
      phoneNumber: instance.whatsappPhoneNumber!,
    });

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: "Phone number not found in Meta Business account" },
        { status: 400 }
      );
    }

    // Send test message
    const result = await sendMessage({
      accessToken,
      phoneNumberId,
      to: to.replace(/\s/g, ""),
      message: "👋 Test message from your SynapseForge AI agent. Your WhatsApp Business API integration is working!",
    });

    return NextResponse.json({
      ok: true,
      messageId: result.messageId,
      status: "sent",
    });
  } catch (err) {
    console.error("[WhatsApp Test] Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to send test message";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
