import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/instances/[id]/logs/realtime
 * 
 * Fetches real-time logs from the OpenClaw instance via SSH.
 * Falls back to database activity logs if SSH is not available.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If no VPS configured, return empty array - client will fall back to activity logs
  if (!instance.vpsUrl || !instance.gatewayToken) {
    return NextResponse.json([]);
  }

  const lines = req.nextUrl.searchParams.get("lines") ?? "100";

  try {
    // Try to fetch logs from the OpenClaw instance
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${instance.vpsUrl}/admin/logs?lines=${lines}`, {
      headers: {
        Authorization: `Bearer ${instance.gatewayToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      // If the instance doesn't support log endpoint yet, return empty
      return NextResponse.json([]);
    }

    const data = await res.json();
    return NextResponse.json(data.logs ?? []);
  } catch {
    // If fetch fails (instance offline, no log endpoint, etc.), return empty
    return NextResponse.json([]);
  }
}
