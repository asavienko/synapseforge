// Generates cloud-init user_data for Hetzner VPS provisioning.
// Uses a BOOTSTRAP approach: cloud-init fetches config from our API using a one-time token.
// This avoids raw API keys appearing in Hetzner metadata.

export function generateCloudInit(params: {
  instanceId: string;
  gatewayToken: string;
  appUrl: string;         // e.g. "https://synapseforge.ai"
  bootstrapToken: string; // one-time token to fetch openclaw.json
  sfApiKey: string;       // INTERNAL_API_KEY for health check reporting
}): string {
  const { instanceId, gatewayToken, appUrl, bootstrapToken, sfApiKey } = params;

  // JS template literal: ${var} is expanded NOW (at generation time).
  // Bash heredocs below: single-quoted markers ('COMPOSE', 'HEALTH', 'SYNC') prevent
  // bash variable expansion — values embedded here are already literal after JS expansion.

  return `#!/bin/bash
set -euo pipefail
exec > /var/log/synapseforge-provision.log 2>&1
echo "[$(date)] Starting SynapseForge provisioning for instance ${instanceId}..."

# ── 1. System setup ────────────────────────────────────────────────────────────
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates gnupg cron
systemctl enable cron || true
systemctl start cron || true

# ── 2. Install Docker ─────────────────────────────────────────────────────────
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# ── 3. Create working directories ─────────────────────────────────────────────
mkdir -p /opt/openclaw /opt/synapseforge/scripts
chmod 700 /opt/openclaw  # private — contains API keys

# ── 4. Fetch OpenClaw config via one-time bootstrap token ─────────────────────
echo "[$(date)] Fetching OpenClaw config..."
curl -sf \\
  -H "Authorization: Bearer ${bootstrapToken}" \\
  "${appUrl}/api/internal/bootstrap/${instanceId}" \\
  -o /opt/openclaw/openclaw.json || {
  echo "ERROR: Failed to fetch config from bootstrap endpoint"
  exit 1
}
chmod 600 /opt/openclaw/openclaw.json
echo "[$(date)] Config fetched successfully."

# ── 5. Write Docker Compose file ──────────────────────────────────────────────
# The config file is bind-mounted (NOT read-only) so config-sync can update it.
# network_mode: host gives OpenClaw direct access to host network (port 18789
# is exposed on the public IP since bind=lan).
cat > /opt/openclaw/docker-compose.yml << 'COMPOSE'
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    restart: always
    network_mode: host
    environment:
      - NODE_ENV=production
      - HOME=/home/node
      - TERM=xterm-256color
      # XDG_CONFIG_HOME tells OpenClaw where to find openclaw.json
      - XDG_CONFIG_HOME=/home/node/.openclaw
      # Gateway token via env — also set in openclaw.json for reliability
      - OPENCLAW_GATEWAY_TOKEN=${gatewayToken}
      - OPENCLAW_GATEWAY_PORT=18789
      - OPENCLAW_GATEWAY_BIND=lan
      - OPENCLAW_NO_RESPAWN=1
    volumes:
      - openclaw_data:/home/node/.openclaw
      # Config file bind-mount (writable — config-sync updates this file and restarts)
      - /opt/openclaw/openclaw.json:/home/node/.openclaw/openclaw.json
    command:
      [
        "node", "dist/index.js",
        "gateway",
        "--bind", "lan",
        "--port", "18789",
        "--allow-unconfigured",
      ]

volumes:
  openclaw_data:
COMPOSE

# ── 6. Start OpenClaw ─────────────────────────────────────────────────────────
cd /opt/openclaw
docker compose pull --quiet
docker compose up -d
echo "[$(date)] OpenClaw container started."

# ── 7. Write environment file for cron scripts ────────────────────────────────
# IMPORTANT: OPENCLAW_GATEWAY_TOKEN is required by sync-config.sh for auth
cat > /etc/synapseforge.env << ENV
SF_API_URL=${appUrl}
SF_INSTANCE_ID=${instanceId}
SF_INTERNAL_API_KEY=${sfApiKey}
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=${gatewayToken}
ENV
chmod 600 /etc/synapseforge.env  # private — contains tokens

# ── 8. Health check script ────────────────────────────────────────────────────
cat > /opt/synapseforge/scripts/health-check.sh << 'HEALTH'
#!/bin/bash
source /etc/synapseforge.env
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
START_MS=$(date +%s%3N)
# Check if OpenClaw gateway responds (any HTTP response = up; 000 = down)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \
  "$OPENCLAW_GATEWAY_URL/hooks/health" 2>/dev/null || echo "000")
END_MS=$(date +%s%3N)
RESPONSE_MS=$((END_MS - START_MS))

if [ "$HTTP_CODE" = "000" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "503" ]; then
  STATUS="down"
  ERROR=",\"error\":\"Gateway returned HTTP $HTTP_CODE\""
else
  STATUS="healthy"
  ERROR=""
fi

PAYLOAD=$(printf '{"instanceId":"%s","status":"%s","responseMs":%d%s}' \
  "$SF_INSTANCE_ID" "$STATUS" "$RESPONSE_MS" "$ERROR")
curl -sf -X POST "$SF_API_URL/api/internal/health-check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SF_INTERNAL_API_KEY" \
  -d "$PAYLOAD" > /dev/null 2>&1 || true
echo "[$TIMESTAMP] Health: $STATUS (\${RESPONSE_MS}ms, HTTP $HTTP_CODE)"
HEALTH
chmod +x /opt/synapseforge/scripts/health-check.sh

# ── 9. Config sync script ─────────────────────────────────────────────────────
# Fetches latest config from SynapseForge (credentials may have changed),
# compares hash, restarts OpenClaw if updated.
cat > /opt/synapseforge/scripts/sync-config.sh << 'SYNC'
#!/bin/bash
source /etc/synapseforge.env
HASH_FILE=/opt/openclaw/.config-hash

# Fetch latest config — authenticate with gateway token
HTTP_STATUS=$(curl -sf -D /tmp/sync-headers.txt \
  -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \
  "$SF_API_URL/api/internal/instance-config/$SF_INSTANCE_ID" \
  -o /tmp/openclaw-new.json \
  -w "%{http_code}" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" != "200" ]; then
  echo "[sync] Failed to fetch config (HTTP $HTTP_STATUS)"
  exit 0
fi

# Extract content hash from response headers
NEW_HASH=$(grep -i "^x-config-hash:" /tmp/sync-headers.txt 2>/dev/null | tr -d '[:space:]\r' | cut -d: -f2 || echo "")
OLD_HASH=$(cat "$HASH_FILE" 2>/dev/null || echo "")

if [ "$NEW_HASH" = "$OLD_HASH" ] && [ -n "$OLD_HASH" ]; then
  echo "[sync] Config unchanged (hash: $NEW_HASH)"
  exit 0
fi

echo "[sync] Config changed ($OLD_HASH -> $NEW_HASH). Applying..."
chmod 600 /tmp/openclaw-new.json
cp /tmp/openclaw-new.json /opt/openclaw/openclaw.json
[ -n "$NEW_HASH" ] && echo "$NEW_HASH" > "$HASH_FILE"

# Restart OpenClaw to pick up new config
docker compose -f /opt/openclaw/docker-compose.yml restart openclaw
echo "[sync] Config applied and OpenClaw restarted (hash: $NEW_HASH)"
SYNC
chmod +x /opt/synapseforge/scripts/sync-config.sh

# ── 10. Install cron jobs ─────────────────────────────────────────────────────
# Health check every 5 min; config sync every 5 min
(crontab -l 2>/dev/null || true
 echo "*/5 * * * * /opt/synapseforge/scripts/health-check.sh >> /var/log/sf-health.log 2>&1"
 echo "*/5 * * * * /opt/synapseforge/scripts/sync-config.sh >> /var/log/sf-sync.log 2>&1"
) | crontab -

# ── 11. Wait for gateway to become available (up to 8 minutes) ────────────────
# Docker image pull can take 2-3 min on a fresh VPS; allow extra headroom.
echo "[$(date)] Waiting for OpenClaw gateway on port 18789..."
for i in $(seq 1 48); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    "http://localhost:18789" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" != "000" ]; then
    echo "[$(date)] Gateway is up! (HTTP $HTTP_CODE after $((i * 10))s)"
    break
  fi
  if [ "$i" = "48" ]; then
    echo "[$(date)] WARNING: Gateway not responding after 480s — provisioning may have failed"
    echo "[$(date)] Container logs:"
    docker compose -f /opt/openclaw/docker-compose.yml logs --tail=50 || true
  fi
  echo "[$(date)] Attempt $i/48: not ready yet, waiting 10s..."
  sleep 10
done

# ── 12. Initial health check report ──────────────────────────────────────────
/opt/synapseforge/scripts/health-check.sh

echo "[$(date)] Provisioning complete!"
`;
}
