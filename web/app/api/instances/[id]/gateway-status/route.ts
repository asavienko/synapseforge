import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!instance.vpsUrl) {
    return NextResponse.json({ connected: false, reason: "not_configured" });
  }

  const startMs = Date.now();
  try {
    const res = await fetch(`${instance.vpsUrl}/hooks/wake`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${instance.gatewayToken ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "ping", mode: "next-heartbeat" }),
      signal: AbortSignal.timeout(5000),
    });

    const latencyMs = Date.now() - startMs;

    if (res.status === 401) {
      return NextResponse.json({
        connected: false,
        latencyMs,
        httpStatus: 401,
        error: "Invalid gateway token",
        vpsUrl: instance.vpsUrl,
      });
    }

    return NextResponse.json({
      connected: true,
      latencyMs,
      httpStatus: res.status,
      vpsUrl: instance.vpsUrl,
    });
  } catch (err) {
    const latencyMs = Date.now() - startMs;
    return NextResponse.json({
      connected: false,
      latencyMs,
      error: err instanceof Error ? err.message : "Gateway unreachable",
      vpsUrl: instance.vpsUrl,
    });
  }
}
