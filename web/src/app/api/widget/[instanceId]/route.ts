import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * CORS headers for widget - allows any domain to embed the widget
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

/**
 * OPTIONS /api/widget/[instanceId]
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204, 
    headers: CORS_HEADERS 
  });
}

/**
 * GET /api/widget/[instanceId]
 * 
 * Returns widget configuration for embedding.
 * Public endpoint - no authentication required.
 * Used by the widget.js script to fetch instance branding.
 * 
 * Response includes:
 * - name: Instance/agent name
 * - greeting: Custom greeting message
 * - avatarUrl: URL to avatar image (optional)
 * - brandColor: Primary brand color
 * - hidePoweredBy: Whether to hide "Powered by SynapseForge" branding
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  try {
    const { instanceId } = await params;

    // Fetch instance with minimal public data
    const instance = await prisma.aIInstance.findUnique({
      where: { id: instanceId },
      select: {
        id: true,
        name: true,
        userId: true,
        status: true,
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Fetch white label config for branding
    const whiteLabelConfig = await prisma.whiteLabelConfig
      .findUnique({ 
        where: { userId: instance.userId } 
      })
      .catch(() => null);

    // Parse instance config for any custom settings
    let instanceConfig: {
      agentName?: string;
      welcomeMessage?: string;
    } = {};
    
    try {
      const configRecord = await prisma.aIInstance.findUnique({
        where: { id: instanceId },
        select: { config: true },
      });
      if (configRecord?.config) {
        instanceConfig = JSON.parse(configRecord.config);
      }
    } catch {
      // Config parsing is optional
    }

    // Build response
    const response = {
      id: instance.id,
      name: instanceConfig.agentName || instance.name,
      greeting: instanceConfig.welcomeMessage || `Hi! I'm ${instance.name}. How can I help you today?`,
      avatarUrl: whiteLabelConfig?.logoUrl || null,
      brandColor: whiteLabelConfig?.brandColor || "#7c3aed",
      hidePoweredBy: whiteLabelConfig?.hidePoweredBy || false,
      status: instance.status,
    };

    return NextResponse.json(response, { 
      status: 200, 
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error("[Widget API] Error fetching widget config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
