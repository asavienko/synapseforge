import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { vpsUrl, gatewayToken } = body as { vpsUrl: string; gatewayToken: string };

  const instance = await prisma.aIInstance.findUnique({ where: { id } });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Test connectivity
  let connected = false;
  let connectError: string | undefined;
  const startMs = Date.now();

  try {
    const res = await fetch(`${vpsUrl}/hooks/wake`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${gatewayToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "ping", mode: "next-heartbeat" }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.status === 401) {
      connectError = "Invalid gateway token";
    } else {
      connected = true;
    }
  } catch {
    connectError = "Gateway unreachable";
  }

  const responseMs = Date.now() - startMs;

  // Always save the vpsUrl + gatewayToken
  await prisma.aIInstance.update({
    where: { id },
    data: {
      vpsUrl,
      gatewayToken,
      ...(connected
        ? { healthStatus: "healthy", lastCheckedAt: new Date() }
        : {}),
    },
  });

  // If connected, record a health check
  if (connected) {
    await prisma.healthCheck.create({
      data: {
        instanceId: id,
        status: "healthy",
        responseMs,
        error: null,
      },
    });
  }

  return NextResponse.json({ ok: true, connected, error: connectError });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  await prisma.aIInstance.update({
    where: { id },
    data: { vpsUrl: null, gatewayToken: null, healthStatus: null, lastCheckedAt: null },
  });

  return NextResponse.json({ ok: true });
}
