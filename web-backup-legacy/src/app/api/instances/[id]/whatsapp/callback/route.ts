import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { exchangeCodeForToken, registerWebhook, getBusinessAccountId } from "@/lib/whatsapp/meta";

/**
 * GET /api/instances/[id]/whatsapp/callback
 * 
 * OAuth callback handler for Meta WhatsApp Business API
 * Exchanges authorization code for access token and completes setup
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("[WhatsApp OAuth] Error:", error, errorDescription);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instances/${id}?whatsapp_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instances/${id}?whatsapp_error=missing_params`
    );
  }

  try {
    // Verify state parameter
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    if (stateData.instanceId !== id) {
      throw new Error("Invalid state parameter");
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken({
      code,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/instances/${id}/whatsapp/callback`,
    });

    // Get WhatsApp Business Account ID
    const accountId = await getBusinessAccountId(tokenData.accessToken);

    // Generate webhook verification secret
    const webhookSecret = crypto.randomUUID();

    // Update instance with WhatsApp credentials
    await prisma.aIInstance.update({
      where: { id },
      data: {
        whatsappEnabled: true,
        whatsappAccountId: accountId,
        whatsappAccessToken: encrypt(tokenData.accessToken),
        whatsappWebhookSecret: encrypt(webhookSecret),
        configSynced: false, // Needs VPS sync
      },
    });

    // Register webhook with Meta
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp/meta`;
    await registerWebhook({
      accessToken: tokenData.accessToken,
      accountId,
      webhookUrl,
      verifyToken: webhookSecret,
    });

    // Redirect back to instance page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instances/${id}?whatsapp_success=1`
    );
  } catch (err) {
    console.error("[WhatsApp OAuth] Setup error:", err);
    const errorMessage = err instanceof Error ? err.message : "setup_failed";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/instances/${id}?whatsapp_error=${encodeURIComponent(errorMessage)}`
    );
  }
}
