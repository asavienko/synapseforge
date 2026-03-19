#!/usr/bin/env bash
# SynapseForge Backup Script (Restic → Backblaze B2)
# Run every hour via cron:
# 0 * * * * /opt/synapseforge/scripts/backup.sh >> /var/log/sf-backup.log 2>&1
#
# Required env vars:
#   SF_API_URL=https://app.synapseforge.ai
#   SF_INSTANCE_ID=clxxx...
#   SF_INTERNAL_API_KEY=your-secret-key
#   RESTIC_REPOSITORY=b2:synapseforge-backups:client-id
#   RESTIC_PASSWORD=your-restic-password
#   B2_ACCOUNT_ID=your-b2-account-id
#   B2_ACCOUNT_KEY=your-b2-account-key

set -euo pipefail

SF_API_URL="${SF_API_URL:?SF_API_URL is required}"
SF_INSTANCE_ID="${SF_INSTANCE_ID:?SF_INSTANCE_ID is required}"
SF_INTERNAL_API_KEY="${SF_INTERNAL_API_KEY:?SF_INTERNAL_API_KEY is required}"
OPENCLAW_DIR="${OPENCLAW_DIR:-/root/.openclaw}"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "[$TIMESTAMP] Starting backup for instance $SF_INSTANCE_ID..."

# Run Restic backup
SNAPSHOT_OUTPUT=$(restic backup "$OPENCLAW_DIR" \
  --tag "synapseforge" \
  --tag "$SF_INSTANCE_ID" \
  --json 2>&1) || { echo "Backup failed: $SNAPSHOT_OUTPUT"; exit 1; }

# Extract snapshot ID and stats
SNAPSHOT_ID=$(echo "$SNAPSHOT_OUTPUT" | grep '"snapshot_id"' | sed 's/.*"snapshot_id":"\([^"]*\)".*/\1/' | head -1)
SIZE_BYTES=$(echo "$SNAPSHOT_OUTPUT" | grep '"total_bytes_processed"' | grep -o '[0-9]*' | head -1)

echo "[$TIMESTAMP] Snapshot: $SNAPSHOT_ID (${SIZE_BYTES} bytes)"

# Prune old snapshots — keep last 24 hourly + 7 daily
restic forget \
  --tag "$SF_INSTANCE_ID" \
  --keep-hourly 24 \
  --keep-daily 7 \
  --prune

# Report to SynapseForge API
PAYLOAD=$(printf '{"instanceId":"%s","snapshotId":"%s","sizeBytes":%s,"healthy":true}' \
  "$SF_INSTANCE_ID" \
  "${SNAPSHOT_ID:-unknown}" \
  "${SIZE_BYTES:-0}")

REPORT_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SF_API_URL/api/internal/snapshot" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SF_INTERNAL_API_KEY" \
  -d "$PAYLOAD")

echo "[$TIMESTAMP] Report sent — HTTP $REPORT_CODE"
echo "[$TIMESTAMP] Backup complete ✓"
