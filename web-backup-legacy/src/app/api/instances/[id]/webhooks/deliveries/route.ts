import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify instance ownership
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get webhooks for this instance
  const webhooks = await prisma.webhook.findMany({
    where: { instanceId: id },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    webhooks: webhooks.map((w) => ({
      id: w.id,
      url: w.url,
      events: w.events.split(","),
      active: w.active,
      createdAt: w.createdAt.toISOString(),
      deliveries: w.deliveries.map((d) => ({
        id: d.id,
        event: d.event,
        success: d.success,
        statusCode: d.statusCode,
        error: d.error,
        createdAt: d.createdAt.toISOString(),
      })),
    })),
  });
}
