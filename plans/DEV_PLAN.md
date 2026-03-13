# SynapseForge — Development Plan
_Last updated: 2026-03-13_

> Full UX audit of every user click, mapped to what's built, what's broken, and what needs to be built.
> Organized by user journey phase → priority tier.

---

## Legend
- ✅ Done
- ⚠️ Exists but needs improvement
- ❌ Missing — must build
- 💡 Nice to have

---

## Phase 0 — First Impression (Landing Page)

**Every click before sign-up. First 10 seconds.**

| Click / Step | Status | What to build |
|---|---|---|
| Hero CTA "Get Started Free" | ✅ | — |
| See pricing clearly | ✅ | — |
| See what the product actually does | ⚠️ | Add demo GIF/video of the dashboard in action. A screenshot is not enough. |
| See a real success story | ❌ | Embed the Lumina case study or a shortened version on landing |
| Trust signals (logos, testimonials) | ❌ | Add "Trusted by X businesses" + 2–3 short quotes. Even fake-reals are better than nothing. |
| See what "managed" means | ⚠️ | Add 3-step explainer: sign up → manager configures → AI goes live. Currently too abstract. |
| Mobile layout | ⚠️ | Test and fix hero section on 375px. Common drop-off point. |

**Dev tasks:**
- [ ] Embed demo video / screen recording in hero (Loom or self-hosted)
- [ ] Add case study section on landing (pull from `docs/case-study-lumina-wellness.md`)
- [ ] Add 3-step "How it works" visual section
- [ ] Add trust signal bar (can be minimal to start)
- [ ] Mobile QA pass on landing

---

## Phase 1 — Sign Up

**User clicks "Get Started" → has an account.**

| Click / Step | Status | What to build |
|---|---|---|
| Fill email + password | ✅ | — |
| Google OAuth | ✅ | — |
| See validation errors inline | ⚠️ | Currently shows after submit only. Add real-time validation on blur (email format, password strength) |
| Password strength indicator | ❌ | Add `zxcvbn` or simple color bar: weak / medium / strong |
| Submit → loading state | ✅ | — |
| See "verify your email" screen | ✅ | — |
| Email received with verify link | ✅ | — |
| Click verify → redirected to onboarding | ✅ | — |
| Resend verification | ✅ | — |
| Sign in with existing account | ✅ | — |
| Forgot password flow | ✅ | — |

**Dev tasks:**
- [ ] Real-time email validation (blur event)
- [ ] Password strength bar (`zxcvbn` — 2KB, no deps)
- [ ] Better error messages: "That email is already registered → Sign in instead?"

---

## Phase 2 — Onboarding (5 steps)

**The setup wizard. Must be frictionless. This is where users drop off.**

| Click / Step | Status | What to build |
|---|---|---|
| Step 1: Business name + industry | ✅ | — |
| Step 2: Use case picker | ✅ (cards UI) | — |
| Step 3: Agent template picker | ⚠️ | `lib/agent-templates.ts` exists but template picker in onboarding is not wired to pre-populate config |
| Step 4: LLM provider selection + key | ✅ | — |
| Step 5: Channel setup (optional) | ✅ | — |
| Skip step (with clear "skip" button) | ⚠️ | Skip exists but visually unclear. Users shouldn't feel stuck. |
| Progress bar with step labels | ✅ | — |
| "What's this?" tooltip on API key field | ❌ | First-timers don't know what an API key is. Add tooltip: "This is your billing key for OpenAI/Anthropic. It stays private." |
| Link to get API key (opens new tab) | ✅ | — |
| Back button between steps | ⚠️ | Back exists but state is not preserved on back navigation in all steps |
| Submit → loading → redirected to dashboard | ✅ | — |
| Error: API key invalid | ✅ (validation) | — |
| Post-submit: welcome message from manager | ✅ | — |

**Dev tasks:**
- [ ] Wire agent templates to pre-populate `config` on instance creation during onboarding
- [ ] Add `?` tooltip on API key step with plain English explanation
- [ ] Fix back-navigation state preservation (use `useReducer` or step state in URL params)
- [ ] Visual improvement: make "Skip for now" more prominent (currently feels like an error)
- [ ] Add estimated time: "Takes about 3 minutes" at top of onboarding wizard

