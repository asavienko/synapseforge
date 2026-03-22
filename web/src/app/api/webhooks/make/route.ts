import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/apikey";

/**
 * Make.com Webhook Integration
 * 
 * POST /api/webhooks/make
 * Headers: X-API-Key: {your_api_key}
 * Body: { event: string, data: any }
 * 
 * This endpoint receives webhook calls from Make.com scenarios
 * and routes them to the appropriate instance.
 */

export async function POST(req: NextRequest) {
  try {
    // Verify API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing X-API-Key header" },
        { status: 401 }
      );
    }

    const instance = await verifyApiKey(apiKey);
    if (!instance) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const body = await req.json();
    const { event, data } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Missing 'event' field in payload" },
        { status: 400 }
      );
    }

    // Log the webhook event
    await prisma.activityLog.create({
      data: {
        instanceId: instance.id,
        event: "make_webhook_received",
        details: JSON.stringify({ event, data }),
      },
    });

    // Handle different event types
    switch (event) {
      case "send_message":
        // Queue a message to be sent via the instance
        await prisma.chatMessage.create({
          data: {
            instanceId: instance.id,
            role: "assistant",
            content: data?.message || "Message from Make.com",
            source: "make",
          },
        });
        break;

      case "update_config":
        // Update instance configuration
        if (data?.config) {
          await prisma.aIInstance.update({
            where: { id: instance.id },
            data: {
              config: JSON.stringify({
                ...JSON.parse(instance.config || "{}"),
                ...data.config,
              }),
            },
          });
        }
        break;

      default:
        // Unknown event type - just log it
        console.log(`[make] Unknown event type: ${event}`);
    }

    return NextResponse.json({
      success: true,
      instanceId: instance.id,
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[make-webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/make
 * Returns webhook configuration info
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  
  if (!apiKey) {
    return NextResponse.json({
      message: "Make.com Webhook Endpoint",
      usage: {
        method: "POST",
        headers: { "X-API-Key": "your_api_key_here" },
        body: {
          event: "send_message | update_config",
          data: "object containing event-specific data",
        },
      },
      events: [
        { event: "send_message", description: "Send a message through the AI instance" },
        { event: "update_config", description: "Update instance configuration" },
      ],
    });
  }

  const instance = await verifyApiKey(apiKey);
  if (!instance) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    valid: true,
    instanceId: instance.id,
    instanceName: instance.name,
    events: [
      { event: "send_message", description: "Send a message through the AI instance" },
      { event: "update_config", description: "Update instance configuration" },
    ],
  });
}
