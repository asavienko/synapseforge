# SynapseForge Setup Plan
## Managed AI Support Business — Tiered Service Model

---

## 🎯 Core Concept Reframe

**What you're selling:** Access to AI expertise + hands-on implementation + ongoing support

**What they're buying:** Someone who actually understands AI to set it up and keep it running

**Competitive moat:** The human relationship, not the software

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

**Break-even math:** If you pay a manager $3k/mo and they handle 10 clients = $300 cost per client. At $499/mo, you make $199/client. Scale to 20 clients/manager = $199 × 20 = $3,980 margin per manager.

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

1. **Instance Runtime** — Actual AI that runs
   - Option A: n8n self-hosted + OpenAI API (fastest to launch)
   - Option B: LangChain + FastAPI + OpenAI (more control)
   - Option C: Reuse existing tools (Voiceflow, Stack AI, etc.) via API

2. **Dashboard** — What you have is fine for MVP
   - Instance list, start/stop, basic config
   - Manager messaging (Phase 1 ✅)

3. **Billing** — Stripe integration
   - Subscription management
   - Usage tracking (for overages)

4. **Monitoring** — Simple uptime checks
   - UptimeRobot or Pingdom free tier
   - Alert to your email/Slack

### What Can Wait

- Custom AI hosting (use APIs for now)
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

| Decision | Options | My Rec |
|----------|---------|--------|
| Instance runtime | n8n / LangChain / Voiceflow / Custom | n8n for speed |
| First manager | Hire now / You do it all / Wait for revenue | You do it for first 5 clients |
| Free tier | Real free / $99/mo / No free tier | Free with AI manager, $99 for human |
| Target customer | Agencies / E-commerce / Local business | Start with one vertical |
| Geographic focus | US / EU / Global | Start with your timezone |

---

## 🎯 Success Metrics (Month 1)

- [ ] 5 users on Starter (feedback gathering)
- [ ] 1 paying Pro customer
- [ ] Instance runtime works end-to-end
- [ ] Manager system documented (even if you're the manager)
- [ ] First $500 in revenue

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
*Status: Draft — review and adjust before execution*
