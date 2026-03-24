#!/bin/bash
COMMAND_ID="${1:-}"
LABEL="${SNAPSHOT_LABEL:-scheduled}"

SNAPSHOT_ID=$(restic backup /home/node/.openclaw --json 2>/dev/null | jq -r 'select(.message_type=="summary") | .snapshot_id // empty')
SIZE=$(restic stats --json 2>/dev/null | jq -r '.total_size // 0')

curl -sf -X POST \
  -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
  -H "Content-Type: application/json" \
  "${SF_APP_URL}/api/internal/snapshot" \
  -d "{\"instanceId\":\"${INSTANCE_ID}\",\"snapshotId\":\"${SNAPSHOT_ID}\",\"sizeBytes\":${SIZE},\"healthy\":true,\"label\":\"${LABEL}\"}" 2>/dev/null

if [ -n "$COMMAND_ID" ]; then
  curl -sf -X PATCH \
    -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
    -H "Content-Type: application/json" \
    "${SF_APP_URL}/api/internal/commands/${INSTANCE_ID}/${COMMAND_ID}/status" \
    -d "{\"status\":\"done\",\"result\":\"${SNAPSHOT_ID}\"}" 2>/dev/null
fi