---

## Phase 3 — Dashboard (Overview)

**User lands here after onboarding. This is the home base.**

| Click / Step | Status | What to build |
|---|---|---|
| See instance count + status | ✅ | — |
| See plan + usage bar | ✅ | — |
| See message count | ✅ | — |
| See system health badge | ✅ | — |
| See "Getting Started" checklist | ✅ | — |
| Getting Started: click step → correct page | ✅ | — |
| Getting Started: all done → checklist hides | ✅ | — |
| See manager card with name | ✅ | — |
| Click "Message Manager" | ✅ | — |
| Click "Book a Call" (Cal.com) | ✅ | — |
| See recent activity log | ✅ | — |
| Unread messages badge on sidebar | ⚠️ | Badge exists in concept but polling is every 10s. Users miss new messages. Needs SSE or push. |
| Real-time dashboard updates | ❌ | Dashboard is SSR. When instance goes live (provisioning→ready), page doesn't auto-update without refresh. |
| Mobile sidebar nav | ⚠️ | `MobileNav.tsx` exists but needs QA — verify all 5 nav items work on mobile |

**Dev tasks:**
- [ ] Auto-refresh dashboard stats when navigating back (add `router.refresh()` trigger or SWR)
- [ ] Add unread message badge that updates in real-time (SSE preferred over polling)
- [ ] Mobile nav QA pass

---

## Phase 4 — Instances List

**User clicks "Instances" in sidebar.**

| Click / Step | Status | What to build |
|---|---|---|
| See list of instances with status | ✅ | — |
| See health badge per instance | ⚠️ | Health badge exists but only updates when user visits instance detail. List page doesn't poll. |
| Create new instance (button) | ✅ | — |
| Click instance → detail page | ✅ | — |
| Free plan: see "Upgrade to add more" when at limit | ✅ | — |
| Search / filter instances | ❌ | Irrelevant for MVP (max 1–5 instances) but needed for Enterprise |
| Sort by status / name | ❌ | Low priority now |

**Dev tasks:**
- [ ] Add health polling on instances list page (30s interval, lightweight `GET /api/instances`)
- [ ] Show `provisionStatus` on list card so user sees "Provisioning…" without going into detail

---

## Phase 5 — Instance Detail: Setup Flow

**The most critical flow. This is where users do the real work.**

### 5a. Overview Tab
| Click / Step | Status | What to build |
|---|---|---|
| See setup checklist (4 items) | ✅ | — |
| Click checklist item → navigate to correct tab | ✅ | — |
| Contextual "next step" CTA button | ✅ | — |
| Quick test input (send message) | ✅ | — |
| Usage stats (messages, tokens, cost) | ✅ | — |
| Bar chart (14 days) | ✅ (custom) | Upgrade to `recharts` for interactive hover tooltips |
| Recent activity widget | ✅ | — |
| "Contact your manager" nudge | ✅ | — |

### 5b. Credentials Tab
| Click / Step | Status | What to build |
|---|---|---|
| See channel connection status at a glance | ✅ | — |
| Add OpenAI/Anthropic/OpenRouter key | ✅ | — |
| Test & Save LLM key (validates before saving) | ✅ | — |
| Connect Telegram bot | ✅ | — |
| Connect Discord bot | ✅ | — |
| Connect Slack | ✅ | — |
| Connect **WhatsApp** | ❌ | Route missing. Need `POST /api/instances/[id]/setup-whatsapp`. Key differentiator for SMB market. |
| Connect **Web Widget** | ❌ | No embeddable widget. See Phase 6. |
| View OpenClaw config preview | ✅ | — |
| "Sync Now" button | ✅ | — |
| Out-of-sync warning banner | ✅ | — |

