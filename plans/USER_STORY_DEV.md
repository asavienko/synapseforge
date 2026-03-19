# SynapseForge — User Story: Development Perspective
_Last updated: 2026-03-13_

> This document translates the product user story into a developer-readable spec.
> For each step in the user journey, it maps the route, DB models, components,
> data flow, and acceptance criteria. Use this as the source of truth when
> implementing or reviewing features.

---

## Actors

| Actor | Description |
|---|---|
| **Client** | End user — business owner who signs up for a managed AI instance |
| **Manager** | SynapseForge staff member assigned to one or more clients |
| **Admin** | Internal superuser — manages manager assignments, analytics, platform |
| **Instance (VPS)** | The running OpenClaw gateway on a Hetzner server — polls SynapseForge for config |

---

## Journey Map (Numbered Steps)

```
[1] Sign Up → [2] Verify Email → [3] Onboarding → [4] Dashboard
    → [5] Instance Created → [6] Manager Notified
    → [7] Manager Provisions VPS → [8] VPS Bootstraps
    → [9] Client Sets Up Channels → [10] Credentials Sync to VPS
    → [11] Instance Goes Live → [12] Ongoing: Monitoring + Messaging
    → [13] Upgrade (Stripe)
```

---

## Step 1 — Sign Up

**User action:** Fills out email + password (or Google OAuth) on `/sign-up`.

### Routes
- `POST /api/auth/register` — creates `User` record with `plan: "free"`, `onboardingDone: false`
- `POST /api/auth/[...nextauth]` — NextAuth session (Google OAuth path)

### DB
```prisma
User {
  email         // unique
  password      // bcrypt hash (null if OAuth)
  plan          // "free" (default)
  onboardingDone // false (default)
}
```

### Post-signup
- `POST /api/auth/resend-verification` → sends email via Resend
- Resend click → `GET /api/auth/verify?token=...` → sets `emailVerified`

### Acceptance criteria
- [ ] User can register with email + password
- [ ] User can register with Google OAuth
- [ ] Email verification is sent after registration
- [ ] Unverified users see `EmailVerifyBanner` in dashboard
- [ ] Verified users do NOT see the banner (`VerifiedSuccessBanner` shown once)

---

## Step 2 — Onboarding

**User action:** After first login, redirected to `/onboarding` if `onboardingDone === false`.

### Route
`POST /api/onboarding`

### Request body
```ts
{
  business: string,          // "Lumina Wellness Studio"
  industry: string,          // "Health & Wellness"
  useCase: string,           // "Customer support and appointment FAQs"
  credentials?: {
    openai_api_key?: string,
    anthropic_api_key?: string,
    openrouter_api_key?: string,
    telegram_bot_token?: string,
  }
}
```

### What the route does (in order)
1. Sets `User.onboardingDone = true`, writes `onboardingData` as JSON string
2. Saves any provided credentials to `InstanceCredential` (AES-256-GCM encrypted via `lib/crypto.ts`)
3. Marks `AIInstance.configSynced = false` if credentials were saved
4. Sends manager alert email via `lib/email.ts → email.newUserAlert()`
5. Creates first in-app welcome `Message` from manager (if no prior conversation exists)

### DB writes
```
User.onboardingDone = true
User.onboardingData = "{...}"
InstanceCredential { instanceId, key, value (encrypted) }
AIInstance.configSynced = false
Message { senderType: "manager", body: "Hi [name]! I've reviewed..." }
```

### Component
`/onboarding/page.tsx` — multi-step form (business info → use case → optional API keys)

### Acceptance criteria
- [ ] User cannot skip onboarding (middleware redirects if `!onboardingDone`)
- [ ] Credentials are encrypted before hitting the DB (never stored plaintext)
- [ ] Manager receives email notification with client context
- [ ] Welcome message appears in client's Messages tab immediately
- [ ] If user has no instance yet, `instanceId` in response is `null` (handled gracefully)

---

## Step 3 — Dashboard & Instance View

**User action:** Arrives at `/dashboard` after onboarding.

### Key pages
| Route | Purpose |
|---|---|
| `/dashboard` | Overview: instance count, manager card, quick stats |
| `/dashboard/instances` | List all `AIInstance` records for this user |
| `/dashboard/instances/[id]` | Instance detail: status, channels, credentials, logs, snapshots |
| `/dashboard/messages` | Threaded conversation with assigned manager |
| `/dashboard/billing` | Stripe subscription management |
| `/dashboard/settings` | Profile, password, email prefs |

### Instance auto-creation
When a user completes onboarding, a default `AIInstance` is auto-created if none exists:

```ts
// Triggered inside POST /api/onboarding or POST /api/auth/register
await prisma.aIInstance.create({
  data: {
    name: "My AI Assistant",
    type: "assistant",
    status: "stopped",
    tier: "minimal",
    userId: user.id,
  }
})
```

