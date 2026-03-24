import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET /api/instances/[id]/webhooks - List webhooks
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get webhooks from database
    const webhooks = await prisma.webhook.findMany({
      where: { instanceId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error("[webhooks] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

// POST /api/instances/[id]/webhooks - Create webhook
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { url, events, secret } = await req.json();

    // Validate
    if (!url || !events || events.length === 0) {
      return NextResponse.json(
        { error: "URL and events are required" },
        { status: 400 }
      );
    }

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create webhook
    const webhook = await prisma.webhook.create({
      data: {
        userId: user.id,
        instanceId: id,
        url,
        events,
        secret: secret || crypto.randomBytes(32).toString("hex"),
        active: true,
      },
    });

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error("[webhooks] Error:", error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}
