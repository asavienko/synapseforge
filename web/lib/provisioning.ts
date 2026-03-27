import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";
import { randomBytes } from "crypto";

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
 * Generate a cloud-init user_data script that installs OpenClaw and
 * calls back to OpenHelix AI to mark provisioning as complete.
 */
function makeUserDataScript(instanceId: string, gatewayToken: string, sfApiUrl: string): string {
  return `#!/bin/bash
set -euo pipefail

# OpenHelix AI VPS bootstrap
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | systemd-cat -t synapseforge-bootstrap
}

log "Starting OpenHelix AI bootstrap for instance ${instanceId}"

# Install dependencies
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y curl docker.io docker-compose-plugin

# Start Docker
systemctl enable docker
systemctl start docker

# Create OpenClaw directory
mkdir -p /opt/openclaw
cd /opt/openclaw

# Pull latest OpenClaw Docker image
docker pull ghcr.io/openclaw/openclaw:latest

# Generate OpenClaw config
cat > .env <<EOF
GATEWAY_TOKEN=${gatewayToken}
INSTANCE_ID=${instanceId}
OPENHELIX_API_URL=${sfApiUrl}
EOF

# Run OpenClaw gateway container
docker run -d \\
  --name openclaw-gateway \\
  --restart unless-stopped \\
  -p 18789:18789 \\
  -v /opt/openclaw/.env:/app/.env \\
  -v /opt/openclaw/data:/app/data \\
  ghcr.io/openclaw/openclaw:latest

log "OpenClaw gateway container started"

# Wait for gateway to become healthy, then notify OpenHelix AI
for i in {1..60}; do
  if curl -s -f -H "Authorization: Bearer ${gatewayToken}" ${sfApiUrl}/api/internal/health-check/${instanceId} > /dev/null 2>&1; then
    log "Gateway health check passed, notifying OpenHelix AI"
    curl -s -X POST -H "Authorization: Bearer ${gatewayToken}" -H "Content-Type: application/json" \\
      -d '{"openclaw_version":"latest","ip":"$(hostname -I | awk "{print $1}")"}' \\
      ${sfApiUrl}/api/internal/provision-complete/${instanceId} || true
    exit 0
  fi
  log "Waiting for gateway... ($i/60)"
  sleep 5
done

log "Timed out waiting for gateway health check"
exit 1
`;
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

  // Generate a secure gateway token for this instance
  const gatewayToken = `sk-gw-${randomBytes(24).toString("hex")}`;

  try {
    // Create server on Hetzner
    const userData = makeUserDataScript(instanceId, gatewayToken, process.env.NEXTAUTH_URL || "https://openhelixai.com");

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
        user_data: userData,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { ok: false, error: err.error?.message ?? "Hetzner API error" };
    }

    const data = await res.json();
    const server = data.server;
    const ip = server.public_net?.ipv4?.ip;

    // Update instance with VPS details and gateway token
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: {
        vpsServerId: String(server.id),
        vpsProvider: "hetzner",
        provisionStatus: "provisioning",
        gatewayToken: gatewayToken,
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
