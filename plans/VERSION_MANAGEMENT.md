# SynapseForge — Version Management & Machine State Plan
_Last updated: 2026-03-13_

> Control system for OpenClaw versions and VPS machine state.
> Three layers: Docker version, application state (Restic), full machine (Hetzner).
> Accessible to all actors: Admin → Manager → Client, with different permission levels.

---

## Problem Statement

**Current state:**
- Docker image pinned to `ghcr.io/openclaw/openclaw:latest` — no version control
- If a new OpenClaw release breaks something, every instance is affected immediately
- Restic snapshots are recorded in DB (snapshot ID + size) but there's no command path to restore them
- No way for admin/manager/client to switch versions or roll back state through the UI
- SSH is the only way to do any of this — unscalable at 50+ instances

**What we're building:**
A three-layer version and state management system with a centralized command queue that the VPS polls, so all control flows through the dashboard.

---

## Three-Layer Architecture

```
┌────────────────────────────────────────────────────────────┐
│  Layer 3: Docker / OpenClaw Version                        │
│  What: Which openclaw binary/container is running          │
│  Speed: ~2 min (pull + restart)                            │
│  Scope: OpenClaw code only, data preserved                 │
│  Who: Admin (bulk), Manager (per-instance)                 │
├────────────────────────────────────────────────────────────┤
│  Layer 2: Application State (Restic)                       │
│  What: ~/.openclaw/ snapshot (config, memory, workspace)   │
│  Speed: ~30 seconds                                        │
│  Scope: Agent config + memory, NOT system or OpenClaw code │
│  Who: Admin, Manager, Client (request-only)                │
├────────────────────────────────────────────────────────────┤
│  Layer 1: Full Machine State (Hetzner Image)               │
│  What: Complete VPS disk snapshot                          │
│  Speed: 5–15 minutes (Hetzner creates image)               │
│  Scope: Everything — OS, Docker, OpenClaw, all data        │
│  Who: Admin only (expensive, nuclear option)               │
└────────────────────────────────────────────────────────────┘
```

**Rule of thumb:** Always try Layer 2 first. Layer 3 for code bugs. Layer 1 for total disaster recovery.

---

## Core Mechanism: Command Queue