### 5c. Deploy Tab
| Click / Step | Status | What to build |
|---|---|---|
| See readiness checklist (LLM key + channel) | ✅ | — |
| Deploy button (triggers Hetzner provision) | ✅ | — |
| Provisioning progress bar with steps | ✅ | — |
| Auto-poll until ready | ✅ | — |
| On ready: auto-switch to Chat tab | ✅ | — |
| Deployed: see connected channels | ✅ | — |
| Config out of sync banner | ✅ | — |
| Sync Now → VPS gets config | ✅ | — |
| Retry on failure | ✅ | — |
| Region picker (EU/US) | ⚠️ | Region is hardcoded to `nbg1`. Expose it in the Deploy tab UI. Many clients are US-based. |

### 5d. Chat Tab
| Click / Step | Status | What to build |
|---|---|---|
| See chat history (persisted) | ✅ | — |
| Type message + Enter to send | ✅ | — |
| See typing indicator | ✅ | — |
| Copy assistant response | ✅ | — |
| Clear chat | ✅ | — |
| Inline API key setup if no creds | ✅ | — |
| Instance stopped → start button inline | ✅ | — |
| Streaming responses (token-by-token) | ❌ | Currently waits for full response. 3–5 second wait feels broken. Add SSE streaming. **High priority.** |
| Markdown rendering in responses | ❌ | Responses are plain text. Code blocks, lists, bold not rendered. Add `react-markdown`. |
| Message timestamp on hover | ❌ | Minor but polish |

### 5e. Configuration Tab
| Click / Step | Status | What to build |
|---|---|---|
| Set agent name + role | ✅ | — |
| Pick personality traits (chips) | ✅ | — |
| Add custom instructions | ✅ | — |
| Set business name + industry | ✅ | — |
| Business context textarea | ✅ | — |
| Pick AI model (3 cards) | ✅ | — |
| Toggle memory | ✅ | — |
| Toggle smart thinking | ✅ | — |
| Pick language | ✅ | — |
| Advanced: temperature + max tokens | ✅ | — |
| Save config → syncs to VPS | ✅ | — |
| Live preview of how agent will behave | ❌ | After saving config, send a test message inline to see personality change. |
| Agent template picker (pre-built configs) | ❌ | `lib/agent-templates.ts` exists but no UI in this tab. Add "Start from template" at the top. |
| **Knowledge base upload** | ❌ | No file upload. Users can't give the agent context from their docs/PDFs. **High value for SMBs.** |

### 5f. API Keys Tab
| Click / Step | Status | What to build |
|---|---|---|
| Generate named API key | ✅ | — |
| Copy new key (shown once) | ✅ | — |
| See masked preview of existing keys | ✅ | — |
| Revoke key | ✅ | — |
| See usage examples (curl, Python) | ✅ | — |
| OpenAI-compatible endpoint | ✅ | — |
| Last used timestamp | ✅ | — |

### 5g. Activity Log Tab
| Click / Step | Status | What to build |
|---|---|---|
| See grouped log by day | ✅ | — |
| Auto-refresh every 30s | ✅ | — |
| Event icons | ✅ | — |
| Filter by event type | ❌ | Useful when log gets long. Add dropdown: All / Config / Errors / Chat |
| Export to CSV | ❌ | Low priority |

### 5h. Infrastructure Tab
| Click / Step | Status | What to build |
|---|---|---|
| See provision status | ✅ | — |
| See VPS URL | ✅ | — |
| Check gateway latency | ✅ | — |
| Health check history table | ✅ | — |
| Snapshot list | ✅ | — |
| Trigger config re-sync (admin only) | ✅ | — |
| Self-service snapshot restore | ❌ | Manager-only now. Add "Request rollback" button → messages manager. |
| Uptime percentage calculation | ❌ | Calculate from HealthCheck records: (healthy checks / total checks) × 100 |

---

## Phase 6 — Web Widget (Missing Feature)

**Clients want an AI chat bubble on their website.**

| Step | What to build |
|---|---|
| Generate embed code | `GET /api/instances/[id]/share-links` → returns widget snippet |
| Widget iframe / JS snippet | Standalone `chat/[instanceId]/page.tsx` exists! Just needs styling + copy-paste UI |
| Embed code UI in dashboard | Add "Web Widget" section in Credentials tab with copy button |
| Customization: color, greeting message | Store in `AIInstance.config` JSON |
| CORS whitelist | Add `allowedOrigins` field to config so widget only works on client's domain |

