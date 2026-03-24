import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { getConnectionHealth } from "@/lib/whatsapp/meta";

/**
 * GET /api/instances/[id]/whatsapp/status
 * 
 * Return WhatsApp connection status
 * Shows phone number, business name, connection health
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  // Verify instance ownership
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      whatsappEnabled: true,
      whatsappPhoneNumber: true,
      whatsappAccountId: true,
      whatsappBusinessName: true,
      whatsappAccessToken: true,
    },
  });
  
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If not enabled, return basic status
  if (!instance.whatsappEnabled) {
    return NextResponse.json({
      enabled: false,
      status: "disconnected",
      phoneNumber: instance.whatsappPhoneNumber,
      businessName: instance.whatsappBusinessName,
    });
  }

  // Check connection health if we have an access token
  let health = { healthy: false, error: null as string | null };
  if (instance.whatsappAccessToken) {
    try {
      const token = decrypt(instance.whatsappAccessToken);
      health = await getConnectionHealth({
        accessToken: token,
        accountId: instance.whatsappAccountId!,
      });
    } catch (err) {
      health.error = err instanceof Error ? err.message : "Health check failed";
    }
  }

  return NextResponse.json({
    enabled: true,
    status: health.healthy ? "connected" : "degraded",
    phoneNumber: instance.whatsappPhoneNumber,
    businessName: instance.whatsappBusinessName,
    accountId: instance.whatsappAccountId,
    health: health.healthy ? "healthy" : "unhealthy",
    error: health.error,
  });
}
