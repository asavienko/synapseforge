#!/usr/bin/env bash
# SynapseForge Health Check Script
# Run on each client VPS every 5 minutes via cron:
# */5 * * * * /opt/synapseforge/scripts/health-check.sh >> /var/log/sf-health.log 2>&1
#
# Required env vars (set in /etc/environment or .env on VPS):
#   SF_API_URL=https://app.synapseforge.ai        # your web app URL
#   SF_INSTANCE_ID=clxxx...                       # instance ID from SynapseForge dashboard
#   SF_INTERNAL_API_KEY=your-secret-key           # shared secret
#   OPENCLAW_GATEWAY_URL=http://localhost:3000    # local OpenClaw gateway URL

set -euo pipefail

SF_API_URL="${SF_API_URL:?SF_API_URL is required}"
SF_INSTANCE_ID="${SF_INSTANCE_ID:?SF_INSTANCE_ID is required}"
SF_INTERNAL_API_KEY="${SF_INTERNAL_API_KEY:?SF_INTERNAL_API_KEY is required}"
OPENCLAW_GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-http://localhost:3001}"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
STATUS="healthy"
RESPONSE_MS=""
ERROR_MSG=""

echo "[$TIMESTAMP] Running health check for instance $SF_INSTANCE_ID..."

# Measure response time and check gateway
START_MS=$(date +%s%3N)
HTTP_CODE=$(curl -s -o /tmp/sf-health-response.txt -w "%{http_code}" \
  --max-time 10 \
  "$OPENCLAW_GATEWAY_URL/status" 2>/tmp/sf-health-error.txt || echo "000")
END_MS=$(date +%s%3N)
RESPONSE_MS=$((END_MS - START_MS))

if [ "$HTTP_CODE" = "000" ]; then
  STATUS="down"
  ERROR_MSG="Connection failed: $(cat /tmp/sf-health-error.txt 2>/dev/null | head -1)"
elif [ "$HTTP_CODE" -ge 500 ]; then
  STATUS="degraded"
  ERROR_MSG="HTTP $HTTP_CODE"
elif [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
  STATUS="healthy"
else
  STATUS="degraded"
  ERROR_MSG="Unexpected HTTP $HTTP_CODE"
fi

echo "[$TIMESTAMP] Status: $STATUS (${RESPONSE_MS}ms, HTTP $HTTP_CODE)"

# Report to SynapseForge API
PAYLOAD=$(printf '{"instanceId":"%s","status":"%s","responseMs":%d%s}' \
  "$SF_INSTANCE_ID" \
  "$STATUS" \
  "$RESPONSE_MS" \
  "${ERROR_MSG:+,\"error\":\"$ERROR_MSG\"}")

REPORT_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$SF_API_URL/api/internal/health-check" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SF_INTERNAL_API_KEY" \
  -d "$PAYLOAD")

echo "[$TIMESTAMP] Report sent — HTTP $REPORT_CODE"
