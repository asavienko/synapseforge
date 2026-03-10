# SynapseForge Setup Plan
## Managed AI Support Business — Tiered Service Model

---

## 🎯 Core Concept Reframe

> **Key decisions locked (2026-03-10):**
> - **ICP:** Small & medium business owners
> - **Tech stack:** OpenClaw (primary runtime)
> - **Retention hook:** Ongoing support, improvements, and regular problem resolution
> - **Onboarding:** Setup instance with client's own API keys → connect to their selected channel → they can chat immediately
> - **Legal:** DPA required (GDPR — EU clients)
> - **Referral program:** Invited user gets 1 free Pro month; referrer gets 10% of invitee's spending for first 6 months

---

**What you're selling:** Access to AI expertise + hands-on implementation + ongoing support

**What they're buying:** Someone who actually understands AI to set it up and keep it running

**Competitive moat:** The human relationship, not the software

**Target customer (ICP):** Small and medium business owners — people who have a real business problem but no in-house AI expertise. They don't want to learn tools; they want results.

**Retention mechanism:** Ongoing support + continuous improvements + regular problem resolution. Clients stay because something new always needs fixing, tuning, or expanding. The value compounds over time — a bot that's been refined for 6 months is much better than a fresh setup.

---

## 📊 Service Tiers (3 Levels)

### Tier 1: Starter — "AI Quickstart"
**Price:** $0 (Free forever) → or $99/mo with real support

| Feature | Included |
|---------|----------|
| AI Instances | 1 basic instance |
| Instance Type | Pre-configured templates only (chatbot, email responder, FAQ bot) |
| Support | Self-service docs + community Discord |
| Response Time | — (async only) |
| Manager | AI assistant (bot) |
| Setup | Self-setup with templates |
| Customization | None — templates only |
| Integrations | Web widget, basic API |
| SLA | None |

**Purpose:** Lead generation. Get them in the door, prove value.

---

### Tier 2: Pro — "Managed AI Partner"
**Price:** $499–$999/mo (start at $499, raise as you prove value)

| Feature | Included |
|---------|----------|
| AI Instances | Up to 3 instances |
| Instance Type | Custom configurations allowed |
| Support | Human manager assigned |
| Response Time | 24h business days |
| Manager Check-ins | Weekly 15-min sync |
| Setup | Manager does initial setup |
| Customization | Custom prompts, workflows |
| Integrations | CRM (HubSpot, Pipedrive), Slack, email, Zapier |
| Training | 1x onboarding call |
| SLA | 99% uptime |
| Analytics | Basic usage dashboard |

**Purpose:** Core revenue tier. This is your bread and butter.

**Break-even math (updated with infra cost):**
- Manager: $3k/mo ÷ 10 clients = $300/client
- Infrastructure: ~$8/mo per client (VPS)
- Total cost per Pro client: ~$308/mo
- Revenue per Pro client: $499/mo
- **Margin per Pro client: ~$191/mo**
- At 20 clients/manager: $191 × 20 = **$3,820/mo profit per manager**

---

### Tier 3: Enterprise — "AI Team as a Service"
**Price:** $2,499–$5,000+/mo (custom pricing)

| Feature | Included |
|---------|----------|
| AI Instances | Unlimited |
| Instance Type | Fully custom + multi-agents |
| Support | Dedicated manager (shared with max 5 accounts) |
| Response Time | 4h business days, urgent = 1h |
| Manager Check-ins | Weekly 30-min strategy calls |
| Setup | Full discovery + custom build |
| Customization | Everything — custom tools, API connections |
| Integrations | Any ( custom dev if needed) |
| Training | Team training sessions |
| SLA | 99.9% uptime + priority support |
| Analytics | Full dashboard + monthly reports |
| Roadmap | Quarterly strategy planning |
| White-label | Optional (add $1k/mo) |

**Purpose:** High-margin accounts. 5–10 of these = comfortable business.

---

## 💰 Pricing Psychology

| Tier | Monthly | Annual (2 months free) |
|------|---------|------------------------|
| Starter | Free | — |
| Pro | $499/mo | $4,990/yr (save $998) |
| Enterprise | $2,999/mo | $29,990/yr (save $5,998) |

**Anchoring:** Show enterprise first or make Pro feel like the smart middle choice.

