import { prisma } from "@/lib/prisma";
import { generateCloudInit } from "@/lib/cloud-init";
import { randomBytes } from "crypto";

export type HetznerRegion = "nbg1" | "fsn1" | "hel1" | "ash" | "hil";

export const REGION_LABELS: Record<HetznerRegion, string> = {
  nbg1: "Nuremberg, EU 🇩🇪",
  fsn1: "Falkenstein, EU 🇩🇪",
  hel1: "Helsinki, EU 🇫🇮",
  ash: "Ashburn, US 🇺🇸",
  hil: "Hillsboro, US 🇺🇸",
};

export const TIER_TO_SERVER: Record<string, string> = {
  minimal: "cx22",
  standard: "cx32",
  pro: "cx42",
};

export const TIER_COST: Record<string, string> = {
  minimal: "~$3.29/mo",
  standard: "~$6.49/mo",
  pro: "~$13.49/mo",
};

export const TIER_LABEL: Record<string, string> = {
  minimal: "Minimal (cx22 — 2 vCPU, 4 GB)",
  standard: "Standard (cx32 — 4 vCPU, 8 GB)",
  pro: "Pro (cx42 — 8 vCPU, 16 GB)",
};

export interface ProvisionResult {
  ok: boolean;
  serverId?: string;
  ip?: string;
  error?: string;
}

export async function provisionInstance(
  instanceId: string,
  region: HetznerRegion = "nbg1"
): Promise<ProvisionResult> {
  const hetznerApiKey = process.env.HETZNER_API_KEY;
  if (!hetznerApiKey) {
    return { ok: false, error: "Hetzner API key not configured" };
  }

  const instance = await prisma.aIInstance.findUnique({ where: { id: instanceId } });
  if (!instance) return { ok: false, error: "Instance not found" };

  // Generate or reuse gateway token
  const gatewayToken = instance.gatewayToken ?? randomBytes(32).toString("hex");

  // Generate a fresh bootstrap token
  const bootstrapToken = randomBytes(32).toString("hex");

  // Save both tokens before creating the server
  await prisma.aIInstance.update({
    where: { id: instanceId },
    data: { gatewayToken, bootstrapToken, bootstrapUsed: false },
  });

  const appUrl =
    process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "https://synapseforge-mu.vercel.app";
  const sfApiKey = process.env.INTERNAL_API_KEY ?? randomBytes(16).toString("hex");

  const cloudInit = generateCloudInit({
    instanceId,
    gatewayToken,
    appUrl,
    bootstrapToken,
    sfApiKey,
  });

  const serverType = TIER_TO_SERVER[instance.tier] ?? "cx22";
  const serverName = `sf-${instanceId.slice(0, 8)}`;

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
        server_type: serverType,
        image: "ubuntu-22.04",
        location: region,
        user_data: cloudInit,
        ssh_keys: [],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: `Failed to contact Hetzner API: ${message}` };
  }

  if (!hetznerRes.ok) {
    let detail = "";
    try {
      const errBody = await hetznerRes.json();
      detail = errBody?.error?.message ?? JSON.stringify(errBody);
    } catch {
      detail = await hetznerRes.text();
    }
    return { ok: false, error: `Hetzner API error (${hetznerRes.status}): ${detail}` };
  }

  const hetznerData = await hetznerRes.json();
  const serverId = String(hetznerData.server?.id ?? "");
  const ip: string = hetznerData.server?.public_net?.ipv4?.ip ?? "";
  const vpsUrl = ip ? `http://${ip}:18789` : undefined;

  // Update instance with VPS info
  await prisma.aIInstance.update({
    where: { id: instanceId },
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
      instanceId,
      event: "created",
      details: `Provisioning Hetzner VPS (server ${serverId}, ip ${ip}, region ${region})...`,
    },
  });

  return { ok: true, serverId, ip };
}
