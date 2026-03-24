import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/webhooks/:id
 * Update a webhook's url, events, or active status.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.webhook.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const body = await req.json();
  const { url, events, active } = body as {
    url?: string;
    events?: string;
    active?: boolean;
  };

  const updateData: { url?: string; events?: string; active?: boolean } = {};

  if (url !== undefined) {
    if (typeof url !== "string") {
      return NextResponse.json({ error: "url must be a string" }, { status: 400 });
    }
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
    updateData.url = url;
  }

  if (events !== undefined) {
    if (typeof events !== "string" || events.trim() === "") {
      return NextResponse.json(
        { error: "events must be a non-empty string" },
        { status: 400 }
      );
    }
    updateData.events = events.trim();
  }

  if (active !== undefined) {
    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "active must be a boolean" },
        { status: 400 }
      );
    }
    updateData.active = active;
  }

  const webhook = await prisma.webhook.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      instanceId: true,
      url: true,
      events: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ webhook });
}

/**
 * DELETE /api/webhooks/:id
 * Delete a webhook.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.webhook.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  await prisma.webhook.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
