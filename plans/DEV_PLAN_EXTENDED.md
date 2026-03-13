# SynapseForge — Dev Plan Extension
_Last updated: 2026-03-13_

> This extends DEV_PLAN.md with dimensions the original plan missed:
> measurement, activation, retention, manager scale, developer experience,
> and business model expansion. Every section starts with "why it matters"
> so nothing gets dismissed as nice-to-have without understanding the cost.

---

## What the Current Plan Gets Right
The original plan is strong on feature gaps (streaming, WhatsApp, manager config editor).
What it's missing: **the invisible layer** — how you know features are working, how you keep users activated, and how the business scales past 50 clients.

---

## Dimension 1 — Measurement (Missing Entirely)

**Why it matters:** You can ship Sprint 1 perfectly and still not know if users are getting value.
Without measurement you're flying blind on every UX decision.

### 1.1 Funnel Instrumentation

Install **PostHog** (self-hostable, open source). Track these events:

```ts
// Sign-up funnel
posthog.capture('signup_started')
posthog.capture('signup_completed', { method: 'email' | 'google' })
posthog.capture('email_verified')
posthog.capture('onboarding_step', { step: 1..5, skipped: false })
posthog.capture('onboarding_completed', { hasLLMKey: true, hasChannel: false })

// Activation funnel
posthog.capture('instance_created')
posthog.capture('credential_added', { provider: 'openai' | 'anthropic' })
posthog.capture('channel_connected', { channel: 'telegram' | 'discord' | 'slack' | 'whatsapp' })
posthog.capture('instance_deployed')
posthog.capture('first_chat_message_sent')  // ← THE activation event
posthog.capture('instance_healthy')

// Retention
posthog.capture('dashboard_visited')
posthog.capture('manager_message_sent')
posthog.capture('upgrade_clicked')
posthog.capture('upgrade_completed', { plan: 'pro' })
```

### 1.2 Activation Metric (The Single Most Important Number)

Define activation as: **"User has sent at least 1 message through a deployed instance within 7 days of signing up."**

This captures:
- Instance deployed ✅
- At least 1 channel connected ✅
- AI responded to a real message ✅

Track weekly activation rate. If it's below 40%, Sprint 1 priorities are wrong.

### 1.3 Key Funnels to Monitor

```
Sign Up → Onboarding Complete → LLM Key Added → Instance Deployed → First Real Message
         (drop-off?)          (drop-off?)       (drop-off?)         (drop-off?)
```

Set up funnel in PostHog. First week data will immediately tell you where users are getting stuck.

### 1.4 Manager Efficiency Metrics (Internal)

Track in admin panel:
- Avg time from client sign-up → instance live (goal: < 4h)
- Avg manager response time to client messages (goal: < 2h)
- Client messages per week (leading indicator of value)
- Instances with 0 messages in last 7 days (churn risk)

**Dev tasks:**
- [ ] Install PostHog (`@posthog/nextjs`), wrap layout with `<PostHogProvider>`
- [ ] Add `posthog.capture` to all key user actions (list above)
- [ ] Add admin analytics page with manager efficiency metrics
- [ ] Define activation event in DB: `User.activatedAt` — set when first chat message is sent

---

## Dimension 2 — Demo / Sandbox Mode (Biggest Acquisition Gap)

**Why it matters:** Right now, a user who doesn't have an OpenAI API key can't experience the product at all.
That's a massive drop-off. Most SMB owners don't have API keys. They need to see the AI work before committing.

### What to build: "Try it free" mode

- Every new user gets a **sandbox instance** powered by SynapseForge's own API key
- Limited to **20 messages** (visible counter: "17 of 20 free messages remaining")
- After 20 messages: "Add your own API key to continue — costs ~$0.01/message"
- No VPS needed for sandbox — proxy through SynapseForge's own API call (`/api/instances/[id]/chat` already does this)

### UX flow

```
Sign up → Onboarding → Dashboard
                      ↓
               "Try it now — no API key needed"
               [Chat tab opens with sandbox mode active]
               ↓
          User chats with their AI (pre-configured with their use case)
               ↓
          After ~5 messages: "Add your API key to unlock unlimited messages"
               ↓
          User adds key → activated
```

