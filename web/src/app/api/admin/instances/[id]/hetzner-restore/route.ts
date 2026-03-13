import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  return !!email && adminEmails.includes(email);
}

// POST { imageId: number }
// Rebuilds the server from a Hetzner snapshot image.
// POST /v1/servers/{serverId}/actions/rebuild — { image: imageId }
// ⚠️ DESTRUCTIVE — all current data on the server disk will be lost.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!(await isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { imageId } = await req.json();

  const instance = await prisma.aIInstance.findUnique({ where: { id } });
  if (!instance?.vpsServerId) {
    return NextResponse.json({ error: "No Hetzner server linked" }, { status: 400 });
  }

  const hetznerApiKey = process.env.HETZNER_API_KEY;
  if (!hetznerApiKey) {
    return NextResponse.json({ error: "HETZNER_API_KEY not configured" }, { status: 503 });
  }

  const res = await fetch(
    `https://api.hetzner.cloud/v1/servers/${instance.vpsServerId}/actions/rebuild`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hetznerApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageId }),
    }
  );

  const data = await res.json().catch(() => ({}));

  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "hetzner_restore_triggered",
      details: JSON.stringify({ imageId, actionId: data.action?.id }),
    },
  });

  return NextResponse.json({ ok: res.ok, action: data.action });
}