### Instance status states
```
"stopped"      → Created, not provisioned
"pending"      → Provisioning triggered, waiting for VPS
"running"      → VPS up, gateway responding
"error"        → Provision failed or health check failing
```

### Acceptance criteria
- [ ] Dashboard loads within 1s (SSR with Prisma query)
- [ ] Instance card shows real-time `healthStatus` (polled via `GET /api/instances/[id]/health`)
- [ ] Manager card shows name + "Message" button
- [ ] Unread message count badge on Messages nav item

---

## Step 4 — Manager Assigns & Provisions Instance

**Manager action:** Logs into `/manager`, reviews new client, provisions their VPS.

### Manager portal route
`GET /manager` → `ManagerClient.tsx`

### Provision flow

#### 4a. Manager triggers provision
`POST /api/manager/instances/[id]/provision`

This calls `lib/provisioning.ts → provisionInstance(instanceId, region)` which:

1. Generates ED25519 SSH key pair (stored encrypted on `AIInstance.sshPrivateKey`)
2. Generates `bootstrapToken` (32-byte random hex, one-time use)
3. Generates `gatewayToken` (32-byte random hex, used for all API auth)
4. Calls **Hetzner API** `POST /v1/servers` with:
   - Server type from `TIER_TO_SERVER[instance.tier]` (e.g. `cx22` for minimal)
   - `user_data` = cloud-init script from `lib/cloud-init.ts`
5. Saves to DB:
```prisma
AIInstance {
  provisionStatus: "provisioning",
  vpsProvider: "hetzner",
  vpsServerId: "12345678",   // Hetzner numeric ID
  gatewayToken: "abc123...", // for ongoing auth
  bootstrapToken: "xyz789...", // one-time config delivery
  sshPrivateKey: encrypt("-----BEGIN PRIVATE KEY-----...")
}
```

#### 4b. Cloud-init on VPS
The `user_data` script (generated by `lib/cloud-init.ts`) runs on first boot:
```bash
# Installs Node.js, OpenClaw, creates systemd service
# Calls back to SynapseForge bootstrap endpoint:
curl -X POST https://app.synapseforge.ai/api/internal/bootstrap/{instanceId} \
  -H "Authorization: Bearer {bootstrapToken}"
```

#### 4c. Bootstrap endpoint
`POST /api/internal/bootstrap/[instanceId]`
- Validates `bootstrapToken` (must match DB, not yet used)
- Returns full config payload: agent persona, credentials (decrypted for this one call), channel tokens
- Sets `bootstrapUsed = true` on instance
- Updates `provisionStatus: "ready"`, `status: "running"`
- Saves `vpsUrl` (IP:port) to `AIInstance`

#### 4d. Provision complete callback
`POST /api/internal/provision-complete/[instanceId]`
- Called by VPS after OpenClaw is started and gateway is responding
- Updates `AIInstance.status = "running"`, `provisionStatus = "ready"`

### Acceptance criteria
- [ ] Manager can provision with one click from manager portal
- [ ] VPS is live within ~3 minutes of triggering (Hetzner cx22 boot time)
- [ ] Bootstrap token is single-use (second call returns 403)
- [ ] SSH private key is stored encrypted, never logged
- [ ] Provision timeout cron (`/api/internal/provision-timeout`) marks instance as `error` after 10 min

---

## Step 5 — Channel Setup (Client-Side)

**User action:** In instance detail page, clicks "Connect Telegram", enters bot token.

### Telegram setup route
`POST /api/instances/[id]/setup-telegram`

#### Flow
1. Validates ownership (`AIInstance.userId === session.user.id`)
2. Calls `https://api.telegram.org/bot{token}/getMe` to validate token
3. If valid: encrypts token → upserts `InstanceCredential { key: "telegram_bot_token" }`
4. Updates `AIInstance.telegramBotUsername = "@MyBot"`, `configSynced = false`
5. Logs to `ActivityLog { event: "config_changed", details: "Telegram connected: @MyBot" }`
6. If `instance.vpsUrl` exists: fires `POST {vpsUrl}/hooks/wake` (fire-and-forget) to nudge VPS
7. If `setWebhook: true`: calls `setWebhook` on Telegram API pointing to `{vpsUrl}/telegram`

### Discord setup route
`POST /api/instances/[id]/setup-discord`
- Same pattern: validate token via Discord API, save encrypted, set `discordBotUsername`, `discordBotId`

### Slack setup route
`POST /api/instances/[id]/setup-slack`
- Validates app token + bot token, saves both, sets `slackBotName`, `slackTeamName`

### Component
`InstanceSetupWizard.tsx` — tab-based wizard: Telegram → Discord → Slack → API Keys

