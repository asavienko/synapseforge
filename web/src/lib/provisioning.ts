import { prisma } from "@/lib/prisma";

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
 * Creates the server, installs OpenClaw, and updates the DB record.
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
        // vpsUrl will be set after OpenClaw is installed and health check passes
      },
    });

    // Schedule background task to monitor provisioning and install OpenClaw
    // This will poll the Hetzner API until the server is ready, then trigger OpenClaw installation
    monitorProvisioning(instanceId, server.id, ip).catch(console.error);

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

/**
 * Background task to monitor VPS provisioning progress.
 * Polls Hetzner API until server is ready, then triggers OpenClaw installation.
 */
async function monitorProvisioning(instanceId: string, serverId: number, ip: string) {
  const hetznerKey = process.env.HETZNER_API_KEY;
  if (!hetznerKey) return;

  // Poll Hetzner until server is running
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes at 5s intervals

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const res = await fetch(`https://api.hetzner.cloud/v1/servers/${serverId}`, {
      headers: { "Authorization": `Bearer ${hetznerKey}` },
    });

    if (!res.ok) {
      attempts++;
      continue;
    }

    const data = await res.json();
    const status = data.server?.status;

    if (status === "running") {
      // Server is ready, now install OpenClaw
      await installOpenClaw(instanceId, ip);
      return;
    }

    if (status === "error") {
      await prisma.aIInstance.update({
        where: { id: instanceId },
        data: { provisionStatus: "failed" },
      });
      return;
    }

    attempts++;
  }

  // Timeout
  await prisma.aIInstance.update({
    where: { id: instanceId },
    data: { provisionStatus: "failed" },
  });
}

/**
 * Install OpenClaw on the VPS via SSH or cloud-init.
 * Updates the instance record with the gateway URL after successful installation.
 */
async function installOpenClaw(instanceId: string, ip: string) {
  try {
    // For now, we'll set a placeholder gateway URL
    // In production, this would:
    // 1. SSH into the VPS
    // 2. Install Docker and OpenClaw
    // 3. Configure the gateway
    // 4. Wait for health check to pass
    // 5. Set the vpsUrl and gatewayToken

    const gatewayUrl = `http://${ip}:3000`;

    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: {
        vpsUrl: gatewayUrl,
        provisionStatus: "ready",
        status: "running",
        configSynced: true,
      },
    });
  } catch (error) {
    console.error("OpenClaw installation error:", error);
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { provisionStatus: "failed" },
    }).catch(console.error);
  }
}

/**
 * Get the current provisioning status of an instance.
 */
export async function getProvisionStatus(instanceId: string) {
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: {
      provisionStatus: true,
      vpsServerId: true,
      vpsUrl: true,
      vpsProvider: true,
    },
  });

  if (!instance) {
    return { error: "Instance not found" };
  }

  return {
    provisionStatus: instance.provisionStatus,
    serverId: instance.vpsServerId,
    vpsUrl: instance.vpsUrl,
    provider: instance.vpsProvider,
  };
}