**Dev tasks:**
- [ ] Polish `chat/[instanceId]/page.tsx` as embeddable widget (no nav, minimal chrome)
- [ ] Add "Web Widget" card in Credentials tab with embed code snippet
- [ ] Add origin whitelist field in Configuration tab

---

## Phase 7 — Manager Portal

**Manager's side — where the magic actually happens.**

| Click / Step | Status | What to build |
|---|---|---|
| See all assigned clients | ✅ | — |
| See client onboarding data | ✅ | — |
| Send message to client | ✅ | — |
| Provision instance (1 click) | ✅ | — |
| Select region for provisioning | ❌ | Hardcoded to `nbg1`. Add region selector. |
| Select tier for provisioning | ❌ | Hardcoded to instance's tier. Add dropdown: minimal/standard/pro |
| See instance health per client | ⚠️ | Shows list but no health badge. Add green/red dot per client row. |
| Edit client's agent config | ❌ | Manager can't edit the agent's name, personality, or system prompt from their portal. This is a major gap — the whole point is that managers configure for clients. |
| Push config to VPS from portal | ❌ | Related to above. Manager needs a config form for each client instance. |
| View conversation logs (for QA) | ❌ | Manager can't see what the AI is saying to clients. Add read-only chat log view per instance. |
| Alert: instance went down | ⚠️ | Email alert exists. Add in-app notification in manager portal. |
| Assign new manager (admin only) | ❌ | Admin assigns managers. No UI — must use DB directly. |

**Dev tasks (CRITICAL for the product to work):**
- [ ] Manager config editor — form to set agent name, persona, system prompt, model, channels
- [ ] Manager "push config" → calls `POST /api/admin/instances/[id]/sync-config`
- [ ] Read-only conversation log per client (manager can see last 50 messages)
- [ ] Health badge per client row in manager list
- [ ] In-app alert when client's instance goes down
- [ ] Region + tier picker in provision modal

---

## Phase 8 — Messaging (Client ↔ Manager)

**The relationship layer. This is what differentiates SynapseForge.**

| Click / Step | Status | What to build |
|---|---|---|
| Client sends message | ✅ | — |
| Manager sends reply | ✅ | — |
| See unread badge | ⚠️ | Exists but updates on 10s poll only |
| Notifications when new message arrives | ❌ | No push/email notification to client when manager replies. Client has to manually check. |
| Manager notified of new client message | ❌ | Manager has no notification. Must manually check portal. |
| Rich text in messages | ❌ | Plain text only. At minimum: line breaks should be preserved. |
| File/image attachments | ❌ | Nice to have for sharing screenshots |
| Real-time (SSE or WebSocket) | ❌ | Critical for a "messaging" feature. Polling every 10s is terrible UX. |

**Dev tasks:**
- [ ] SSE endpoint for messages: `GET /api/messages/stream` → client subscribes on messages page
- [ ] Email notification to client when manager sends a message (via Resend)
- [ ] Email notification to manager when client sends a message
- [ ] Manager notification UI in portal (badge + sound)
- [ ] Preserve line breaks in message rendering (`whitespace-pre-wrap`)

---

## Phase 9 — Billing & Upgrade

| Click / Step | Status | What to build |
|---|---|---|
| See current plan + limits | ✅ | — |
| Click "Upgrade" → Stripe checkout | ✅ | — |
| Webhook updates plan | ✅ | — |
| Manage subscription (portal) | ✅ | — |
| Downgrade → plan-enforcement cron | ✅ | — |
| Upgrade prompt when hitting instance limit | ✅ | — |
| See invoices | ✅ (via Stripe portal) | — |
| See next billing date | ✅ | — |
| Upgrade confirmation page / email | ❌ | After Stripe redirect, user just lands on billing page. Add: "🎉 Welcome to Pro! Here's what's unlocked." |
| Cancel flow with exit survey | ❌ | When downgrading from Pro, show "What made you cancel?" — improves churn data |

**Dev tasks:**
- [ ] Post-upgrade success page with feature unlock summary
- [ ] Cancellation survey modal (3 options + optional freetext)