Instead of SSH-ing into VPS to send commands (doesn't scale), VPS polls a command endpoint.
This reuses the existing polling pattern (config sync), just adds a command queue.

### DB Schema Additions

```prisma
// ─── OpenClaw Version Registry ──────────────────────────────────────────────

model OpenClawVersion {
  id          String   @id @default(cuid())
  tag         String   @unique  // "2026.3.2", "latest", "2026.2.1"
  imageRef    String             // "ghcr.io/openclaw/openclaw:2026.3.2"
  changelog   String?            // markdown release notes
  stable      Boolean  @default(false)  // admin marks as stable
  deprecated  Boolean  @default(false)  // admin marks as deprecated (warns)
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
}

// ─── Command Queue ────────────────────────────────────────────────────────────

model InstanceCommand {
  id          String   @id @default(cuid())
  instanceId  String
  type        String   // "update_version" | "rollback_restic" | "rollback_machine" |
                       // "take_restic_snapshot" | "take_machine_snapshot" | "restart"
  payload     String?  // JSON: { "tag": "2026.3.2" } | { "snapshotId": "abc123" }
  status      String   @default("pending")  // "pending"|"running"|"done"|"failed"
  requestedBy String?  // "admin" | "manager:{id}" | "user:{id}" | "system"
  note        String?  // human-readable reason (e.g. "Pre-update safety snapshot")
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
  errorMsg    String?
  instance    AIInstance @relation(fields: [instanceId], references: [id])
}

// ─── Version tracking on instance ────────────────────────────────────────────
// Add fields to AIInstance:

// currentVersion   String?   // "2026.3.2" — reported by VPS on each health check
// targetVersion    String?   // set when an update command is queued
// versionLockedAt  DateTime? // when version was last intentionally set
// autoUpdate       Boolean   @default(false) // opt-in to automatic updates

// ─── Machine Snapshots (Hetzner level) ───────────────────────────────────────

model MachineSnapshot {
  id             String   @id @default(cuid())
  instanceId     String
  hetznerImageId String   // Hetzner image ID (numeric)
  sizeGb         Float?
  status         String   @default("creating")  // "creating"|"available"|"failed"
  label          String?  // "pre-update-2026.3.2" | "manual" | "scheduled"
  createdAt      DateTime @default(now())
  instance       AIInstance @relation(...)
}

// ─── Extend existing Snapshot (Restic) model ─────────────────────────────────
// Add fields:
// label    String?  // "pre-update" | "scheduled" | "manual" | "healthy"
// tag      String?  // short human tag for rollback UI display
// triggeredBy String? // "system" | "admin" | "manager" | "user"
```

---

## Layer 3: OpenClaw Version Management

### How versions work today (the problem)
```yaml
# docker-compose.yml on VPS
image: ghcr.io/openclaw/openclaw:latest  # ← dangerous, updates on restart
```

### How they'll work
```yaml
image: ghcr.io/openclaw/openclaw:2026.3.2  # ← pinned, only updates on explicit command
```

### Version update flow

```
Admin publishes version 2026.3.3
    │
    ├── Creates OpenClawVersion record { tag: "2026.3.3", stable: true }
    ├── Admin selects instances to update (or "all on 2026.3.2")
    │
    ├── For each selected instance:
    │     1. Queue: InstanceCommand { type: "take_restic_snapshot", note: "pre-update" }
    │     2. Queue: InstanceCommand { type: "update_version", payload: { tag: "2026.3.3" } }
    │        (update is queued but NOT started until snapshot is confirmed done)
    │
    └── VPS polls, executes snapshot → then update → reports back
```

### VPS-side update script
(Added to cloud-init as `/opt/synapseforge/scripts/execute-command.sh`)

```bash
#!/bin/bash
# Called when VPS receives an "update_version" command

NEW_TAG="$1"
NEW_IMAGE="ghcr.io/openclaw/openclaw:${NEW_TAG}"

echo "[$(date)] Updating OpenClaw to ${NEW_TAG}..."

# 1. Pull new image
docker pull "${NEW_IMAGE}"

# 2. Update docker-compose.yml
sed -i "s|image: ghcr.io/openclaw/openclaw:.*|image: ${NEW_IMAGE}|" \
  /opt/openclaw/docker-compose.yml

# 3. Restart with new image
cd /opt/openclaw && docker compose up -d --remove-orphans

# 4. Report version to SynapseForge
sleep 5  # wait for gateway to start
curl -sf -X POST "${SF_APP_URL}/api/internal/version-report/${INSTANCE_ID}" \
  -H "Authorization: Bearer ${SF_API_KEY}" \
  -d "{\"version\": \"${NEW_TAG}\", \"status\": \"ok\"}"
```

### Command polling endpoint (new)

```
GET /api/internal/commands/{instanceId}
Authorization: Bearer {gatewayToken}

Response:
{
  "command": {
    "id": "cmd_123",
    "type": "update_version",
    "payload": { "tag": "2026.3.3" }
  } | null
}
```

VPS polls this every 60s (alongside config sync). When a command exists:
1. Marks command as `running` via `PATCH /api/internal/commands/{id}/status`
2. Executes the script
3. Marks command as `done` or `failed`

### Version rollback (Layer 3)

```
Manager clicks "Roll back to 2026.3.2"
    │
    ├── Queue: InstanceCommand { type: "update_version", payload: { tag: "2026.3.2" } }
    │
    └── Same update flow — Docker pulls old tag, restarts
        (old image is still cached on VPS — near-instant)
```

**Key:** Docker keeps recently-used images cached. Rolling back to a previous version is as fast as updating.

---

## Layer 2: Application State (Restic)

### Current state
- VPS runs Restic on cron, backs up `~/.openclaw/`
- Snapshot ID reported to `/api/internal/snapshot`
- No restore capability

### What to add

#### Snapshot triggers (automatic)
Every snapshot tagged with a reason:

| Trigger | Tag | Who initiates |
|---|---|---|
| Hourly cron | `scheduled` | System (cron on VPS) |
| Before any version update | `pre-update:{version}` | System (command queue) |
| Before any config save | `pre-config-change` | System (from `/api/instances/[id]/config`) |
| Manual by manager | `manual:{reason}` | Manager |
| Manual by client | `manual:user` | Client (queued command) |
| Instance marked healthy after downtime | `recovery` | Health check cron |

#### Snapshot labeling (extend current Snapshot model)
```ts
// Current record already has: instanceId, snapshotId, sizeBytes, healthy
// Add:
label:      "pre-update:2026.3.3"
tag:        "Before v2026.3.3 update"  // human readable
triggeredBy: "system"
```

#### Restore flow (new)

```
Manager opens instance → Infrastructure tab → Snapshots
    │
    ├── Sees list:
    │   [2026-03-13 11:00]  scheduled          23.4 MB  ✅ healthy
    │   [2026-03-13 10:45]  pre-update:2026.3.3  23.1 MB  ✅ healthy  ← "Before update"
    │   [2026-03-13 09:00]  scheduled          22.8 MB  ✅ healthy
    │
    ├── Manager clicks "Restore" on a snapshot
    ├── Confirmation modal: "This will restore the agent's config and memory to
    │   this point in time. The agent will restart. Continue?"
    │
    ├── POST /api/manager/instances/{id}/rollback
    │   body: { snapshotId: "abc123", type: "restic" }
    │
    ├── Server:
    │   1. Queue: InstanceCommand { type: "take_restic_snapshot", note: "pre-rollback" }
    │   2. Queue: InstanceCommand { type: "rollback_restic", payload: { snapshotId: "abc123" } }
    │
    └── VPS executes:
        restic restore abc123 --target / --include /home/node/.openclaw
        docker compose restart
        → Report rollback complete
```

#### VPS-side restore script

```bash
#!/bin/bash
SNAPSHOT_ID="$1"

echo "[$(date)] Restoring Restic snapshot ${SNAPSHOT_ID}..."

# 1. Stop OpenClaw
cd /opt/openclaw && docker compose stop

# 2. Restore snapshot (only ~/.openclaw/ contents)
restic restore "${SNAPSHOT_ID}" \
  --target "/" \
  --include "/home/node/.openclaw"

# 3. Restart
docker compose start

# 4. Report success
curl -sf -X PATCH "${SF_APP_URL}/api/internal/commands/${COMMAND_ID}/status" \
  -H "Authorization: Bearer ${SF_API_KEY}" \
  -d '{"status": "done", "result": "restored"}'

echo "[$(date)] Restore complete."
```

---

## Layer 1: Full Machine State (Hetzner Snapshots)

### When to use
- Nuclear option: OS-level corruption, Docker daemon broken, VPS completely unusable
- Pre-migration: before moving to a new server tier
- Compliance requirement: client needs a full DR snapshot

### How Hetzner snapshots work
```
POST https://api.hetzner.cloud/v1/servers/{server_id}/actions/create_image
{
  "type": "snapshot",
  "description": "sf-{instanceId}-2026.03.13"
}

→ Returns: { "image": { "id": 12345678, "status": "creating" } }
→ Poll action until status = "success" (5–15 min)
→ Store Hetzner image ID in MachineSnapshot DB record
```

### Cost
- Hetzner charges per GB stored: ~$0.01/GB/month
- CX22 disk is 40GB; typical snapshot after OS+Docker+OpenClaw: ~8–12GB
- Cost per snapshot: ~$0.10/month
- Keep last 5 machine snapshots per instance: ~$0.50/month per client

### Machine restore flow
```
Admin panel → Instance → Danger Zone → "Restore machine snapshot"
    │
    ├── Shows list of MachineSnapshot records
    ├── WARNING: "This will completely replace the current server state.
    │   Downtime: 10–15 minutes. Cannot be undone."
    │
    ├── Admin confirms → POST /api/admin/instances/{id}/machine-rollback
    │   body: { hetznerImageId: "12345678" }
    │
    └── Server:
        1. Mark instance status = "restoring"
        2. Call Hetzner: DELETE server (destroy current VPS)
        3. Call Hetzner: Create new server from image
           POST /v1/servers { image: 12345678, ... }
        4. New server boots — already has everything installed
        5. Health check cron detects it's back → mark status = "running"
```

**Important:** The new server gets a new IP. Must update `AIInstance.vpsUrl` after restore.

---

## API Routes

### Internal (VPS → SynapseForge)

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/internal/commands/{instanceId}` | VPS polls for pending command |
| `PATCH` | `/api/internal/commands/{id}/status` | VPS reports command status |
| `POST` | `/api/internal/version-report/{instanceId}` | VPS reports current version after update |
| `POST` | `/api/internal/snapshot` | VPS reports Restic snapshot ✅ (exists) |
| `POST` | `/api/internal/machine-snapshot/{instanceId}` | Callback when Hetzner snapshot is ready |

### Manager routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/manager/instances/{id}/rollback` | Queue Restic restore |
| `POST` | `/api/manager/instances/{id}/snapshot` | Queue manual Restic snapshot |
| `POST` | `/api/manager/instances/{id}/update-version` | Queue version update |
| `GET`  | `/api/manager/versions` | List available OpenClaw versions |

### Admin routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/admin/versions` | Publish new OpenClaw version |
| `PATCH` | `/api/admin/versions/{id}` | Mark version as stable/deprecated |
| `POST` | `/api/admin/instances/{id}/machine-snapshot` | Trigger Hetzner snapshot |
| `POST` | `/api/admin/instances/{id}/machine-rollback` | Restore from Hetzner image |
| `GET`  | `/api/admin/versions/instances` | See all instances + current version |
| `POST` | `/api/admin/versions/bulk-update` | Queue update on multiple instances |

### Client routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/instances/{id}/request-rollback` | Client requests rollback → notifies manager |
| `GET`  | `/api/instances/{id}/snapshots` | List snapshots ✅ (exists) |
| `GET`  | `/api/instances/{id}/version` | Get current version info |

---

## Permission Matrix

| Action | Client | Manager | Admin |
|---|---|---|---|
| View current version | ✅ | ✅ | ✅ |
| View snapshot history | ✅ | ✅ | ✅ |
| Request rollback (notifies manager) | ✅ | — | — |
| Take manual Restic snapshot | ❌ | ✅ | ✅ |
| Restore Restic snapshot | ❌ | ✅ | ✅ |
| Update OpenClaw version | ❌ | ✅ (own clients) | ✅ |
| Roll back version | ❌ | ✅ (own clients) | ✅ |
| Take Hetzner machine snapshot | ❌ | ❌ | ✅ |
| Restore Hetzner machine snapshot | ❌ | ❌ | ✅ |
| Publish new OpenClaw version | ❌ | ❌ | ✅ |
| Bulk version update (all instances) | ❌ | ❌ | ✅ |
| Toggle auto-update | ❌ | ✅ | ✅ |

---

## Auto-Update Policy

Each instance has `autoUpdate: Boolean`. When `true`:

1. Admin marks a version as `stable`
2. Cron runs nightly at 02:00 UTC
3. For each instance with `autoUpdate: true` and `currentVersion != latestStable`:
   - Queue pre-update Restic snapshot
   - Queue version update
4. If health check fails within 10 min of update:
   - Queue automatic rollback to pre-update snapshot
   - Notify manager: "Auto-rollback triggered after update to 2026.3.3"

**Auto-rollback condition:**
```ts
// In health-check cron
if (instance.currentVersion !== instance.versionBeforeUpdate &&
    instance.healthStatus === "down" &&
    minutesSinceUpdate < 10) {
  // Auto-rollback
  await queueCommand(instance.id, "rollback_restic", {
    snapshotId: lastPreUpdateSnapshot.snapshotId
  }, "system")
}
```

---

## UI Specifications

### Client Dashboard — Infrastructure Tab (extend existing)

```
┌─────────────────────────────────────────────────────────┐
│ Version                                                 │
│ OpenClaw 2026.3.2  [Latest ✅]  Auto-update: OFF [toggle]│
│                                                         │
│ Snapshots (application state)                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📸 2026-03-13 11:00  scheduled        23.4 MB  ✅   │ │
│ │ 📸 2026-03-13 09:00  scheduled        23.1 MB  ✅   │ │
│ │ 📸 2026-03-12 11:00  scheduled        22.8 MB  ✅   │ │
│ └─────────────────────────────────────────────────────┘ │
│ [Request rollback →]  (sends message to manager)       │
└─────────────────────────────────────────────────────────┘
```

### Manager Portal — Instance View (extend existing)

```
┌─────────────────────────────────────────────────────────┐
│ Version Management                                      │
│                                                         │
│ Current:  2026.3.2  [Update to 2026.3.3 →]             │
│ Status:   ✅ Up to date                                 │
│                                                         │
│ Snapshots                                               │
│ [+ Take snapshot now]                                   │
│                                                         │
│ 📸 pre-update:2026.3.3  2026-03-13 10:45  23.1 MB  ✅ [Restore]│
│ 📸 scheduled            2026-03-13 09:00  22.8 MB  ✅ [Restore]│
│ 📸 manual:config-test   2026-03-12 15:00  22.6 MB  ✅ [Restore]│
│                                                         │
│ Command Queue                                           │
│ ⏳ take_restic_snapshot  pending    requested 2 min ago  │
│ ✅ update_version        done       2026-03-12           │
└─────────────────────────────────────────────────────────┘
```

### Admin Panel — Version Management Page (new page)

```
/admin/versions

┌─────────────────────────────────────────────────────────────────┐
│ OpenClaw Versions                            [+ Publish version] │
├─────────────────────────────────────────────────────────────────┤
│ 2026.3.3  ✅ Stable  Published 2026-03-13   [Mark deprecated]   │
│ 2026.3.2  ✅ Stable  Published 2026-03-12   [Mark deprecated]   │
│ 2026.3.1  ⚠️ Deprecated  Published 2026-03-10                   │
├─────────────────────────────────────────────────────────────────┤
│ Instance Coverage                                               │
│ 2026.3.3 ████████████████░░░░  16/20 instances                  │
│ 2026.3.2 ████░░░░░░░░░░░░░░░░   4/20 instances                  │
│                                                                 │
│ [Bulk update all 2026.3.2 → 2026.3.3]                          │
├─────────────────────────────────────────────────────────────────┤
│ Per-instance version table                                      │
│ Client          Version    Status    Auto-update  Action        │
│ Elena (Lumina)  2026.3.3  ✅ healthy    OFF       [Update][Snap]│
│ John (Acme)     2026.3.2  ✅ healthy    ON        [Update][Snap]│
│ Sara (FitLife)  2026.3.1  ⚠️ deprecated OFF       [Update][Snap]│
└─────────────────────────────────────────────────────────────────┘
```

---

## VPS-Side Changes (cloud-init additions)

### 1. Pin Docker image (immediate fix)
```bash
# Current (dangerous):
image: ghcr.io/openclaw/openclaw:latest

# Fixed in cloud-init generation:
image: ghcr.io/openclaw/openclaw:${OPENCLAW_VERSION}  # passed from provisioning
```

Add `openclawVersion` param to `generateCloudInit()` and `provisionInstance()`.

### 2. Command polling script
```bash
# /opt/synapseforge/scripts/poll-commands.sh
#!/bin/bash
# Runs every 60s via cron

PENDING=$(curl -sf \
  -H "Authorization: Bearer ${GATEWAY_TOKEN}" \
  "${SF_APP_URL}/api/internal/commands/${INSTANCE_ID}")

COMMAND_TYPE=$(echo "$PENDING" | jq -r '.command.type // empty')
COMMAND_ID=$(echo "$PENDING" | jq -r '.command.id // empty')

if [ -z "$COMMAND_TYPE" ]; then exit 0; fi

# Mark as running
curl -sf -X PATCH \
  -H "Authorization: Bearer ${SF_API_KEY}" \
  "${SF_APP_URL}/api/internal/commands/${COMMAND_ID}/status" \
  -d '{"status":"running"}'

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
    /opt/synapseforge/scripts/take-snapshot.sh "$COMMAND_ID"
    ;;
  "restart")
    cd /opt/openclaw && docker compose restart
    curl -sf -X PATCH ... '{"status":"done"}'
    ;;
esac
```

### 3. Restic snapshot script (formalize existing)
```bash
# /opt/synapseforge/scripts/take-snapshot.sh
#!/bin/bash
COMMAND_ID="${1:-}"

SNAPSHOT_ID=$(restic backup /home/node/.openclaw \
  --json 2>/dev/null | \
  jq -r '.snapshot_id // empty')

SIZE=$(restic stats --json | jq -r '.total_size // 0')

# Report to SynapseForge
curl -sf -X POST \
  -H "Authorization: Bearer ${SF_API_KEY}" \
  "${SF_APP_URL}/api/internal/snapshot" \
  -d "{
    \"instanceId\": \"${INSTANCE_ID}\",
    \"snapshotId\": \"${SNAPSHOT_ID}\",
    \"sizeBytes\": ${SIZE},
    \"healthy\": true,
    \"label\": \"${SNAPSHOT_LABEL:-scheduled}\"
  }"

# Mark command done if triggered by command
if [ -n "$COMMAND_ID" ]; then
  curl -sf -X PATCH \
    "${SF_APP_URL}/api/internal/commands/${COMMAND_ID}/status" \
    -d "{\"status\":\"done\",\"result\":\"${SNAPSHOT_ID}\"}"
fi
```

### 4. Version reporting on health check
Extend the existing health check call to include version:
```bash
# In health check script (already runs every 5 min)
OPENCLAW_VERSION=$(docker inspect ghcr.io/openclaw/openclaw \
  --format '{{index .Config.Labels "org.opencontainers.image.version"}}' 2>/dev/null \
  || echo "unknown")

curl -sf -X POST "${SF_APP_URL}/api/internal/health/${INSTANCE_ID}" \
  -H "Authorization: Bearer ${SF_API_KEY}" \
  -d "{\"status\":\"ok\",\"responseMs\":${LATENCY},\"version\":\"${OPENCLAW_VERSION}\"}"
```

---

## Cron Jobs (Vercel side)

| Schedule | Route | Purpose |
|---|---|---|
| Every 5 min | `/api/internal/health-check` | Health check ✅ exists |
| Every 10 min | `/api/internal/command-timeout` | Mark commands stuck >10min as `failed` |
| Daily 02:00 UTC | `/api/internal/auto-update` | Push updates to instances with `autoUpdate: true` |
| Daily 03:00 UTC | `/api/internal/machine-snapshot-schedule` | Take weekly Hetzner snapshots |
| Daily 04:00 UTC | `/api/internal/snapshot-cleanup` | Delete old machine snapshots (keep last 5) |

---

## Build Order

### Phase 1 (foundation — 3 days)
1. `InstanceCommand` model + migration
2. `GET /api/internal/commands/{instanceId}` endpoint
3. `PATCH /api/internal/commands/{id}/status` endpoint
4. VPS `poll-commands.sh` script
5. Extend cloud-init: pin Docker version, add command polling cron
6. Add `currentVersion` field to `AIInstance`, populate from health check

### Phase 2 (Restic rollback — 2 days)
7. Extend `Snapshot` model: add `label`, `tag`, `triggeredBy`
8. VPS `rollback-restic.sh` + `take-snapshot.sh` scripts
9. `POST /api/manager/instances/{id}/rollback` route
10. `POST /api/manager/instances/{id}/snapshot` route
11. Snapshot UI in manager portal with Restore button
12. "Request rollback" button in client Infrastructure tab

### Phase 3 (version management — 3 days)
13. `OpenClawVersion` model + admin UI to publish versions
14. `POST /api/admin/versions` — publish version
15. `POST /api/manager/instances/{id}/update-version` — queue update
16. VPS `update-version.sh` script
17. Auto-rollback on health failure post-update
18. Version display in dashboard + manager portal

### Phase 4 (Hetzner machine snapshots — 2 days)
19. `MachineSnapshot` model
20. `POST /api/admin/instances/{id}/machine-snapshot` — trigger Hetzner snapshot
21. Hetzner snapshot polling + completion callback
22. `POST /api/admin/instances/{id}/machine-rollback` — restore from image
23. Admin panel: Machine Snapshots section

### Phase 5 (auto-update + bulk — 2 days)
24. `autoUpdate` field on `AIInstance`
25. Nightly auto-update cron
26. Auto-rollback cron (health check post-update)
27. Admin bulk-update UI
28. Version coverage visualization (bar chart per version)

**Total: ~12 days of dev time**

---

## Edge Cases & Safety Rules

1. **Never queue a version update without a pre-update snapshot.** The command queue enforces this: update command is rejected if no successful Restic snapshot exists in the last 5 minutes.

2. **Only one command runs at a time per instance.** VPS picks up one command, marks it `running`, finishes before polling for the next. Prevents race conditions.

3. **Command timeout:** If a command stays `running` for >10 minutes, the timeout cron marks it `failed` and sends an alert to the manager. VPS may have died mid-execution.

4. **Rollback creates a checkpoint first.** Before restoring any snapshot, the system automatically takes a new snapshot tagged `pre-rollback`. If the rollback makes things worse, you can restore from the pre-rollback snapshot.

5. **Hetzner snapshot before machine rollback.** Before destroying and recreating from a machine image, always create a fresh Hetzner snapshot of the current state. The current state may have data the image doesn't.

6. **Version deprecation warning.** If an instance is running a deprecated version and auto-update is off, the manager receives a weekly warning: "Instance for Elena is running deprecated version 2026.3.1. Please update."

7. **IP change after machine restore.** When restoring from a Hetzner image, the new VPS gets a new IP. The system must: (a) update `AIInstance.vpsUrl`, (b) re-register Telegram webhook, (c) re-register any other channel webhooks.

---

_Three layers, one command queue, zero SSH required for routine operations._
