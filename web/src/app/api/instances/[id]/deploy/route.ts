import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCloudInit } from "@/lib/cloud-init";
import { randomBytes } from "crypto";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    include: { credentials: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Already provisioned or in progress?
  if (instance.provisionStatus === "provisioning") {
    return NextResponse.json({ error: "Provisioning already in progress", status: "provisioning" }, { status: 409 });
  }
  if (instance.vpsUrl && instance.provisionStatus === "ready") {
    return NextResponse.json({ error: "Instance already deployed", status: "ready" }, { status: 409 });
  }

  // Check platform has Hetzner key
  const hetznerApiKey = process.env.HETZNER_API_KEY;
  if (!hetznerApiKey) {
    return NextResponse.json(
      { error: "Cloud deployment is not available on this platform. Contact support." },
      { status: 503 }
    );
  }

  // Validate readiness — need at least one LLM credential
  const credKeys = instance.credentials.map((c) => c.key);
  const hasLLM = credKeys.some((k) =>
    ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].includes(k)
  );
  if (!hasLLM) {
    return NextResponse.json(
      {
        error: "You need to configure at least one AI provider key before deploying.",
        needsSetup: true,
        missingItems: ["openai_api_key"],
      },
      { status: 400 }
    );
  }

  // Generate / reuse tokens
  const gatewayToken = instance.gatewayToken ?? randomBytes(32).toString("hex");
  const bootstrapToken = randomBytes(32).toString("hex");

  await prisma.aIInstance.update({
    where: { id },
    data: { gatewayToken, bootstrapToken, bootstrapUsed: false },
  });

  const appUrl =
    process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "https://synapseforge-mu.vercel.app";
  const sfApiKey = process.env.INTERNAL_API_KEY ?? randomBytes(16).toString("hex");

  const cloudInit = generateCloudInit({ instanceId: id, gatewayToken, appUrl, bootstrapToken, sfApiKey });

  const serverName = `sf-${id.slice(0, 8)}`;
  let hetznerRes: Response;
  try {
    hetznerRes = await fetch("https://api.hetzner.cloud/v1/servers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hetznerApiKey}`,
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
    return NextResponse.json(
      { error: `Failed to contact cloud provider: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }

  if (!hetznerRes.ok) {
    let detail = "";
    try {
      const errBody = await hetznerRes.json();
      detail = errBody?.error?.message ?? JSON.stringify(errBody);
    } catch {
      detail = await hetznerRes.text();
    }
    return NextResponse.json({ error: `Cloud error (${hetznerRes.status}): ${detail}` }, { status: 502 });
  }

  const hetznerData = await hetznerRes.json();
  const serverId = String(hetznerData.server?.id ?? "");
  const ip: string = hetznerData.server?.public_net?.ipv4?.ip ?? "";
  const vpsUrl = ip ? `http://${ip}:18789` : undefined;

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

  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "created",
      details: `Deploying to cloud (server ${serverId}, ip ${ip || "pending"})…`,
    },
  });

  return NextResponse.json({ ok: true, status: "provisioning", serverId, ip });
}