### Acceptance criteria
- [ ] Invalid bot token shows human-readable error (not raw Telegram API message)
- [ ] `configSynced = false` is set whenever a credential changes
- [ ] Bot username is displayed in the UI after successful connection
- [ ] VPS is notified of credential change without blocking the API response

---

## Step 6 — Credentials Sync to VPS

The VPS polls SynapseForge for config updates. The dashboard also has a manual "Sync Now" button.

### Polling endpoint (VPS calls this)
`GET /api/internal/instance-config/[instanceId]`
- Authenticated by `gatewayToken` (Bearer header)
- Returns decrypted config: agent settings + all credentials
- VPS writes to `~/.openclaw/openclaw.json` and restarts channels if needed

### Manual sync (client triggers)
`POST /api/instances/[id]/sync-request`
- Sets `AIInstance.syncRequested = true`
- VPS picks this up on next poll and fetches fresh config immediately

### Dashboard sync status
`GET /api/instances/[id]/sync-now`
- Returns `{ configSynced, syncRequested, lastSyncAt }`
- UI shows "Sync pending..." badge when `configSynced = false`

### Acceptance criteria
- [ ] VPS polls config endpoint every 60 seconds
- [ ] Credentials are decrypted server-side; VPS never sees encrypted values
- [ ] "Sync Now" button sets `syncRequested = true` and shows confirmation
- [ ] Once VPS confirms sync, `configSynced = true` is set (via provision-complete or wake hook)

---

## Step 7 — Health Monitoring

### Health check cron
`POST /api/internal/health-check` (called by Vercel cron, every 5 min)

#### Per instance:
1. `GET {instance.vpsUrl}/api/v1/health` with `Authorization: Bearer {gatewayToken}`
2. Saves to `HealthCheck { status, responseMs, error }`
3. Updates `AIInstance.healthStatus`, `lastCheckedAt`
4. If status changed to `"down"`: sends alert email to manager

### Client-visible health
`GET /api/instances/[id]/health`
- Returns last 10 `HealthCheck` records + current `healthStatus`
- Dashboard polls this every 30s

### DB
```prisma
HealthCheck { instanceId, status, responseMs, error, checkedAt }
AIInstance { healthStatus, lastCheckedAt }
```

### Acceptance criteria
- [ ] Health check runs every 5 min via cron
- [ ] Manager receives email if instance goes from healthy → down
- [ ] Client dashboard shows 🟢/🟡/🔴 status with last-checked timestamp
- [ ] Health history chart shows last 24h uptime

---

## Step 8 — Manager ↔ Client Messaging

### Models
```prisma
Message {
  body, senderType ("user"|"manager"), read, createdAt
  userId, managerId
}
```

### Routes
| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/messages` | Fetch thread (paginated) |
| `POST` | `/api/messages` | Send message (client or manager) |
| `GET` | `/api/messages/unread` | Count of unread messages |

### Read receipts
- `read` is set to `true` when the recipient fetches the thread
- Unread badge on nav: `GET /api/messages/unread` → `{ count: 3 }`

### Polling / real-time
Currently: client polls `/api/messages` every 10s.
**Upgrade path:** Replace with Server-Sent Events or Pusher for real-time delivery.

### Manager-side
Manager portal (`/manager`) shows all assigned users + unread counts.
Clicking a user opens the message thread inline.

### Acceptance criteria
- [ ] Messages are scoped to `{ userId, managerId }` pair — no cross-contamination
- [ ] Unread count updates within 10s (polling) or immediately (SSE/push)
- [ ] Both client and manager can send
- [ ] Manager auto-sends welcome message on onboarding completion (idempotent — only once)

---

## Step 9 — Billing & Upgrade

### Stripe flow

#### Checkout
`POST /api/billing/checkout`
- Creates or retrieves Stripe customer (`User.stripeCustomerId`)
- Creates `checkout.session` with the selected `priceId`
- Returns `{ url }` → redirect to Stripe hosted checkout

#### Webhook
`POST /api/billing/webhook`
- Handles: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
- On success: updates `User { plan, stripeSubscriptionId, stripePriceId, stripeCurrentPeriodEnd }`
- On cancel: resets to `plan: "free"`

#### Portal
`POST /api/billing/portal`
- Creates Stripe billing portal session (manage subscription, invoices)

### Plan enforcement
`POST /api/internal/plan-enforcement` (cron, daily)
- Checks `stripeCurrentPeriodEnd` for all Pro/Enterprise users
- Downgrades to `free` if subscription lapsed

### UI
`/dashboard/billing` → `BillingClient.tsx`
- Shows current plan, next renewal date, upgrade/downgrade CTA
- "Upgrade" button → POST checkout → Stripe redirect

### Acceptance criteria
- [ ] Free users see upgrade CTA in billing + dashboard
- [ ] Pro checkout works end-to-end (test mode)
- [ ] Webhook correctly upgrades user plan after successful payment
- [ ] Cancelled subscription downgrades user within 24h (cron)
- [ ] Billing portal lets users manage invoices without contacting support

---

## Step 10 — Snapshots & Rollback

### How snapshots work
- VPS runs Restic backup on a cron schedule
- On completion, calls `POST /api/internal/snapshot` with `{ instanceId, snapshotId, sizeBytes }`
- SynapseForge records in `Snapshot` model

### Client-visible
`GET /api/instances/[id]/snapshots`
- Returns list of `Snapshot` records: date, size, health at time of snapshot

### Rollback (manager-initiated)
- Manager SSHes into VPS and runs `restic restore {snapshotId}`
- No self-service rollback for clients (by design — managed service)

### Acceptance criteria
- [ ] Snapshots appear in instance detail page with timestamp + size
- [ ] `AIInstance.lastBackupAt` is updated after each snapshot
- [ ] Manager can see snapshot history for any instance

---

## Step 11 — Referral System

### Models
```prisma
Referral   { code, referrerId }           // one per user, generated on demand
ReferralConversion { referralId, referredUserId, status, commissionUsd }
```

### Flow
1. Client visits `/dashboard/referral` → `GET /api/referral/link` → generates unique code (e.g. `ELENA-X7K2`)
2. Client shares `https://synapseforge.ai/r/ELENA-X7K2`
3. Visitor hits `GET /app/r/[code]/route.ts` → sets cookie `ref=ELENA-X7K2` → redirects to `/sign-up`
4. On sign-up: `POST /api/referral/track` links new user to referral code
5. On first Pro upgrade: `ReferralConversion.status = "converted"`, `commissionUsd` calculated