---

## 🏗️ Technical Infrastructure (MVP)

### What You Need Now (Before Taking Paying Customers)

1. **Instance Runtime** — **OpenClaw** (decided)
   - Each client = their own managed OpenClaw instance on **separate infrastructure** (separate VPS/server)
   - True isolation — no shared resources, no noisy neighbor problems, no cross-client data risk
   - Clients configure their own API keys in the instance settings web UI (no sharing keys between clients)
   - Supported providers: **OpenAI, Anthropic, OpenRouter** (and any others OpenClaw supports)
   - Clients can plug in different providers per use case (e.g. GPT-4o for support bot, Claude for long-form, OpenRouter for cost optimization)
   - From the web UI they can also integrate external services (CRM, Slack, Telegram, WhatsApp, etc.)
   - Manager has admin access to client's instance for setup, tuning, and troubleshooting
   - **Key selling point:** Client owns their keys → no vendor lock-in to SynapseForge; they're paying for expertise and management, not access to a proprietary system

2. **Dashboard** — What you have is fine for MVP
   - Instance list, start/stop, basic config
   - Manager messaging (Phase 1 ✅)

3. **Infrastructure per client** — one VPS per OpenClaw instance
   - Recommended: Hetzner CX22 (~€4–6/mo) or DigitalOcean Basic ($6/mo) per client
   - At scale: bake this into pricing — it's a small but real cost
   - Automate provisioning early (Ansible, shell script, or Coolify) — manual setup doesn't scale past 10 clients
   - Cost model: ~$6–10/mo per client for infra → easily absorbed in Pro/Enterprise margins

4. **Billing** — Stripe integration
   - Subscription management
   - Usage tracking (for overages)

5. **Monitoring** — Per-instance uptime checks
   - UptimeRobot or Betterstack (free tier covers many endpoints)
   - Alert to your Slack/Telegram when an instance goes down
   - SLA promises require you to actually know when things break

### What Can Wait

- Fully automated provisioning (do it manually for first 10 clients, then automate)
- Advanced analytics (start with simple counters)
- White-label (only when you have 2+ agency clients asking)

---

## 👥 Team Structure (Lean Start)

### Phase 1: You + 1 Manager (0–20 clients)
- **You:** Sales, technical architecture, escalations
- **Manager:** Day-to-day support, setup, client communication
- **Rate:** Manager = $2,500–$3,500/mo (part-time to start)

### Phase 2: You + 2–3 Managers (20–50 clients)
- **You:** Sales, strategy, hiring
- **Manager 1:** Handles 15–20 Starter/Pro accounts
- **Manager 2:** Handles 10–15 Pro/Enterprise accounts
- **Option:** Contractors, not employees (lower risk)

### Phase 3: Scale (50+ clients)
- Hire Manager Lead (senior person who manages other managers)
- Consider junior managers ($1,500/mo) handling only Starter tier

---

## 🎬 Go-to-Market Plan (30-Day Sprint)

### Week 1–2: Position & Package
- [ ] Finalize tier descriptions
- [ ] Create 1-pager PDF: "SynapseForge — Your AI Team Without the Headcount"
- [ ] Set up simple landing page with pricing (use what you have)
- [ ] Create 3 template instances (customer support bot, FAQ bot, lead qual bot)

### Week 3: Warm Outreach
- [ ] List 20 people in your network who own SMBs
- [ ] Send personal messages: "I'm launching something — can I get your feedback?"
- [ ] Convert 3 to free Starter accounts
- [ ] Get feedback, iterate

### Week 4: Soft Launch
- [ ] Post on LinkedIn about what you're building
- [ ] Join 3 relevant communities (Slack/Discord groups for SMBs)
- [ ] Offer 3 founder-led Pro accounts at $299/mo (50% off for first 3 months)
- [ ] Goal: 1 paying customer

---

## 📋 Immediate Action Items

### This Week

1. **Define your first 3 template instances**
   - What can you configure in <30 minutes?
   - What provides immediate value?
   - Examples: Website FAQ bot, Email auto-responder, Lead qualification bot

2. **Get instance runtime working**
   - Pick option (n8n recommended for speed)
   - Connect to dashboard (API call to start/stop)
   - Prove it works end-to-end

