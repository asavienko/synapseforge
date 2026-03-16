import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";

export const REGION_LABELS = {
  nbg1: "Nässheim, DE",
  fsn1: "Freistadt, DE",
  hel1: "Helsinki, FI",
  eas1: "Easthaven, US",
  ash1: "Ashburn, US",
  lga1: "New York, US",
  sin1: "Singapore, SG",
  syd1: "Sydney, AU",
} as const;

export type HetznerRegion = keyof typeof REGION_LABELS;

export const TIER_LABEL: Record<string, string> = {
  minimal: "Minimal (trial)",
  standard: "Standard",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const TIER_COST: Record<string, string> = {
  minimal: "€5/mo",
  standard: "€10/mo",
  pro: "€25/mo",
  enterprise: "Custom",
};

// Server sizes for each tier
const TIER_SERVER_TYPE: Record<string, string> = {
  minimal: "cpx11",   // 2 vCPU, 2GB RAM
  standard: "cpx21",  // 3 vCPU, 4GB RAM
  pro: "cpx31",       // 4 vCPU, 8GB RAM
  enterprise: "cpx41" // 8 vCPU, 16GB RAM
};

// OS image (Debian 12)
const HETZNER_IMAGE = "debian-12";

export interface ProvisionResult {
  ok: boolean;
  serverId?: string;
  ip?: string;
  error?: string;
}

/**
 * Provision a new VPS instance on Hetzner for the given AIInstance.
 * Creates the server and updates the DB record.
 */
export async function provisionInstance(
  instanceId: string,
  region: HetznerRegion = "nbg1"
): Promise<ProvisionResult> {
  const hetznerKey = process.env.HETZNER_API_KEY;
  if (!hetznerKey) {
    return { ok: false, error: "HETZNER_API_KEY not configured" };
  }

  // Fetch instance
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, name: true, tier: true, userId: true, vpsServerId: true, vpsUrl: true },
  });
  if (!instance) {
    return { ok: false, error: "Instance not found" };
  }

  // Check if already provisioned
  if (instance.vpsServerId || instance.vpsUrl) {
    return { ok: false, error: "Instance already provisioned" };
  }

  // Enforce plan limits before provisioning
  const user = await prisma.user.findUnique({
    where: { id: instance.userId },
    select: { id: true, plan: true, instances: { select: { id: true, status: true } } },
  });
  if (!user) {
    return { ok: false, error: "User not found" };
  }

  const plan = PLANS[user.plan as keyof typeof PLANS] ?? PLANS.free;
  const limit = plan.instances; // -1 = unlimited

  // Count running instances (excluding the one being provisioned)
  const runningCount = user.instances.filter((i) => i.status === "running").length;

  // If user has reached limit and this is a new instance, block provisioning
  if (limit !== -1 && runningCount >= limit) {
    return { 
      ok: false, 
      error: `Plan limit reached (${limit} instance${limit !== 1 ? "s" : ""} max)` 
    };
  }

  const serverType = TIER_SERVER_TYPE[instance.tier] ?? TIER_SERVER_TYPE.minimal;
  const serverName = `sf-${instance.id.slice(0, 8)}-${Date.now().toString(36)}`;

  try {
    // Create server on Hetzner
    const res = await fetch("https://api.hetzner.cloud/v1/servers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hetznerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: serverName,
        server_type: serverType,
        image: HETZNER_IMAGE,
        location: region,
        ssh_keys: [], // Could add SSH key IDs here
        labels: {
          synapseforge_instance: instanceId,
          synapseforge_user: instance.userId,
        },
        user_data: `#!/bin/bash
# SynapseForge VPS bootstrap script
# Will be executed after first boot
echo "Starting SynapseForge bootstrap for instance ${instanceId}" > /var/log/synapseforge-bootstrap.log
# Actual installation happens via OpenClaw bootstrap endpoint
`,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { ok: false, error: err.error?.message ?? "Hetzner API error" };
    }

    const data = await res.json();
    const server = data.server;
    const ip = server.public_net?.ipv4?.ip;

    // Update instance with VPS details
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: {
        vpsServerId: String(server.id),
        vpsProvider: "hetzner",
        provisionStatus: "provisioning",
        // vpsUrl will be set by the cron job after gateway becomes healthy
      },
    });

    return { ok: true, serverId: String(server.id), ip };
  } catch (error) {
    console.error("Provisioning error:", error);
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { provisionStatus: "failed" },
    }).catch(console.error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}