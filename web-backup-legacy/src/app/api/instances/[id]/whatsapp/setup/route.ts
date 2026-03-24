import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMetaAuthUrl } from "@/lib/whatsapp/meta";

/**
 * POST /api/instances/[id]/whatsapp/setup
 * 
 * Step 1: Initiate Meta OAuth flow
 * Accepts phone number and business name, returns OAuth URL for user to complete authorization
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  // Verify instance ownership
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, whatsappEnabled: true },
  });
  
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { phoneNumber, businessName } = body;

  // Validate required fields
  if (!phoneNumber || !businessName) {
    return NextResponse.json(
      { error: "Phone number and business name are required" },
      { status: 400 }
    );
  }

  // Validate phone number format (E.164)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    return NextResponse.json(
      { error: "Invalid phone number format. Use E.164 format (e.g., +1234567890)" },
      { status: 400 }
    );
  }

  // Store preliminary WhatsApp configuration
  await prisma.aIInstance.update({
    where: { id },
    data: {
      whatsappPhoneNumber: phoneNumber.replace(/\s/g, ""),
      whatsappBusinessName: businessName,
      whatsappEnabled: false, // Will be set to true after OAuth completion
    },
  });

  // Generate Meta OAuth URL
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instances/${id}/whatsapp/callback`;
  const authUrl = generateMetaAuthUrl({
    redirectUri,
    state: Buffer.from(JSON.stringify({ instanceId: id, userId: session.user.id })).toString("base64"),
  });

  return NextResponse.json({
    ok: true,
    authUrl,
    message: "Please complete OAuth authorization with Meta",
  });
}

/**
 * GET /api/instances/[id]/whatsapp/setup
 * 
 * Get current WhatsApp setup status
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      whatsappEnabled: true,
      whatsappPhoneNumber: true,
      whatsappAccountId: true,
      whatsappBusinessName: true,
    },
  });
  
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    enabled: instance.whatsappEnabled ?? false,
    phoneNumber: instance.whatsappPhoneNumber,
    accountId: instance.whatsappAccountId,
    businessName: instance.whatsappBusinessName,
  });
}
