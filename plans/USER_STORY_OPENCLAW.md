# SynapseForge — Core User Story: Managed OpenClaw Instance

_Created: 2026-03-12_
_Purpose: Define the core product flow around OpenClaw as the runtime_

---

## The Central Premise

> **Every SynapseForge client gets a managed OpenClaw instance.**
> We deploy it, configure it, integrate it, and keep it running.
> They get the power of a full AI stack without touching infrastructure.

OpenClaw is not a backend detail — it IS the product. SynapseForge is the managed layer around it.

---

## 👤 Primary User Story

**As a small business owner,**
I want a fully set-up AI assistant that works in the tools I already use (Telegram, WhatsApp, Slack, email, etc.),
**So that** I can save time on repetitive communication and support without hiring anyone or learning any new software.

---

## 📖 Full User Journey (End-to-End)

### Step 1: Discovery & Sign-Up
- User visits synapseforge.ai
- They see: "Get a dedicated AI — fully managed, no setup needed"
- They sign up with email
- They're taken to an onboarding flow (not the dashboard yet)

### Step 2: Onboarding Interview
- "Tell us about your business" — industry, size, main pain point
- "Which channels do you use?" — Telegram, WhatsApp, Slack, email, web widget
- "What should your AI help with?" — customer support, lead qualification, appointment booking, FAQ, internal ops
- "Do you have an AI provider account?" — OpenAI / Anthropic / OpenRouter (or we can use ours for Starter)
- User submits → manager gets notified with full context

### Step 3: Manager Reaches Out
- Manager receives notification (in the manager portal + email)
- Manager reviews the onboarding data
- Manager sends a welcome message via the in-app messenger
- Message includes: "I'm [name], your dedicated manager. I'll have your AI ready within [X hours]. Here's what I'll set up for you..."

### Step 4: Instance Provisioning (Manager-Side)
- Manager clicks "Provision Instance" in the admin/manager portal
- System spins up a VPS (Hetzner/DO) via the provisioning API
- OpenClaw gateway is installed and started automatically
- Manager is shown the instance URL and admin credentials

### Step 5: Instance Configuration (Manager-Side)
- Manager opens the OpenClaw admin UI for this client's instance
- Configures:
  - Agent persona, system prompt, tone
  - Knowledge base (client docs, FAQs, product info)
  - Tools (calendar, CRM, ticketing — if applicable)
  - Model selection (GPT-4o, Claude, etc.)
- Manager sets up channels in OpenClaw:
  - Telegram bot → connects to client's bot token
  - WhatsApp → configures Business API or Twilio bridge
  - Web widget → generates embed code
  - Slack → bot added to client's workspace
  - etc.

### Step 6: Keys & Credentials Setup
- If client has their own API keys: manager guides them through entering keys in the SynapseForge dashboard's "Credentials" section
  - Keys are encrypted and pushed to the client's instance securely
  - Client keys never stored in plaintext; never visible to SynapseForge staff after save
- If using SynapseForge shared keys (Starter tier): handled transparently, usage tracked per instance

### Step 7: Handoff to Client
- Manager runs a test: sends messages through every connected channel, confirms responses
- Manager messages client: "Your AI is live! Here's how to reach it: [channel links]"
- Manager sends a short Loom or instructions: "Here's what it can do, here's how to reach me if you need changes"
- Client dashboard now shows:
  - Instance status: 🟢 Running
  - Connected channels (with icons)
  - Manager card with name + message button
  - Basic usage stats (messages today, this week)

### Step 8: Client Uses Their AI
- Client (or their customers) interact with the AI through their chosen channels — Telegram, web widget, etc.
- The AI responds using the configured persona and knowledge
- Client can view logs and conversation history in the dashboard
- Client can request config changes by messaging their manager

### Step 9: Manager Ongoing Support
- Manager receives alerts if the instance goes down (health check fails)
- Manager proactively checks in weekly: "How's the AI working for you? Any issues?"
- Manager refines config based on feedback: updates prompts, adds knowledge, adjusts tone
- Manager handles any channel-specific issues (token refresh, webhook reconnect, etc.)

