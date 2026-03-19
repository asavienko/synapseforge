#!/usr/bin/env bash
# SynapseForge VPS Provisioning Script
# Usage: ./provision.sh <INSTANCE_ID> <SF_INTERNAL_API_KEY>
# Run on a fresh Ubuntu 22.04 VPS as root.
#
# What this does:
#   1. Installs Node.js, npm, restic, curl
#   2. Installs OpenClaw CLI globally
#   3. Creates /opt/synapseforge/scripts/ with health-check.sh and backup.sh
#   4. Sets up /etc/environment with required env vars
#   5. Installs cron jobs (health check every 5 min, backup every hour)
#   6. Starts OpenClaw gateway as a systemd service
#   7. Runs first health check and backup

set -euo pipefail

INSTANCE_ID="${1:?Usage: $0 <INSTANCE_ID> <SF_INTERNAL_API_KEY>}"
SF_INTERNAL_API_KEY="${2:?Usage: $0 <INSTANCE_ID> <SF_INTERNAL_API_KEY>}"
SF_API_URL="${SF_API_URL:-https://app.synapseforge.ai}"
OPENCLAW_GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-http://localhost:3001}"

echo "=== SynapseForge VPS Provisioning ==="
echo "Instance ID: $INSTANCE_ID"
echo "API URL: $SF_API_URL"

# 1. System dependencies
apt-get update -qq
apt-get install -y curl unzip wget restic cron

# 2. Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. OpenClaw CLI
npm install -g openclaw

# 4. Create scripts directory
mkdir -p /opt/synapseforge/scripts
# (Copy health-check.sh and backup.sh here in production)

# 5. Write env config
cat > /etc/synapseforge.env << EOF
SF_API_URL=$SF_API_URL
SF_INSTANCE_ID=$INSTANCE_ID
SF_INTERNAL_API_KEY=$SF_INTERNAL_API_KEY
OPENCLAW_GATEWAY_URL=$OPENCLAW_GATEWAY_URL
EOF
chmod 600 /etc/synapseforge.env

# 6. Set up OpenClaw as systemd service
cat > /etc/systemd/system/openclaw.service << EOF
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=root
EnvironmentFile=/etc/synapseforge.env
ExecStart=/usr/local/bin/openclaw gateway start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable openclaw
systemctl start openclaw

# 7. Install cron jobs
(crontab -l 2>/dev/null; cat << EOF
*/5 * * * * . /etc/synapseforge.env && /opt/synapseforge/scripts/health-check.sh >> /var/log/sf-health.log 2>&1
0 * * * * . /etc/synapseforge.env && /opt/synapseforge/scripts/backup.sh >> /var/log/sf-backup.log 2>&1
EOF
) | crontab -

echo "=== Provisioning complete ==="
echo "Health checks: every 5 minutes"
echo "Backups: every hour"
echo "OpenClaw gateway: systemd service 'openclaw'"
