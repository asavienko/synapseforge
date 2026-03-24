import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { revokeAccessToken, unregisterWebhook } from "@/lib/whatsapp/meta";

/**
 * DELETE /api/instances/[id]/whatsapp
 * 
 * Disconnect WhatsApp integration
 * - Revokes Meta access tokens
 * - Unregisters webhooks
 * - Clears WhatsApp configuration from database
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  // Verify instance ownership
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      whatsappEnabled: true,
      whatsappAccessToken: true,
      whatsappAccountId: true,
      whatsappWebhookSecret: true,
    },
  });
  
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If WhatsApp is not enabled, nothing to do
  if (!instance.whatsappEnabled) {
    return NextResponse.json({ ok: true, message: "WhatsApp not connected" });
  }

  try {
    // Revoke access token if available
    if (instance.whatsappAccessToken) {
      try {
        const token = decrypt(instance.whatsappAccessToken);
        await revokeAccessToken(token);
      } catch (err) {
        console.warn("[WhatsApp Disconnect] Failed to revoke token:", err);
        // Continue with cleanup even if token revocation fails
      }
    }

    // Unregister webhook if available
    if (instance.whatsappAccessToken && instance.whatsappAccountId) {
      try {
        const token = decrypt(instance.whatsappAccessToken);
        const secret = instance.whatsappWebhookSecret 
          ? decrypt(instance.whatsappWebhookSecret) 
          : undefined;
        
        await unregisterWebhook({
          accessToken: token,
          accountId: instance.whatsappAccountId,
          _verifyToken: secret,
        });
      } catch (err) {
        console.warn("[WhatsApp Disconnect] Failed to unregister webhook:", err);
        // Continue with cleanup even if webhook unregistration fails
      }
    }

    // Clear WhatsApp configuration
    await prisma.aIInstance.update({
      where: { id },
      data: {
        whatsappEnabled: false,
        whatsappAccessToken: null,
        whatsappWebhookSecret: null,
        whatsappAccountId: null,
        // Keep phone number and business name for reference
        configSynced: false,
      },
    });

    return NextResponse.json({ 
      ok: true, 
      message: "WhatsApp disconnected successfully" 
    });
  } catch (err) {
    console.error("[WhatsApp Disconnect] Error:", err);
    return NextResponse.json(
      { error: "Failed to disconnect WhatsApp" },
      { status: 500 }
    );
  }
}
