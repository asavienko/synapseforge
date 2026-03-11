// Generates cloud-init user_data for Hetzner VPS provisioning
// Uses a BOOTSTRAP approach: cloud-init fetches config from our API using a one-time token
// This avoids raw API keys appearing in Hetzner metadata

export function generateCloudInit(params: {
  instanceId: string;
  gatewayToken: string;
  appUrl: string;         // e.g. "https://synapseforge-mu.vercel.app"
  bootstrapToken: string; // one-time token to fetch openclaw.json5
  sfApiKey: string;       // INTERNAL_API_KEY for health check reporting
}): string {
  const { instanceId, gatewayToken, appUrl, bootstrapToken, sfApiKey } = params;

  // Note: Variables like ${instanceId} are JS template literal interpolation (expanded at generation time).
  // Variables like \${TELEGRAM_BOT_TOKEN} are literal bash variable references (kept as-is in the script).
  return `#!/bin/bash
set -euo pipefail
exec > /var/log/synapseforge-provision.log 2>&1

echo "[$(date)] Starting SynapseForge provisioning for instance ${instanceId}..."

# 1. System setup
apt-get update -qq
apt-get install -y curl ca-certificates gnupg cron restic

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 3. Create openclaw directory
mkdir -p /opt/openclaw
cd /opt/openclaw

# 4. Fetch OpenClaw config from SynapseForge API (one-time bootstrap token)
echo "[$(date)] Fetching OpenClaw config..."
curl -sf \\
  -H "Authorization: Bearer ${bootstrapToken}" \\
  "${appUrl}/api/internal/bootstrap/${instanceId}" \\
  -o /opt/openclaw/openclaw.json5 || {
  echo "ERROR: Failed to fetch config"
  exit 1
}
echo "[$(date)] Config fetched."

# 5. Write Docker Compose file
cat > /opt/openclaw/docker-compose.yml << 'COMPOSE'
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    restart: always
    network_mode: host
    environment:
      - OPENCLAW_GATEWAY_TOKEN=${gatewayToken}
      - OPENCLAW_CONFIG_PATH=/home/node/.openclaw/openclaw.json5
    volumes:
      - openclaw_data:/home/node/.openclaw
      - /opt/openclaw/openclaw.json5:/home/node/.openclaw/openclaw.json5:ro
    command: ["openclaw", "gateway", "--bind", "lan", "--port", "18789"]

volumes:
  openclaw_data:
COMPOSE

# 6. Start OpenClaw
docker compose up -d
echo "[$(date)] OpenClaw started."

# 7. Write env file for scripts
cat > /etc/synapseforge.env << ENV
SF_API_URL=${appUrl}
SF_INSTANCE_ID=${instanceId}
SF_INTERNAL_API_KEY=${sfApiKey}
OPENCLAW_GATEWAY_URL=http://localhost:18789
ENV
chmod 600 /etc/synapseforge.env

# 8. Write health check script
mkdir -p /opt/synapseforge/scripts
cat > /opt/synapseforge/scripts/health-check.sh << 'HEALTH'
#!/bin/bash
set -euo pipefail
source /etc/synapseforge.env
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
START_MS=$(date +%s%3N)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$OPENCLAW_GATEWAY_URL" 2>/dev/null || echo "000")
END_MS=$(date +%s%3N)
RESPONSE_MS=$((END_MS - START_MS))
if [ "$HTTP_CODE" = "000" ]; then STATUS="down"; ERROR='"error":"Connection failed"'; else STATUS="healthy"; ERROR=''; fi
PAYLOAD=$(printf '{"instanceId":"%s","status":"%s","responseMs":%d%s}' "$SF_INSTANCE_ID" "$STATUS" "$RESPONSE_MS" "\${ERROR:+,$ERROR}")
curl -sf -X POST "$SF_API_URL/api/internal/health-check" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $SF_INTERNAL_API_KEY" \\
  -d "$PAYLOAD" > /dev/null 2>&1 || true
echo "[$TIMESTAMP] Health: $STATUS (\${RESPONSE_MS}ms)"
HEALTH
chmod +x /opt/synapseforge/scripts/health-check.sh

# 9. Write config sync script
cat > /opt/synapseforge/scripts/sync-config.sh << 'SYNC'
#!/bin/bash
set -euo pipefail
source /etc/synapseforge.env
HASH_FILE=/opt/openclaw/.config-hash

# Fetch latest config with hash header
RESPONSE=$(curl -sf -D - \
  -H "Authorization: Bearer $OPENCLAW_GATEWAY_TOKEN" \
  "$SF_API_URL/api/internal/instance-config/$SF_INSTANCE_ID" \
  -o /tmp/openclaw-new.json5 2>/dev/null) || { echo "[sync] Failed to fetch config"; exit 0; }

NEW_HASH=$(echo "$RESPONSE" | grep -i "^x-config-hash:" | tr -d '[:space:]' | cut -d: -f2)
OLD_HASH=$(cat "$HASH_FILE" 2>/dev/null || echo "")

if [ "$NEW_HASH" = "$OLD_HASH" ] && [ -n "$OLD_HASH" ]; then
  echo "[sync] Config unchanged (hash: $NEW_HASH)"
  exit 0
fi

echo "[sync] Config changed ($OLD_HASH -> $NEW_HASH). Applying..."
cp /tmp/openclaw-new.json5 /opt/openclaw/openclaw.json5
echo "$NEW_HASH" > "$HASH_FILE"

# Restart OpenClaw Docker container
docker compose -f /opt/openclaw/docker-compose.yml restart openclaw
echo "[sync] Restarted. New hash: $NEW_HASH"
SYNC
chmod +x /opt/synapseforge/scripts/sync-config.sh

# 9b. Install cron (health check + config sync)
(crontab -l 2>/dev/null || true; echo "*/5 * * * * /opt/synapseforge/scripts/health-check.sh >> /var/log/sf-health.log 2>&1") | crontab -
(crontab -l 2>/dev/null || true; echo "*/5 * * * * /opt/synapseforge/scripts/sync-config.sh >> /var/log/sf-sync.log 2>&1") | crontab -

# 10. Wait for gateway to start (up to 3 minutes)
echo "[$(date)] Waiting for gateway to start..."
for i in $(seq 1 18); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:18789" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" != "000" ]; then
    echo "[$(date)] Gateway is up (HTTP $HTTP_CODE)!"
    break
  fi
  echo "[$(date)] Attempt $i: waiting 10s..."
  sleep 10
done

# 11. Run initial health check
/opt/synapseforge/scripts/health-check.sh

echo "[$(date)] Provisioning complete!"
`;
}
