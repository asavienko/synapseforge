#!/bin/bash
# Runs every 60s via cron on the VPS
# Add to cloud-init: "* * * * * /opt/synapseforge/scripts/poll-commands.sh"

set -e

PENDING=$(curl -sf \
  -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
  "${SF_APP_URL}/api/internal/commands/${INSTANCE_ID}" 2>/dev/null || echo '{}')

COMMAND_TYPE=$(echo "$PENDING" | jq -r '.command.type // empty' 2>/dev/null)
COMMAND_ID=$(echo "$PENDING" | jq -r '.command.id // empty' 2>/dev/null)

if [ -z "$COMMAND_TYPE" ]; then exit 0; fi

# Mark as running
curl -sf -X PATCH \
  -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
  -H "Content-Type: application/json" \
  "${SF_APP_URL}/api/internal/commands/${INSTANCE_ID}/${COMMAND_ID}/status" \
  -d '{"status":"running"}' 2>/dev/null

case "$COMMAND_TYPE" in
  "update_version")
    TAG=$(echo "$PENDING" | jq -r '.command.payload.tag')
    /opt/synapseforge/scripts/update-version.sh "$TAG" "$COMMAND_ID"
    ;;
  "rollback_restic")
    SNAP=$(echo "$PENDING" | jq -r '.command.payload.snapshotId')
    /opt/synapseforge/scripts/rollback-restic.sh "$SNAP" "$COMMAND_ID"
    ;;
  "take_restic_snapshot")
    NOTE=$(echo "$PENDING" | jq -r '.command.note // "scheduled"')
    SNAPSHOT_LABEL="$NOTE" /opt/synapseforge/scripts/take-snapshot.sh "$COMMAND_ID"
    ;;
  "restart")
    cd /opt/openclaw && docker compose restart
    curl -sf -X PATCH \
      -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
      -H "Content-Type: application/json" \
      "${SF_APP_URL}/api/internal/commands/${INSTANCE_ID}/${COMMAND_ID}/status" \
      -d '{"status":"done"}' 2>/dev/null
    ;;
esac
