import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/webhooks
 * List all webhooks for the authenticated user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      instanceId: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ webhooks });
}

/**
 * POST /api/webhooks
 * Create a new webhook. Max 10 per user.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { url, events, instanceId } = body as {
    url?: string;
    events?: string;
    instanceId?: string;
  };

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Validate URL format
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid URL format. Must be http or https." },
      { status: 400 }
    );
  }

  if (!events || typeof events !== "string" || events.trim() === "") {
    return NextResponse.json({ error: "events is required" }, { status: 400 });
  }

  // Enforce max 10 webhooks per user
  const count = await prisma.webhook.count({
    where: { userId: session.user.id },
  });
  if (count >= 10) {
    return NextResponse.json(
      { error: "Maximum of 10 webhooks per user" },
      { status: 400 }
    );
  }

  // If instanceId is provided, verify ownership
  if (instanceId) {
    const instance = await prisma.aIInstance.findFirst({
      where: { id: instanceId, userId: session.user.id },
      select: { id: true },
    });
    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }
  }

  const webhook = await prisma.webhook.create({
    data: {
      userId: session.user.id,
      url,
      events: events.trim(),
      instanceId: instanceId ?? null,
    },
    select: {
      id: true,
      instanceId: true,
      url: true,
      events: true,
      secret: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ webhook }, { status: 201 });
}