### Implementation

```ts
// In AIInstance model — add:
sandboxMode    Boolean  @default(true)   // true until user adds their own key
sandboxUsed    Int      @default(0)      // increment on each sandbox message
SANDBOX_LIMIT  = 20
```

```ts
// In /api/instances/[id]/chat:
if (instance.sandboxMode && instance.sandboxUsed >= SANDBOX_LIMIT) {
  return { missingCredential: true, sandboxExhausted: true }
}
if (instance.sandboxMode) {
  // Use SynapseForge's key
  llmKey = process.env.SYNAPSEFORGE_OPENAI_KEY
  await prisma.aIInstance.update({ where: { id }, data: { sandboxUsed: { increment: 1 } } })
}
```

**Dev tasks:**
- [ ] Add `sandboxMode` + `sandboxUsed` to `AIInstance` schema
- [ ] Wire sandbox logic in `/api/instances/[id]/chat`
- [ ] Add sandbox counter UI in chat tab: "X of 20 free messages"
- [ ] Add "Add API key" CTA when sandbox exhausted
- [ ] Track `sandbox_message_sent` and `sandbox_exhausted` events in PostHog
- [ ] Cost cap: set max spend per sandbox instance ($0.50 hardcoded)

---

## Dimension 3 — Activation Optimization (First Session Experience)

**Why it matters:** The current flow assumes users know what to do. They don't.
The gap between "signed up" and "got value" is where 60–70% of SaaS churn happens.

### 3.1 First Session Script

What the ideal first session looks like:
1. Sign up (30s)
2. Onboarding wizard (2 min)
3. **Immediately chat with the AI in sandbox mode** (1 min) ← currently missing
4. See the AI respond intelligently using their business context
5. "Wow, this actually works" moment
6. Add API key to continue → activated

Currently step 3 is blocked by needing an API key. Sandbox mode fixes this.

### 3.2 Onboarding: Agent Template Pre-configuration

When user picks "Customer Support" in onboarding:
- Auto-populate `config.systemPrompt` with a customer support template
- Auto-set `config.agentName` to something like "Support Bot"
- Auto-set `config.traits` to `["Friendly", "Professional", "Concise"]`

User sees a pre-configured agent in the chat tab immediately — not a blank slate.

**`lib/agent-templates.ts` already exists and has templates. Just not wired to onboarding.**

### 3.3 Welcome Email Sequence (3 emails, automated)

Currently: one email (verification). Missing:
```
Day 0: "Your AI is being set up — here's what to expect"
Day 1: "Quick tip: try asking your agent [3 example questions for their use case]"
Day 3: (if no activation) "Your agent is ready — need help getting started?"
Day 7: (if activated) "You've had X conversations this week! Here's what's working"
Day 7: (if not activated) "Let your manager help — book a 15min call" [Cal.com link]
```

All via Resend, triggered by lifecycle events.

**Dev tasks:**
- [ ] Wire agent templates to onboarding step 2 (use case selection → auto-populate config)
- [ ] Add Day 1 + Day 3 + Day 7 email triggers (use Resend scheduled sends or cron)
- [ ] Create email templates for each lifecycle state
- [ ] Add `activatedAt` to User model → set when first real message sent

---

## Dimension 4 — Retention Mechanics

**Why it matters:** A client who set up their AI 3 weeks ago and hasn't logged in since is about to churn.
The plan has nothing about keeping clients engaged after activation.

### 4.1 Weekly Usage Digest Email

Every Monday: send each active client:
```
Subject: Your AI handled 47 conversations this week ⚡

Hey Elena,

Your AI assistant had a busy week:
• 47 conversations handled automatically
• Avg response time: 4 seconds
• Top question type: Appointment availability (23 questions)
• Estimated time saved: ~3.5 hours

[View full analytics →]    [Message your manager →]
```

Powered by `ChatMessage` data + Resend. Cron runs Sunday night.

### 4.2 Milestone Notifications

