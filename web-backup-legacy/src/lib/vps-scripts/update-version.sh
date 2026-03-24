#!/bin/bash
NEW_TAG="$1"
COMMAND_ID="$2"
NEW_IMAGE="ghcr.io/openclaw/openclaw:${NEW_TAG}"

echo "[$(date)] Updating OpenClaw to ${NEW_TAG}..."

docker pull "${NEW_IMAGE}"
sed -i "s|image: ghcr.io/openclaw/openclaw:.*|image: ${NEW_IMAGE}|" /opt/openclaw/docker-compose.yml
cd /opt/openclaw && docker compose up -d --remove-orphans

sleep 5

# Report version back
curl -sf -X POST \
  -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
  -H "Content-Type: application/json" \
  "${SF_APP_URL}/api/internal/version-report/${INSTANCE_ID}" \
  -d "{\"version\": \"${NEW_TAG}\"}" 2>/dev/null

# Mark done
curl -sf -X PATCH \
  -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
  -H "Content-Type: application/json" \
  "${SF_APP_URL}/api/internal/commands/${INSTANCE_ID}/${COMMAND_ID}/status" \
  -d '{"status":"done"}' 2>/dev/null

echo "[$(date)] Update complete."
