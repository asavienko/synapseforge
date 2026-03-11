import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!instance.vpsUrl) {
    return NextResponse.json({ error: "Instance not connected to a VPS" }, { status: 400 });
  }

  if (instance.status !== "running") {
    return NextResponse.json({ error: "Instance is not running" }, { status: 400 });
  }

  const body = await req.json();
  const { message } = body as { message: string };

  const startMs = Date.now();
  try {
    const res = await fetch(`${instance.vpsUrl}/hooks/agent`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${instance.gatewayToken ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, agentId: "main" }),
      signal: AbortSignal.timeout(30000),
    });

    const latencyMs = Date.now() - startMs;
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json({ ...data, latencyMs });
    } else {
      const text = await res.text();
      return NextResponse.json({ response: text, latencyMs });
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Gateway error: " + (err instanceof Error ? err.message : String(err)) },
      { status: 502 }
    );
  }
}