Trigger in-app + email when client hits:
- First 10 messages → "Your AI is getting started! 🎉"
- First 100 messages → "100 conversations handled — here's your impact"
- First 1,000 messages → "Your AI is a power user now 🚀 — consider upgrading to Pro"
- First month live → "1 month with SynapseForge — here's your stats"

These are retention AND upsell triggers.

### 4.3 Inactivity Detection

Cron daily: find clients where:
- `ChatMessage` count this week = 0 AND instance is running

Action:
1. Notify their manager: "Elena hasn't had any AI conversations this week"
2. Manager follows up manually
3. After 14 days: system sends automated "Is everything working?" email

**Dev tasks:**
- [ ] Weekly digest email (Resend template + cron every Sunday)
- [ ] Milestone tracker: `User.milestones: string[]` — track which milestones were celebrated
- [ ] Inactivity detection cron (daily, checks last message date per instance)
- [ ] Manager notification for inactive clients (in-app + email)

---

## Dimension 5 — Conversation Intelligence

**Why it matters:** Message counts tell you quantity. Intelligence tells you quality.
Managers need to know: what is the AI failing to answer? What are clients' users actually asking?

### 5.1 Unanswered Questions Detection

Add a flag to `ChatMessage`: `wasAnswered: Boolean` — determined by checking if the assistant response contains phrases like "I don't know", "I'm not sure", "contact us", etc.

Surface in manager portal: "Top 5 questions the AI couldn't answer this week"

This tells managers exactly what to add to the knowledge base.

### 5.2 Intent Classification

After each conversation, run a lightweight classification:
- Booking / appointment request
- Price inquiry
- Complaint / issue
- General FAQ
- Out of scope

Store in `ChatMessage.intent` (nullable string). Display as a pie chart in the analytics section.

Use a cheap model (GPT-3.5 / Haiku) to classify in the background. Cost: ~$0.001 per conversation.

### 5.3 Satisfaction Signal

After every conversation thread (detected by a gap of >30 min):
- If client is using web widget: show a thumbs up/down button
- Store in a `ConversationRating` model
- Surface average satisfaction score in dashboard

### 5.4 Manager Weekly Report

Every Monday, each manager gets an email digest for each of their clients:
- Messages this week (+ % change vs last week)
- Top unanswered questions
- Any instance downtime
- Clients who haven't had any activity (churn risk)

**Dev tasks:**
- [ ] Add `intent` + `wasAnswered` fields to `ChatMessage`
- [ ] Background job to classify intent after each message (GPT-3.5 mini)
- [ ] Intent breakdown chart on Overview tab
- [ ] "Unanswered questions" section in manager portal per client
- [ ] Manager weekly digest email (separate from client digest)

---

## Dimension 6 — Knowledge Base (High-Value Missing Feature)

**Why it matters:** The AI is only as good as what it knows. Today, clients can only give context
through a text textarea in Configuration. They can't upload their price list, FAQ PDF, or product catalog.

### What to build

```
Configuration tab → "Knowledge Base" section
├── Upload files (PDF, TXT, CSV, DOCX)
├── Paste text blocks ("Our return policy is...")
├── Website URL scrape ("Import from your website")
└── Saved knowledge base entries (list + delete)
```

### Technical approach

1. Client uploads file → stored in **Cloudflare R2** (cheap, fast CDN)
2. File content extracted (PDF → text via `pdf-parse`, CSV → rows)
3. Chunked into segments, stored in `KnowledgeChunk` table
4. On each chat request: retrieve top-K relevant chunks via **pgvector similarity search**
5. Injected into system prompt: "Use the following knowledge to answer..."

### DB additions

```prisma
model KnowledgeBase {
  id         String   @id @default(cuid())
  instanceId String
  name       String   // "Price List Q1 2026"
  type       String   // "file" | "text" | "url"
  fileUrl    String?  // R2 URL
  createdAt  DateTime @default(now())
  chunks     KnowledgeChunk[]
  instance   AIInstance @relation(...)
}

model KnowledgeChunk {
  id          String   @id @default(cuid())
  kbId        String
  content     String   // the actual text chunk
  embedding   Unsupported("vector(1536)")?  // pgvector
  kb          KnowledgeBase @relation(...)
}
```