3. **Create pricing page**
   - Add to your web app
   - Make Pro the "highlighted" tier

4. **Draft service agreement**
   - What do you promise?
   - What's excluded?
   - Simple 1-page terms

### Next 2 Weeks

5. **Find your first manager**
   - Could be a contractor from Upwork/Toptal
   - Or someone you know who gets AI
   - Start part-time (10 hrs/week)

6. **Get 3 beta users**
   - Free in exchange for feedback
   - Must be real businesses with real use cases
   - Document their experience

---

## ⚠️ Critical Decisions to Make

| Decision | Options | Decision |
|----------|---------|--------|
| Instance runtime | n8n / LangChain / Voiceflow / OpenClaw | ✅ **OpenClaw** |
| First manager | Hire now / You do it all / Wait for revenue | ✅ **You handle first 5 clients** |
| Free tier | Real free / $99/mo / No free tier | ✅ **Free with AI bot, $99+ for human** |
| Target customer | Agencies / E-commerce / SMBs | ✅ **SMB owners** |
| Geographic focus | US / EU / Global | Start with your timezone (EU) |
| Referral program | None / Credits / Cash | ✅ **10% of spend for 6mo + 1 free month for invitee** |
| GDPR/Legal | DIY / Template / Lawyer | ✅ **Proper DPA + ToS required** |

---

## 🎯 Success Metrics (Month 1)

- [ ] 5 users on Starter (feedback gathering)
- [ ] 1 paying Pro customer
- [ ] Instance runtime works end-to-end
- [ ] Manager system documented (even if you're the manager)
- [ ] First $500 in revenue

---

## 🚀 Client Onboarding Flow

**Goal:** Client goes from "signed up" to "talking to their AI" in under 30 minutes.

1. **Provision:** Spin up a fresh OpenClaw instance for the client
2. **Keys:** Client opens instance settings web UI → enters their own API keys (OpenAI / Anthropic / OpenRouter / etc.)
   - Manager can guide them through this or do it on a screenshare
   - Keys stay on their instance — SynapseForge never stores or sees them
3. **Configure:** Manager sets up the agent (persona, instructions, tone, tools)
4. **Integrate:** Connect their chosen channel(s) in the instance settings — Telegram, WhatsApp, Slack, web widget, etc.
5. **Test:** Manager sends a test message through each connected channel — confirm it works end-to-end
6. **Handoff:** Brief intro call or Loom video — "here's how to chat with your AI, here's how to reach your manager"
7. **Done:** Client is live

No friction. No "we'll set this up in a few days." Same session if possible.

**Instance settings the client controls (post-onboarding):**
- Switch or update API keys anytime (e.g. upgrade from gpt-4o-mini to gpt-4o)
- Add new integrations (new channels, services)
- View basic usage / message volume
- Everything else → managed by their assigned manager

---

## 🔗 Referral Program

**For the person referring (existing client):**
- Gets **10% of referred client's spending** for the first 6 months
- Paid as credit toward their own subscription (or cash — decide later)

**For the referred (new client):**
- Gets **1 free month of Pro** ($499 value) when they sign up

**Why it works:**
- Existing client has real monetary incentive to sell for you
- New client has a risk-free entry point
- No cold outreach needed once flywheel starts

**Tracking:** Simple referral link or code per client. Log manually at first.

---

## ⚖️ Legal & GDPR

**Required before accepting EU clients (which is most of your early network):**

- [ ] **DPA (Data Processing Agreement)** — defines what data you process, how, and for how long
- [ ] **Privacy Policy** — covers your platform's data handling
- [ ] **Terms of Service** — scope of service, SLAs, exclusions, liability cap
- [ ] **Data deletion process** — clients must be able to request their data removed

**Practical approach:** Use a lawyer template service (Iubenda, Termly, or a one-time freelance lawyer). Don't DIY this. ~€300–500 to do it properly once.

---

## 🚀 Next Step

**Pick ONE thing and do it today:**

1. Decide on your 3 template instances
2. Get n8n running locally and connected
3. Update pricing page
4. Message 5 people in your network

Which one?

---

*Plan created: 2026-03-09*
*Last updated: 2026-03-10 — ICP, tech stack, onboarding, referral program, and legal requirements locked*
*Status: Active — core decisions made, execution ready*
