# ⚡ SynapseForge

> **We forge the AI stack so you don't have to.**

Deploy AI agents with Telegram, Discord, and Slack integrations in minutes — running on dedicated cloud infrastructure.

---

## What is this?

SynapseForge is a full-stack platform that:
1. Lets users configure an AI agent (model, system prompt, credentials)
2. Deploys it to a dedicated Hetzner VPS running [OpenClaw](https://github.com/openclaw/openclaw) gateway
3. Keeps config in sync automatically (5-minute polling)
4. Provides a dashboard for monitoring health, usage, and chat history

---

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + **Neon** (PostgreSQL)
- **NextAuth v5** (email/password)
- **Resend** (transactional email)
- **Stripe** (billing)
- **Hetzner Cloud API** (VPS provisioning)
- **OpenClaw** (AI gateway on each VPS)

---

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/asavienko/synapseforge
cd synapseforge/web
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in all values — see .env.example for descriptions
```

**Required for basic functionality:**
- `DATABASE_URL` + `DIRECT_URL` — Neon PostgreSQL
- `AUTH_SECRET` — random 32-byte secret (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — e.g. `http://localhost:3000`
- `ENCRYPTION_KEY` — 32+ char secret for encrypting stored credentials

**Required for VPS provisioning:**
- `HETZNER_API_KEY` — Hetzner Cloud API token
- `INTERNAL_API_KEY` — shared secret for VPS→SynapseForge callbacks

**Optional:**
- `RESEND_API_KEY` + `RESEND_FROM` — email sending (logs to console if absent)
- `STRIPE_*` — billing (skip for local dev)

### 3. Database

```bash
npx prisma migrate deploy   # apply migrations
npx prisma generate         # generate client
```

### 4. Run

```bash
npm run dev
```

---

## VPS Provisioning Architecture

When a user clicks **Deploy Instance**:

```
User → POST /api/instances/[id]/deploy
  → Generate bootstrap token + gateway token
  → Call Hetzner API: create cx22 Ubuntu 22.04 VPS
  → Embed cloud-init script (bootstrap token, no raw keys)
  └─ VPS boots:
       1. Install Docker + cron
       2. Fetch openclaw.json via bootstrap token (one-time)
       3. Start OpenClaw Docker container (port 18789)
       4. Every 5 min: health-check → POST /api/internal/health-check
       5. Every 5 min: config-sync → GET /api/internal/instance-config/[id]
```

### Security model
- No API keys in Hetzner metadata — bootstrap uses a one-time token
- Config sync authenticated with the gateway token (same token in `hooks.token` and `gateway.auth.token`)
- Credentials stored encrypted in DB (`AES-256-GCM`, `ENCRYPTION_KEY`)
- Internal API endpoints (`/api/internal/*`) require `INTERNAL_API_KEY`

### VPS lifecycle
- **Provisioning**: VPS boots, installs, calls first health check → `provisionStatus: "provisioning"`
- **Ready**: First healthy health check → `provisionStatus: "ready"`, status: "running", email sent
- **Sync**: Credential/config change → `configSynced: false` → VPS syncs within 5 min
- **Delete**: `DELETE /api/instances/[id]` → Hetzner DELETE server → DB record removed

---

## E2E Tests (Cypress)

```bash
# Seed the test database
export $(grep -v '^#' .env.local | xargs) && npx tsx cypress/support/seed.ts

# Run all tests (headless)
npx cypress run

# Open Cypress GUI
npx cypress open
```

Tests require:
```
CYPRESS_TEST_EMAIL=cypress@synapseforge.ai
CYPRESS_TEST_PASSWORD=cypress123
CYPRESS_MANAGER_EMAIL=manager@synapseforge.ai
CYPRESS_MANAGER_PASSWORD=Cypress123!
DISABLE_RATE_LIMIT=true
```

---

## Git Workflow

- **`develop`** — all active development; CI runs on every push
- **`main`** — production only; merge from `develop` when deploying to Vercel
- Push after every meaningful change (don't batch)

---

## Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Set all env vars from `.env.example` in Vercel dashboard
3. Deploy `main` branch

**Vercel env vars required for production:**
| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | Neon pooled URL |
| `DIRECT_URL` | ✅ | Neon direct URL for migrations |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Production URL, no trailing slash |
| `ENCRYPTION_KEY` | ✅ | `openssl rand -hex 32` |
| `INTERNAL_API_KEY` | ✅ | `openssl rand -hex 32` — VPS health checks |
| `HETZNER_API_KEY` | ✅ | VPS provisioning |
| `RESEND_API_KEY` | ✅ | Transactional email |
| `RESEND_FROM` | ✅ | Verified sender address |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin emails |
| `STRIPE_SECRET_KEY` | Optional | Billing |
| `STRIPE_WEBHOOK_SECRET` | Optional | Billing |
| `STRIPE_PRO_PRICE_ID` | Optional | Billing |
| `STRIPE_ENTERPRISE_PRICE_ID` | Optional | Billing |
