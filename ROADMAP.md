# SynapseForge — Implementation Roadmap

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

### ❌ Not Working / Stub Only
- Manager assignment (admin UI doesn't exist yet — field is in DB but no way to assign)
- "Contact manager" is just an email link — no in-app messaging
- Instance status (running/stopped) is a DB toggle — no real AI deployment
- Instance config field exists in schema but has no UI
- No onboarding flow after sign-up
- No email notifications
- No forgot password / password reset
- No email verification
- No billing / payment integration
- No rate limiting on auth endpoints
- Footer Privacy, Terms, Contact links are dead (`#`)

---

## Phase 1 — Manager System (Next Priority)

**Goal:** Make the manager relationship real and functional.

### 1.1 Admin: Manager Assignment
- Add manager creation UI to `/admin` (create Manager records)
- Add "Assign manager" dropdown per user in admin panel
- Show manager name + contact on user's dashboard immediately after assignment

### 1.2 In-App Manager Messaging
- New `Message` model in Prisma: `id, senderId, recipientId, body, createdAt, read`
- Sender can be a `User` or a `Manager`
- New route: `/dashboard/messages`
- Thread-style UI — one conversation per user↔manager pair
- Manager side: a separate `/manager` portal (or extend `/admin`) to view and reply to all client messages
- Email notification when a new message arrives (via Resend or Nodemailer)

### 1.3 Manager Portal
- `/manager` — protected by a `Manager` session (separate login or role flag)
- View all assigned clients
- See their instances, plan, status
- Send/receive messages per client
- Mark instances as needing attention

---

## Phase 2 — Instance Configuration & Lifecycle

**Goal:** Make instances more than just DB records.

### 2.1 Instance Config UI
- Expose the `config` JSON field in the instance detail page
- Schema: `{ model, systemPrompt, temperature, maxTokens, integrations[] }`
- Manager can edit config; user can view it
- "Request config change" button for users → notifies manager

### 2.2 Instance Credentials / API Access
- Generate an API key per instance (`ApiKey` model)
- Show key on instance detail page (masked, reveal on click)
- Copy button + "Regenerate" option
- Docs snippet showing how to call the instance

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

1. **Manager assignment in admin** — so real users can see their manager
2. **In-app messaging** — core product differentiator
3. **Welcome/assignment email** — notify user when manager is assigned
4. **Onboarding flow** — capture intent at sign-up
5. **Forgot password** — table stakes for any real product
6. **Instance config UI** — make instances useful

---

## Tech Decisions

| Area | Current | Planned |
|---|---|---|
| DB | SQLite (dev) | PostgreSQL (production) |
| Email | None | Resend (transactional) |
| Payments | None | Stripe |
| Rate limiting | None | Upstash Redis |
| File storage | None | Cloudflare R2 or S3 |
| Hosting | Local dev | Vercel (web) + managed infra |
| Monitoring | None | Sentry + Uptime robot |
