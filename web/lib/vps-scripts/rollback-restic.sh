#!/bin/bash
SNAPSHOT_ID="$1"
COMMAND_ID="$2"

echo "[$(date)] Restoring Restic snapshot ${SNAPSHOT_ID}..."

cd /opt/openclaw && docker compose stop
restic restore "${SNAPSHOT_ID}" --target "/" --include "/home/node/.openclaw"
docker compose start

curl -sf -X PATCH \
  -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
  -H "Content-Type: application/json" \
  "${SF_APP_URL}/api/internal/commands/${INSTANCE_ID}/${COMMAND_ID}/status" \
  -d '{"status":"done","result":"restored"}' 2>/dev/null

echo "[$(date)] Restore complete."
