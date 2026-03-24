import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  return !!email && adminEmails.includes(email);
}

// POST — trigger a Hetzner snapshot for this instance
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!(await isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findUnique({ where: { id } });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Use vpsServerId — the Hetzner server numeric ID stored during provisioning
  const hetznerServerId = instance.vpsServerId;
  const hetznerApiKey = process.env.HETZNER_API_KEY;

  if (!hetznerApiKey) {
    return NextResponse.json({ error: "HETZNER_API_KEY not configured" }, { status: 503 });
  }

  if (!hetznerServerId) {
    return NextResponse.json(
      { error: "No Hetzner server ID linked to this instance" },
      { status: 400 }
    );
  }

  // Call Hetzner API: POST /v1/servers/{id}/actions/create_image
  const hetznerRes = await fetch(
    `https://api.hetzner.cloud/v1/servers/${hetznerServerId}/actions/create_image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hetznerApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `OpenHelix AI snapshot — ${instance.name} — ${new Date().toISOString()}`,
        type: "snapshot",
        labels: { instanceId: id, instanceName: instance.name },
      }),
    }
  );

  if (!hetznerRes.ok) {
    const error = await hetznerRes.json().catch(() => ({}));
    return NextResponse.json({ error: "Hetzner API error", details: error }, { status: 502 });
  }

  const data = await hetznerRes.json();

  // Log to ActivityLog
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "hetzner_snapshot_triggered",
      details: JSON.stringify({ actionId: data.action?.id, imageId: data.image?.id }),
    },
  });

  return NextResponse.json({ ok: true, action: data.action, image: data.image });
}

// GET — list Hetzner snapshots for this instance's server
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!(await isAdmin(session?.user?.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findUnique({ where: { id } });
  if (!instance?.vpsServerId) {
    return NextResponse.json({ snapshots: [] });
  }

  const hetznerApiKey = process.env.HETZNER_API_KEY;
  if (!hetznerApiKey) return NextResponse.json({ snapshots: [] });

  const res = await fetch(
    `https://api.hetzner.cloud/v1/images?type=snapshot&label_selector=instanceId%3D${id}&sort=created:desc&page=1&per_page=10`,
    { headers: { Authorization: `Bearer ${hetznerApiKey}` } }
  );

  const data = await res.json().catch(() => ({ images: [] }));
  return NextResponse.json({ snapshots: data.images ?? [] });
}