### Step 10: Growth & Upgrade
- As client sees value, they ask for more:
  - More channels → manager adds
  - More instances (second bot for a different department) → upgrade to Pro
  - Custom integrations (CRM sync, calendar booking) → custom project or Enterprise
- Upgrade happens through dashboard → Stripe checkout
- Manager handles the technical side of expansion

---

## 🧩 What OpenClaw Handles (The Core Stack)

| Capability | OpenClaw Feature |
|---|---|
| Multi-channel messaging | Telegram, WhatsApp, Slack, Signal, Discord, iMessage connectors |
| AI model routing | Anthropic, OpenAI, OpenRouter, Fireworks — all supported |
| Agent persona & memory | SOUL.md, MEMORY.md, context files |
| Tool use | Web search, file read/write, calendar, exec, browser |
| Scheduling & cron | Heartbeat system, cron jobs |
| Multi-agent orchestration | Sub-agents, sessions_spawn |
| Per-client isolation | Separate instance per client (separate VPS, separate config) |
| Admin access for manager | Manager has OpenClaw admin credentials for the client's instance |

---

## 🖥️ What SynapseForge Dashboard Adds

The dashboard is the **management layer** — not the AI layer.

| Feature | Purpose |
|---|---|
| Instance list & status | Client sees their AI instances at a glance |
| Channel connection UI | Visual interface to connect Telegram/WhatsApp/etc. (calls OpenClaw API) |
| Credentials vault | Encrypted storage for client API keys, pushed to OpenClaw instance |
| Manager messaging | In-app thread between client and their manager |
| Usage & analytics | Message volume, uptime, token usage |
| Billing | Stripe subscription management |
| Config request | Client can request changes → manager gets notified |
| Snapshot/rollback | Manager can restore instance to a previous state |

---

## 🔑 Key Differentiators vs. DIY OpenClaw

| DIY OpenClaw | SynapseForge Managed |
|---|---|
| Install it yourself | We deploy it for you |
| Configure it yourself | Manager configures it |
| Connect channels yourself | Manager sets up and maintains channels |
| Troubleshoot yourself | 24h/4h manager response + auto-alerts |
| No one to ask | Dedicated human manager |
| Skills break with updates | Manager handles maintenance |
| Your problem when it fails | Our problem when it fails |

---

## 📋 Acceptance Criteria (MVP)

For the core user story to be complete, the following must work:

- [ ] Client signs up → onboarding data captured
- [ ] Manager receives notification with client context
- [ ] Manager can provision an OpenClaw instance from the admin panel (1 click or guided)
- [ ] Manager can push config to the instance (via OpenClaw API or SSH)
- [ ] Client enters API keys in dashboard → securely transmitted to instance
- [ ] At least 1 channel (Telegram) can be connected through the dashboard
- [ ] Client can see instance status (running/stopped) in real-time
- [ ] Manager and client can exchange messages in-app
- [ ] Manager receives alert if instance goes down
- [ ] Client can view basic usage stats

---

## 🔧 Technical Integration Points (OpenClaw API)

SynapseForge dashboard needs to talk to each client's OpenClaw instance:

1. **Health check:** `GET /api/v1/health` → shows instance is alive
2. **Config update:** Push updated config files via SSH or OpenClaw's config API
3. **Status:** `GET /api/v1/instance` → get running status, uptime
4. **Restart:** `POST /api/v1/restart` → restart the gateway
5. **Logs:** `GET /api/v1/logs` → stream or fetch recent logs
6. **Channel management:** OpenClaw channel config → managed via config files pushed by SynapseForge

---

## 🗺️ Implementation Priority

1. **Provisioning flow** — manager can spin up an OpenClaw VPS from admin panel
2. **Instance health/status** — real-time status from OpenClaw gateway API
3. **Credential vault** — client enters keys → encrypted → pushed to instance
4. **Channel setup UI** — Telegram first (most common), then WhatsApp, Slack
5. **Manager messaging** — core relationship channel
6. **Onboarding flow** — capture business context at signup
7. **Usage/analytics** — token counts, message volume
8. **Snapshot/rollback** — Restic backups via cron

---

_This document defines the north star for SynapseForge product development._
_All features should be evaluated against: "Does this help managers deploy, configure, or maintain OpenClaw instances for clients?"_
