import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCloudInit } from "@/lib/cloud-init";
import { randomBytes } from "crypto";

function isAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const hetznerApiKey = process.env.HETZNER_API_KEY;
  if (!hetznerApiKey) {
    return NextResponse.json({ error: "Hetzner API key not configured" }, { status: 503 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findUnique({
    where: { id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Generate or reuse gateway token
  const gatewayToken = instance.gatewayToken ?? randomBytes(32).toString("hex");

  // Generate a fresh bootstrap token
  const bootstrapToken = randomBytes(32).toString("hex");

  // Save both tokens before creating the server
  await prisma.aIInstance.update({
    where: { id },
    data: {
      gatewayToken,
      bootstrapToken,
      bootstrapUsed: false,
    },
  });

  const appUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "https://synapseforge-mu.vercel.app";
  const sfApiKey = process.env.INTERNAL_API_KEY ?? randomBytes(16).toString("hex");

  const cloudInit = generateCloudInit({
    instanceId: id,
    gatewayToken,
    appUrl,
    bootstrapToken,
    sfApiKey,
  });

  // Call Hetzner API to create server
  const serverName = `sf-${id.slice(0, 8)}`;
  let hetznerRes: Response;
  try {
    hetznerRes = await fetch("https://api.hetzner.cloud/v1/servers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hetznerApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: serverName,
        server_type: "cx22",
        image: "ubuntu-22.04",
        location: "nbg1",
        user_data: cloudInit,
        ssh_keys: [],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json({ error: `Failed to contact Hetzner API: ${message}` }, { status: 502 });
  }

  if (!hetznerRes.ok) {
    let detail = "";
    try {
      const errBody = await hetznerRes.json();
      detail = errBody?.error?.message ?? JSON.stringify(errBody);
    } catch {
      detail = await hetznerRes.text();
    }
    return NextResponse.json(
      { error: `Hetzner API error (${hetznerRes.status}): ${detail}` },
      { status: 502 }
    );
  }

  const hetznerData = await hetznerRes.json();
  const serverId = String(hetznerData.server?.id ?? "");
  const ip: string = hetznerData.server?.public_net?.ipv4?.ip ?? "";

  const vpsUrl = ip ? `http://${ip}:18789` : undefined;

  // Update instance with VPS info
  await prisma.aIInstance.update({
    where: { id },
    data: {
      vpsServerId: serverId,
      vpsProvider: "hetzner",
      vpsUrl: vpsUrl ?? null,
      provisionStatus: "provisioning",
      status: "pending",
    },
  });

  // Log it
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "created",
      details: `Provisioning Hetzner VPS (server ${serverId}, ip ${ip})...`,
    },
  });

  return NextResponse.json({ ok: true, serverId, ip });
}
