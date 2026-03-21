# SynapseForge — Implementation Roadmap

> **Core product (locked 2026-03-12):** A managed OpenClaw instance per client.
> SynapseForge deploys OpenClaw, configures it, connects channels, and keeps it running.
> The dashboard is the management layer. Managers are the human layer.
> See `plans/USER_STORY_OPENCLAW.md` for the full user journey.

## Current State (as of 2026-03-09)

### ✅ Working
- Landing page (hero, services, pricing, about, footer)
- User registration (bcrypt-hashed passwords)
- User sign-in / sign-out (NextAuth JWT)
- Dashboard overview (stats, manager card, instance list)
- AI Instances: create, list, view, start/stop, delete
- Settings: edit name, change password
- Admin panel (protected by ADMIN_EMAILS env var)
- Mobile-responsive layout with hamburger nav
- Active sidebar nav state
- Toast notifications on instance actions
- Registration success banner
- **Manager assignment** — Admin UI exists, can create managers and assign to users
- **In-app messaging** — Message threads between clients and managers
- **Onboarding flow** — Post-signup redirect to `/onboarding` with use case capture
- **Email notifications** — 8 cron jobs: sandbox-nudge, check-inactivity, weekly-digest, channel-activation-nudge, check-milestones, health-check, etc.
- **Forgot password / password reset** — Full flow with email tokens
- **Email verification** — Verification emails + banner in dashboard
- **Billing / Stripe integration** — Checkout, portal, plan management
- **Rate limiting** — On all auth endpoints
- **Footer links** — Privacy, Terms, Contact pages all working
- **Instance Configuration UI** — Full ConfigurationTab with JSON editing
- **Credential Vault** — Encrypted storage with reveal functionality
- **Usage Warning Banners** — Proactive alerts when approaching limits
- **Real-time Notifications** — Toast alerts for instance events (provisioning, down, recovered)

### ❌ Not Working / Stub Only
- Instance status is a DB toggle — no real VPS AI deployment yet
- Real-time instance status from OpenClaw health checks (partially done)

---

## Phase 1 — OpenClaw Integration Core (Highest Priority)

**Goal:** Make the "managed OpenClaw instance" story real and functional end-to-end.
See `plans/USER_STORY_OPENCLAW.md` for full detail.

### 1.0 Onboarding Flow
- Post-signup redirect to `/onboarding` (not dashboard)
- Capture: industry, use case, channels wanted, API key provider preference
- Save to user profile → trigger manager notification

### 1.1 Admin: Manager Assignment & Provisioning
- Add manager creation UI to `/admin`
- Assign manager to user from admin panel
- **"Provision Instance" button** in admin → calls VPS API (Hetzner/DO) → installs OpenClaw → stores instance VPS URL + credentials in DB
- Manager sees all assigned clients with their instance status

### 1.2 Instance = Real OpenClaw Instance
- Each instance record stores: `vpsUrl`, `openclaw_gateway_url`, `status`
- Dashboard instance status is pulled from live OpenClaw health check API, not just a DB toggle
- Manager can start/stop/restart the OpenClaw gateway via dashboard

### 1.3 Credential Vault (Client API Keys)
- Client enters their API keys (OpenAI / Anthropic / OpenRouter) in the dashboard
- Keys encrypted at rest (AES-256), pushed securely to the client's OpenClaw instance config
- Client keys never visible after save; shown as `****` with a "Reveal" option for the client only

### 1.4 Channel Setup UI
- Dashboard section: "Connected Channels" per instance
- **Telegram first:** Client provides bot token → dashboard calls OpenClaw API to configure channel → shows status
- WhatsApp, Slack, web widget — follow-on
- Channel health status visible (green/red per channel)

### 1.5 In-App Manager Messaging ⏸️ ON HOLD
> **Status:** Deprioritized — 2026-03-12. Focus is on provisioning, credentials, and channel setup first.
> Resume when core instance flow is end-to-end working.
- New `Message` model in Prisma: `id, senderId, recipientId, body, createdAt, read`
- New route: `/dashboard/messages` — thread-style between client and manager
- Manager portal (`/manager`) — view all clients, their instances, reply to messages
- Email notification when new message arrives

---

## Phase 2 — Instance Observability & Health

**Goal:** Managers and clients can see what's happening with every instance.

### 2.1 Real-Time Instance Status
- Poll OpenClaw gateway health endpoint every 60s
- Show: uptime, last seen, response time
- Alert manager (email/Telegram) when health check fails 3x

### 2.2 Instance Logs
- Fetch recent logs from OpenClaw instance via SSH or API
- Show in a scrollable log view on instance detail page
- Manager can see errors, channel events, agent activity

### 2.3 Usage & Token Tracking
- Track messages per instance (stored in DB, incremented via webhook or polling)
- Token usage per instance (from OpenClaw usage stats or model API)
- Show on dashboard: messages today, this week, this month
- Plan limit enforcement based on actual usage