### Tech stack
- **pgvector** extension on Neon (free, already supported)
- **Cloudflare R2** for file storage (~$0.015/GB/month)
- **OpenAI embeddings** for generating vectors (ada-002, ~$0.0001/1K tokens)
- **pdf-parse** for PDF extraction (npm, no API needed)

This single feature will increase client stickiness dramatically — once they've uploaded their docs, switching costs are high.

**Dev tasks:**
- [ ] Enable pgvector on Neon DB
- [ ] Add `KnowledgeBase` + `KnowledgeChunk` models to schema
- [ ] `POST /api/instances/[id]/knowledge` — upload + extract + embed
- [ ] `GET /api/instances/[id]/knowledge` — list knowledge base entries
- [ ] RAG injection in `/api/instances/[id]/chat`
- [ ] Knowledge Base section UI in Configuration tab (file upload + text input)

---

## Dimension 7 — Manager Scale (CRM Layer)

**Why it matters:** The current manager portal is a simple list of clients + message thread.
It works for 5 clients. It breaks at 20. By 50 clients, managers need a proper CRM view.

### 7.1 Client Health Score

Compute a simple score (0–100) per client based on:
- Messages in last 7 days (weight: 40%)
- Last login (weight: 20%)
- Channels connected (weight: 20%)
- Instance uptime (weight: 20%)

Show as a green/yellow/red badge in manager client list.

```ts
// Pseudocode
function computeHealthScore(client): number {
  const messageScore = Math.min(client.weeklyMessages / 50, 1) * 40
  const loginScore = daysSinceLogin < 7 ? 20 : daysSinceLogin < 14 ? 10 : 0
  const channelScore = client.channelsConnected * 5  // max 20 (4 channels)
  const uptimeScore = client.weeklyUptime * 20  // 0–1 fraction
  return Math.round(messageScore + loginScore + channelScore + uptimeScore)
}
```

### 7.2 Manager Client Sorting

Sort client list by:
- Health score (lowest first = who needs attention)
- Last message date
- Plan (Pro clients first)
- Days since activation

### 7.3 Client Notes

Add free-text notes per client that only the manager sees:
```prisma
model ClientNote {
  id        String   @id @default(cuid())
  userId    String
  managerId String
  body      String
  createdAt DateTime @default(now())
}
```

Manager adds notes like "Elena prefers WhatsApp. Runs a spa in Valencia. Very non-technical."
These persist across sessions and help managers give personalized service.

### 7.4 Manager Capacity Limit

Set a max clients per manager (default: 20). When manager is at capacity, new signups are put in a queue.
Admin sees: "Manager Carlos: 18/20 clients — 3 in queue."

**Dev tasks:**
- [ ] Compute client health score (cron daily, stored in `User.healthScore`)
- [ ] Add sorting + filtering to manager client list
- [ ] `ClientNote` model + note UI in manager portal (collapsible sidebar)
- [ ] `Manager.maxClients` field + capacity indicator in admin panel

---

## Dimension 8 — Developer Experience (API-First)