---

## Phase 10 — WhatsApp Channel (Missing — High Priority)

**WhatsApp is the #1 business messaging channel in Europe, LATAM, Middle East.**

### Option A: Twilio (fastest to ship)
- Client gets a Twilio account, connects phone number
- `POST /api/instances/[id]/setup-whatsapp` → saves Twilio credentials
- VPS configures OpenClaw's WhatsApp channel via Twilio bridge

### Option B: Meta Business API (harder, better)
- Requires Meta Business verification
- Direct WhatsApp Business API
- Better delivery, no per-message fee

**Recommended: Start with Twilio for MVP, migrate to Meta later.**

**Dev tasks:**
- [ ] `POST /api/instances/[id]/setup-whatsapp` route
- [ ] Encrypt + store Twilio credentials in `InstanceCredential`
- [ ] WhatsApp setup card in Credentials tab (alongside Telegram/Discord/Slack)
- [ ] OpenClaw config generation includes Twilio bridge settings
- [ ] Test end-to-end: message WhatsApp → AI responds

---

## Sprint Breakdown

### Sprint 1 — Critical Gaps (1–2 weeks)
These are blockers. Product doesn't fully work without them.

1. **Manager config editor** — manager can set agent persona + push to VPS
2. **Streaming chat responses** — add SSE streaming to `/api/instances/[id]/chat`
3. **SSE for messages** — real-time client ↔ manager messaging
4. **Email notifications** — manager ↔ client new message alerts
5. **WhatsApp setup route + UI card**
6. **Region + tier picker in manager provision modal**

### Sprint 2 — UX Polish (1 week)
These make the product feel good.

7. **Markdown rendering in chat** (`react-markdown`)
8. **Password strength on sign-up** (`zxcvbn`)
9. **Real-time validation on sign-up** (blur)
10. **Agent template picker** in onboarding + Configuration tab
11. **Web widget embed code** in Credentials tab
12. **Post-upgrade success page**

### Sprint 3 — Growth Features (2 weeks)
These help acquisition and retention.

13. **Case study / social proof on landing page**
14. **Demo video in hero**
15. **Knowledge base upload** (PDF/text → injected into context)
16. **Manager: read-only conversation log per client**
17. **Activity log filter by event type**
18. **Uptime % on Infrastructure tab**
19. **Cancellation survey modal**
20. **Mobile QA pass** (landing + dashboard + instance detail)

### Sprint 4 — Scale (ongoing)
21. Rate limiting — wire `lib/rate-limit.ts` to all public chat endpoints
22. Admin → manager assignment UI
23. Search/filter on instances list (Enterprise tier)
24. Snapshot restore self-service (button → messages manager)
25. `i18n` — complete Spanish/Russian/Ukrainian translations (currently `en.json` is source of truth)

---

## UX Principles for Every Build

1. **Zero dead ends.** Every error state has a next action. Never just show "Something went wrong."
2. **Contextual help.** First-timers don't know what a bot token is. `?` tooltip > docs link.
3. **Optimistic UI.** Show the result before the server confirms it. Roll back on error.
4. **Progressive disclosure.** Advanced settings (temperature, max tokens) are hidden by default. Don't scare new users.
5. **Loading states everywhere.** Every button that calls an API must show a spinner. No double-submit.
6. **Mobile-first test.** If it looks bad on 375px, fix it before merging.

---

## Component Library Decision

Currently using raw Tailwind + lucide-react. This works but means re-implementing every component (modals, selects, tooltips, toasts).

**Recommendation: Add shadcn/ui now, before Sprint 2.**

Migration path:
1. `npx shadcn@latest init` — non-destructive, adds to existing project
2. Replace custom select, modal, tooltip components one by one
3. Use shadcn `Sonner` for toasts (replace current custom toast)
4. Use shadcn `Dialog` for confirmation modals (replace `window.confirm`)

This will cut ~30% of UI code and fix accessibility issues (focus trapping, ARIA labels) for free.

---

_Every ticket here maps to a user click. If a user can't complete a flow without confusion or a manual workaround, it belongs in Sprint 1 or 2._