### 2.4 Snapshot & Rollback (Restic)
- Automated hourly snapshots of `~/.openclaw/` on each VPS (via Restic → Backblaze B2)
- Snapshot tagged `healthy` when health check passes
- Manager can trigger rollback from admin panel → restores last healthy snapshot
- Auto-rollback option: if health fails N times, auto-restore + alert

### 2.5 Instance Credentials / API Access (for developers)
- Generate an API key per instance for external access
- Docs snippet showing how to call the instance API
- Rate limiting per API key

### 2.3 Instance Activity Log
- `ActivityLog` model: `instanceId, event, details, createdAt`
- Events: started, stopped, config changed, error, request received
- Show logs tab on instance detail page

---

## Phase 3 — Auth & Account Polish

**Goal:** Production-ready auth.

### 3.1 Email Verification
- On register: send verification email with token
- Gate dashboard access until email is verified
- Resend verification option

### 3.2 Forgot Password / Reset
- "Forgot password?" link on sign-in
- Send reset link via email (token expires in 1h)
- `/reset-password?token=...` page

### 3.3 Rate Limiting
- Rate limit `/api/auth/register` and `/api/auth/callback/credentials`
- Use `upstash/ratelimit` or simple in-memory counter
- Return 429 with retry-after header

### 3.4 OAuth (Optional)
- Add Google OAuth via NextAuth
- "Continue with Google" button on sign-in/sign-up

---

## Phase 4 — Onboarding Flow

**Goal:** Turn sign-ups into engaged users.

### 4.1 Post-Registration Onboarding
- After sign-up, redirect to `/onboarding` instead of sign-in
- Step 1: "Tell us about your business" (industry, use case, team size)
- Step 2: Pick your first agent type (visual cards)
- Step 3: "Your manager will reach out within 24h" confirmation screen
- Save onboarding data to user profile (`onboardingData` JSON field)
- Manager gets notified with context

### 4.2 Welcome Email
- Triggered on registration
- Introduces their manager by name
- Links to dashboard
- Sets expectations (response time, what happens next)

---

## Phase 5 — Billing & Plans

**Goal:** Monetize Pro and Enterprise.

### 5.1 Stripe Integration
- `stripeCustomerId` on User model
- Stripe Checkout for Pro plan subscription
- Webhook: update user `plan` on `checkout.session.completed`
- Webhook: downgrade on `customer.subscription.deleted`
- Billing portal link in Settings

### 5.2 Plan Enforcement
- Already enforced on instance creation (limit check)
- Add UI to show plan limit usage (progress bar on dashboard)
- "Upgrade" CTA when approaching limit
- Enterprise: custom invoice flow (contact form → manager handles)

---

## Phase 6 — Analytics & Monitoring

**Goal:** Give users and managers visibility.

### 6.1 Instance Analytics
- Request count per instance (daily/weekly/monthly)
- Error rate
- Response time (p50/p95)
- Simple charts (use `recharts` or `chart.js`)

### 6.2 Manager Analytics (Admin)
- Total users by plan
- Instances by status
- Revenue MRR estimate
- Churn indicators

---

## Phase 7 — Pages & Marketing

### 7.1 Fix Dead Links
- Create `/privacy` — Privacy Policy page
- Create `/terms` — Terms of Service page
- Create `/contact` — Contact form (sends email to hello@synapseforge.ai)

### 7.2 Blog / Case Studies (optional)
- MDX-based blog at `/blog`
- Case studies showing real use cases

---

## Immediate Next Steps (Priority Order)

**The goal: one complete end-to-end flow before adding anything else.**

1. **Onboarding flow** — capture business context at signup → manager notification
2. **Manager assignment in admin** — assign a manager to a user with one click
3. **OpenClaw provisioning in admin** — "Provision Instance" → VPS spun up → OpenClaw installed → instance URL saved
4. **Real instance status** — pull from OpenClaw health check API, not DB toggle
5. **Credential vault** — client API keys encrypted + pushed to instance
6. **Telegram channel setup** — first channel connection through dashboard UI
7. **Welcome email** — triggered on signup + on manager assignment
8. ~~**In-app messaging**~~ — ⏸️ **ON HOLD** (resume after core instance flow is complete)

---

## Tech Decisions

| Area | Current | Planned |
|---|---|---|
| AI Runtime | None (DB stub) | **OpenClaw** (one instance per client on dedicated VPS) |
| DB | SQLite (dev) | PostgreSQL (production) |
| VPS provider | None | Hetzner CX22 (~€4/mo) or DigitalOcean Basic ($6/mo) |
| Provisioning | Manual | Shell script → automated via dashboard API call |
| Backups | None | Restic → Backblaze B2 (hourly, per instance) |
| Email | None | Resend (transactional) |
| Payments | None | Stripe |
| Rate limiting | None | Upstash Redis |
| File storage | None | Cloudflare R2 or S3 |
| Hosting | Local dev | Vercel (web) + per-client VPS |
| Monitoring | None | Sentry + UptimeRobot per instance |