**Why it matters:** A fraction of SynapseForge clients are developers. These clients:
- Have the highest LTV (they'll integrate deeply)
- Spread the word in developer communities
- Are self-sufficient (lower support cost)

The API exists (`/api/v1/`) but there's no documentation, no playground, no SDK.

### 8.1 API Docs Page (`/docs`)

A simple, interactive API docs page:
```
GET  /api/v1/instance      — Get instance info
POST /api/v1/chat          — Send a message, get a response
POST /api/v1/chat/completions — OpenAI-compatible endpoint
```

Use **Scalar** (open source, beautiful API docs — drop-in, no config) or **Swagger UI**.

### 8.2 API Playground

Right in the docs page: a live playground where developer can send a real message using their API key.
No need to leave the browser to curl.

### 8.3 OpenAI SDK Compatibility (Verify + Document)

The `/api/v1/chat/completions` endpoint exists. Make sure:
- It handles `model` parameter (maps to instance's configured model)
- It returns the exact OpenAI response shape
- It works with the official `openai` Python/JS SDKs as a drop-in

This unlocks a huge distribution channel: "Drop in SynapseForge as your OpenAI base URL."

### 8.4 Webhooks (Outbound)

Clients want to be notified when their AI handles certain things:
```
POST {client_webhook_url} {
  event: "message.received",
  instanceId: "...",
  message: "I need to book an appointment",
  response: "I'd be happy to help! What day works for you?",
  timestamp: "2026-03-13T10:00:00Z"
}
```

```prisma
model Webhook {
  id         String   @id @default(cuid())
  instanceId String
  url        String   // client's endpoint
  events     String   // JSON array: ["message.received", "instance.down"]
  secret     String   // HMAC signing secret
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())
  instance   AIInstance @relation(...)
}
```

**Dev tasks:**
- [ ] `/docs` page using Scalar (npm install + 1 route to serve the spec)
- [ ] `openapi.json` spec generated from existing routes
- [ ] Verify OpenAI-compat endpoint with official SDK (write a test)
- [ ] `Webhook` model + webhook delivery service
- [ ] Webhooks UI in API Keys tab: add URL + select events + test delivery

---

## Dimension 9 — In-App Notification Center

**Why it matters:** Currently there's no way to get attention from within the app.
Manager messages, instance down alerts, milestone achievements — all land in email or nowhere.

### What to build

```
Bell icon in navbar (top right, with unread badge)
    ↓
Notification dropdown (slide-down panel)
├── 🔴 Instance "My Bot" went down — 5 minutes ago [View]
├── 💬 New message from your manager — 2 hours ago [Read]
├── 🎉 100 conversations milestone! — Yesterday [View stats]
└── ⚡ Instance deployed successfully — 3 days ago
```

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "instance.down" | "manager.message" | "milestone" | "provision.ready"
  title     String
  body      String?
  href      String?  // where to go when clicked
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User @relation(...)
}
```

Write notifications from:
- Health check cron (instance down)
- Onboarding completion (manager message)
- Provision complete
- Milestone events
- Manager sends a message

**Dev tasks:**
- [ ] `Notification` model in schema
- [ ] `POST /api/notifications` — internal route to create notifications
- [ ] `GET /api/notifications` — fetch unread + recent
- [ ] Bell icon in dashboard nav with unread badge
- [ ] Notification dropdown component (shadcn Popover)
- [ ] Mark as read on click

---

## Dimension 10 — White-Label / Agency Tier

**Why it matters:** The highest-value segment isn't SMBs — it's agencies that resell AI services
to their own clients. One agency = 10–50 client instances.

### What the agency tier looks like

```
Agency portal (separate from client dashboard)
├── Brand your own name/logo (white-label)
├── Manage your client sub-accounts
├── Set custom pricing per client
├── Access commission from client usage
└── Shared knowledge base across all clients
```

### Minimal implementation path

1. Add `agencyId` to `User` model — agency users can see all clients they manage
2. Add `Agency` model: `{ name, logo, primaryColor, domain }`
3. When agency clients visit dashboard: show agency's branding
4. Agency owner gets consolidated billing: pays SynapseForge wholesale, charges clients retail

### This unlocks:
- 10x MRR from a single agency account
- Built-in distribution (agency's existing clients)
- Lower support cost (agency handles tier-1 support)

**Dev tasks (Phase 4 — after product-market fit):**
- [ ] `Agency` model + agency admin portal
- [ ] White-label CSS variables (brand color, logo) per agency
- [ ] Custom domain support (CNAME → SynapseForge)
- [ ] Consolidated agency billing view

---

## Dimension 11 — Mobile UX (PWA)

**Why it matters:** Managers check dashboards on phones. SMB owners are mobile-first.
The current app is responsive but not optimized for mobile interaction.

### Immediate wins (< 1 day each)
- [ ] Fix touch target sizes (min 44×44px — currently some buttons are 32px)
- [ ] Bottom nav bar on mobile (instead of hamburger → slideout)
- [ ] Chat input: on mobile, keyboard shouldn't push chat messages out of view (use `dvh` not `vh`)
- [ ] Pull-to-refresh on messages page (add `touch-action` handler)

### PWA (3-5 days)
- [ ] `manifest.json` with icons + theme color
- [ ] Service worker for offline cache (app shell caches)
- [ ] "Add to Home Screen" banner after 3 visits

Users who add to home screen have 2x higher retention than browser-only users.

---

## Dimension 12 — Zapier / Make / n8n Integration

**Why it matters:** SMBs live in Zapier. If they can connect their AI to their CRM, booking system,
or Google Sheets without code — that's the "10x value" moment.

### What to build

A trigger + action on Zapier:
- **Trigger:** "New conversation handled by my AI" → sends conversation to Zapier
- **Action:** "Send message to my AI" → calls `/api/v1/chat`

This is 90% already built (the API exists). Just need:
1. A Zapier developer account + basic app registration (~2h setup)
2. OAuth 2.0 flow for Zapier to get an API key
3. One webhook trigger endpoint

Real-world uses this unlocks:
- "When AI handles a booking request → create event in Google Calendar"
- "When AI gets a complaint → create ticket in Intercom"
- "When AI qualifies a lead → add to HubSpot"

**Dev tasks:**
- [ ] Register SynapseForge on Zapier developer platform
- [ ] OAuth 2.0 endpoint for Zapier auth
- [ ] Zapier trigger: `POST {zapier_webhook}` after each conversation
- [ ] Zapier action: calls `/api/v1/chat` with message

---

## Updated Sprint Priority (Extended)

### Sprint 0 (Before Sprint 1) — 2 days
These unblock everything else:
1. Install PostHog — add 10 capture events
2. Define activation metric — add `activatedAt` to User model
3. Install shadcn/ui — migrate toasts + modals

### Sprint 1 — Critical Gaps (as before)
(see DEV_PLAN.md Sprint 1)
+ Add: sandbox mode (3–4 days — biggest activation lever)

### Sprint 2 — UX Polish + Activation
(as before)
+ Add: onboarding email sequence Day 1/3/7
+ Add: agent template wired to onboarding
+ Add: in-app notification center (MVP)

### Sprint 3 — Retention + Intelligence
+ Weekly usage digest email
+ Milestone notifications
+ Conversation intent classification
+ Manager weekly report email
+ Client health score in manager portal

### Sprint 4 — Knowledge Base
+ File upload + pgvector RAG
+ This is a major product unlock — own sprint

### Sprint 5 — Developer Experience
+ API docs page (Scalar)
+ Webhook delivery
+ OpenAI-compat verification

### Sprint 6 — Growth
+ Zapier integration
+ Mobile PWA
+ White-label foundations

---

## UX Principles — Extended

The original plan had 6. Add these:

7. **Show the "why"** — Every metric needs context. "47 messages" → "47 messages (3× more than last week)". Numbers without context are noise.

8. **Celebrate wins** — When a milestone is hit, don't just log it. Show a banner, send an email, make it feel earned. Clients who feel successful stay.

9. **Make managers look good** — Every touchpoint where a manager can send a personalized message or insight is an opportunity to increase perceived value. Surface these automatically.

10. **Fail gracefully, recover automatically** — When a VPS goes down, the client shouldn't have to do anything. System detects it, manager is notified, auto-restart is attempted. Client sees "We noticed an issue and fixed it" — not "your AI is down."

11. **Onboarding isn't over at step 5** — True onboarding ends at the first value moment (first 10 real conversations). Design for the full activation arc, not just the wizard.

12. **Every empty state is a sale** — Empty knowledge base → "Upload your price list so your AI can answer pricing questions." Empty channels → "Connect Telegram so customers can reach your AI." Empty = opportunity.

---

_Combined with DEV_PLAN.md, this is the complete picture.
Priority: Measurement first (Sprint 0), then Sandbox Mode (Sprint 1 add-on), then Retention (Sprint 3).
Without measurement, nothing else can be validated._