### Acceptance criteria
- [ ] Referral link is created on first visit to `/dashboard/referral`
- [ ] Referred user is tracked via cookie for up to 30 days
- [ ] Commission is calculated when referred user upgrades to Pro
- [ ] Referrer can see conversion count + status on referral dashboard page

---

## Data Flow Summary

```
Client Browser
    │
    ├── POST /api/auth/register ──────────────────► User (DB)
    ├── POST /api/onboarding ─────────────────────► User + InstanceCredential + Message (DB)
    ├── POST /api/instances/[id]/setup-telegram ──► InstanceCredential + AIInstance (DB)
    │                                               └── wake → VPS /hooks/wake
    │
    ├── GET  /api/instances/[id]/health ──────────► HealthCheck[] (DB read)
    ├── GET  /api/messages ───────────────────────► Message[] (DB read)
    ├── POST /api/messages ───────────────────────► Message (DB write)
    │
    └── POST /api/billing/checkout ──────────────► Stripe → webhook → User.plan (DB)

Manager Browser
    │
    └── POST /api/manager/instances/[id]/provision ► Hetzner API → AIInstance (DB)
                                                      └── cloud-init → VPS boot

VPS (OpenClaw Gateway)
    │
    ├── POST /api/internal/bootstrap/[id] ────────► config payload (one-time)
    ├── GET  /api/internal/instance-config/[id] ──► decrypted config (polling)
    └── POST /api/internal/provision-complete/[id] ► AIInstance.status = "running"

Cron (Vercel)
    │
    ├── POST /api/internal/health-check ──────────► HealthCheck (DB) + alert email
    ├── POST /api/internal/provision-timeout ─────► AIInstance.status = "error" (if stuck)
    └── POST /api/internal/plan-enforcement ──────► User.plan downgrade (if lapsed)
```

---

## Missing / Not Yet Built

| Feature | Priority | Notes |
|---|---|---|
| Real-time messaging (SSE/Pusher) | Medium | Currently polling every 10s |
| WhatsApp channel setup | High | Route missing; Telegram exists |
| Web widget embed generator | Medium | Share page exists but no widget |
| Manager-side instance config editor | High | SSH sync exists but no UI form |
| Usage analytics charts | Medium | `ChatMessage` has token data, no chart UI |
| Admin user → manager assignment UI | Medium | Manual in DB currently |
| Snapshot restore (self-service) | Low | Manager-only for now |
| Notification system (email/push) | Medium | Health alert email exists; no in-app |
| Rate limiting per instance | High | `rate-limit.ts` exists, not wired everywhere |

---

## Environment Variables Required

```env
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Database (Neon)
DATABASE_URL=
DIRECT_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Hetzner (provisioning)
HETZNER_API_KEY=

# Encryption (AES-256-GCM for credentials)
ENCRYPTION_KEY=   # 32-byte hex string

# Internal cron auth
CRON_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=
```

---

_This document should stay in sync with the codebase. Update it when routes, models, or flows change._
