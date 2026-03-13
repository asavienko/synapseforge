# SynapseForge — Integration Roadmap
_Last updated: 2026-03-13_

> Integrations split into two types:
> - **Inputs** — give the AI more context → smarter answers
> - **Outputs** — AI takes actions → real business value
>
> The second type is what makes success stories real.
> A client who says "my AI books appointments automatically" doesn't churn.

---

## Tier 1 — Must Have (Direct Revenue Impact)

### 📱 Communication Channels

These extend where the AI lives. More channels = more conversations = more client value.

---

#### WhatsApp Business (⚡ Highest Priority)

**Why:** #1 business messaging channel in Europe, LATAM, Middle East.
The Lumina case study is literally about WhatsApp. Without it, every Spanish/Italian/Brazilian client is underserved.

**Two paths:**
| Path | Effort | Cost | Quality |
|---|---|---|---|
| **Twilio WhatsApp** | 2–3 days | $0.005/msg | Good for MVP |
| **Meta Business API** | 2–3 weeks + Meta review | ~$0.002/msg | Best, required for scale |

**Start with Twilio.** Client gets a Twilio number, connects it here. Meta API requires business verification — do that in parallel.

**What the client provides:** Twilio Account SID + Auth Token + WhatsApp-enabled number
**What happens:** Messages from their WhatsApp number → AI → response sent back

**Success story it enables:** Lumina story is now 100% real.

---

#### Instagram Direct Messages

**Why:** 500M+ DMs/day. Service businesses get flooded with DMs asking "what are your prices?"
Same Meta API as WhatsApp (one approval covers both).

**What the client provides:** Instagram Business account connected via Meta OAuth
**What happens:** DMs → AI handles → responds as the business account

**Note:** Requires the same Meta Business API approval. Once WhatsApp is through review, Instagram is essentially free.

---

#### Facebook Messenger

**Why:** Older demographic. Service businesses (restaurants, salons) still get customer inquiries here.
Same Meta API. Negligible extra effort once Instagram is connected.

---

#### SMS / Text Messaging (Twilio)

**Why:** US market. Many US businesses use SMS for customer communication.
E-commerce order updates, appointment reminders, customer support.

**What the client provides:** Twilio credentials + phone number
**What the AI does:** Responds to inbound texts. Keeps replies under 160 chars by default.

---

#### Email Inbox (IMAP/SMTP)

**Why:** Every business has a support@ or info@ inbox drowning in the same questions.
This is the "WhatsApp equivalent" for older industries (B2B, legal, healthcare).

**What the client provides:** IMAP credentials (or Gmail OAuth)
**What happens:** AI monitors inbox → drafts replies → sends (or queues for human review first)

**Two modes:**
- **Auto-reply** — AI sends immediately (for FAQs)
- **Draft mode** — AI drafts, human approves before sending (for sensitive industries)

**Tech:** `node-imap` + `nodemailer`. No API key needed beyond client's email credentials.

---

### 📅 Booking & Calendar (Output — Highest Value)

This is the difference between "AI answers questions" and "AI books appointments."
The Lumina story: Carlos manually forwarded booking requests to Maria. With calendar integration, the AI checks real availability and confirms directly.

---

#### Google Calendar (Direct)

**What it enables:**
- AI checks calendar for availability: *"Are you free Thursday at 3pm?"* → AI checks → *"Yes, shall I book that?"*
- Creates events on confirmation
- Sends calendar invite to client's customer

**What the client provides:** Google OAuth (read + write Calendar scope)
**Tech:** Google Calendar API v3 — well-documented, free, no approval needed

**This single integration turns the AI from an FAQ bot into a booking assistant.**

---

#### Calendly

**Why:** Many businesses already use Calendly. Don't replace their stack — integrate with it.

**What it enables:**
- AI checks available slots via Calendly API
- Generates a booking link for a specific event type
- After booking: AI confirms and sends details

**What the client provides:** Calendly API key
**Tech:** Calendly API v2 (REST, easy)

---

#### Acuity Scheduling / Squarespace Scheduling

**Why:** Popular with wellness (massage, beauty, physio — exactly the Lumina client profile).
Same concept as Calendly.

---

#### Booksy (Beauty/Wellness Specific)

**Why:** Booksy is the dominant booking platform for salons, barbershops, spas in Europe.
Huge overlap with the SynapseForge target client.

**What it enables:**
- AI queries real-time availability from Booksy
- Confirms booking directly inside Booksy (no double-booking)
- Sends confirmation to customer

**Tech:** Booksy API (requires partner program enrollment)

---

## Tier 2 — High Value (Specific Verticals)

### 🛒 E-commerce

---

#### Shopify

**What it enables:**
- *"Where's my order?"* → AI looks up order status in real-time
- *"Do you have this in size M?"* → AI checks inventory
- *"Can I return this?"* → AI checks return eligibility by order date

**Two modes:**
- **Read-only** (Input): AI has read access to orders + products
- **Write** (Output): AI can create draft orders, apply discounts, initiate returns

**What the client provides:** Shopify store URL + private app API key
**Tech:** Shopify Admin REST API or GraphQL

**Success story it enables:**
*"Our AI handles 80% of post-purchase support questions automatically."*

---

#### WooCommerce

Same concept as Shopify but for WordPress stores.
**Tech:** WooCommerce REST API (built-in, just needs API key)

---

### 🏥 Healthcare / Wellness

---

#### Mindbody (Fitness & Wellness)

**Why:** The dominant platform for gyms, yoga studios, wellness centers.
Same client profile as Lumina but bigger: fitness chains, yoga studios.

**What it enables:**
- Class schedule queries: *"What yoga classes do you have Tuesday morning?"*
- Membership status: *"Is my membership active?"*
- Class booking (with Mindbody OAuth)

**Tech:** Mindbody API (public, needs API key approval)

---

#### Zendesk / Intercom (Support Escalation)

**Why:** When the AI can't answer, it should create a support ticket automatically.
Clients with existing Zendesk/Intercom setups don't want to migrate — they want the AI to feed into their existing workflow.

**What it enables:**
- AI can't answer → creates Zendesk ticket with full conversation context
- Ticket assigned to human agent
- Customer gets: *"I've created a support ticket for you. You'll hear back within 2 hours."*

**This is the "graceful handoff" that enterprise clients require.**

---

### 💰 Payments

---

#### Stripe (Payment Links)

**What it enables:**
- *"I'd like to buy the 3-session massage package"* → AI generates Stripe payment link → sends to customer → payment complete
- AI confirms payment and books the appointment

**What the client provides:** Stripe secret key
**Tech:** `stripe.paymentLinks.create()` — one API call, no webhook needed

**This turns the AI into a sales channel, not just a support channel.**

---

#### PayPal

Same concept for clients who prefer PayPal. Especially relevant for US + older demographics.

---

## Tier 3 — CRM & Business Operations (B2B Focus)

### 🗂️ CRM Integrations

These matter most for the Sales Bot and Customer Support templates. B2B clients.

---

#### HubSpot

**What it enables (Input):**
- AI knows if the person is already a lead/customer before responding
- Personalizes response: *"Hi James, I see you tried our Pro plan last month..."*

**What it enables (Output):**
- Conversation ends → AI creates a contact in HubSpot with notes
- Qualifies lead → AI creates a deal in the pipeline
- *"I'm interested in pricing"* → AI captures name + email + need → HubSpot deal created

**What the client provides:** HubSpot private app token
**Tech:** HubSpot CRM API v3 (REST, well-documented, free tier)

---

#### Pipedrive

Same concept. More popular with SMB sales teams in Europe.

---

#### Google Sheets (Universal CRM Replacement)

**Why:** Many SMBs don't use a CRM. They use a Google Sheet.
This is the 80/20 — huge number of clients, simple integration.

**What it enables:**
- AI captures lead info → appends row to Google Sheet automatically
- *"We got 23 new leads this week — all in your spreadsheet"*
- AI can query the sheet for product/pricing data

**What the client provides:** Google OAuth (Sheets scope)
**Tech:** Google Sheets API v4

**Success story:** *"Every lead that messages our AI appears in our spreadsheet automatically. No manual data entry."*

---

#### Notion

**Input:** AI reads from a Notion database (product catalog, FAQ, price list)
**Output:** AI creates pages (meeting notes, lead records)

Popular with modern SMBs and agencies. Easy API.

---

#### Airtable

Same as Notion but more CRM-like. Very popular with operations-heavy businesses.

---

## Tier 4 — Analytics & Feedback

---

#### Google Analytics 4

**What it enables:**
- Track AI conversations as events in GA4
- Attribute leads/sales that came through the AI
- Show in client dashboard: "Your AI generated 14 website leads this month"

**Tech:** GA4 Measurement Protocol — server-side event sends, no client-side SDK needed

---

#### Google Business Profile (Reviews)

**Why:** Service businesses get reviews on Google. AI can:
- Monitor new reviews (1-star, 2-star) → alert the manager
- Draft a response to the review (manager approves before posting)
- Answer questions posted in Google Q&A

**Tech:** Google My Business API (requires OAuth + business verification)

---

#### Typeform / Tally

**Input:** When AI collects structured data (lead qualification, feedback), send it to a Typeform/Tally form for storage and reporting.
**Simple:** Just a webhook POST to their endpoint.

---

## Tier 5 — Productivity & Automation Hubs

---

#### Zapier (Already in plan)
One integration → 6,000+ apps. See DEV_PLAN_EXTENDED.md.

---

#### Make (formerly Integromat)

European alternative to Zapier. More popular in Spain/Germany.
Same concept — SynapseForge triggers → Make scenario runs.

---

#### n8n (Self-hosted)

For technical clients who want full control. n8n is open source.
Provide a pre-built SynapseForge node for n8n.

---

#### Google Workspace (Docs, Drive, Gmail)

**What it enables:**
- AI can read Google Docs as knowledge source (product manual, employee handbook)
- AI can create Google Docs (generate report, draft contract)
- AI can send emails via Gmail on behalf of the business

---

## Integration Priority Matrix

```
             │  High Impact   │  Low Impact  │
─────────────┼────────────────┼──────────────┤
 Low Effort  │ WhatsApp       │ Facebook Msg │
             │ Google Cal     │ SMS          │
             │ Google Sheets  │ Tally        │
─────────────┼────────────────┼──────────────┤
 High Effort │ Shopify        │ Salesforce   │
             │ Stripe         │ Mindbody     │
             │ Instagram DMs  │ Booksy       │
             │ HubSpot        │ Zendesk      │
```

**Build order:** Low effort + high impact first. Always.

---

## Integration UX — How to Present This in the Dashboard

Don't show 20+ integrations in a flat list. Users will be overwhelmed.

**Recommended structure:**

```
Credentials tab → "Channels" section
├── Telegram ✅ Connected
├── WhatsApp — Connect →
├── Instagram — Connect →
└── More channels ▾ (Discord, Slack, SMS, Email)

Credentials tab → "Business Tools" section (new)
├── Calendar & Booking
│   ├── Google Calendar — Connect →
│   ├── Calendly — Connect →
│   └── Booksy — Connect →
├── CRM & Leads
│   ├── Google Sheets — Connect →
│   ├── HubSpot — Connect →
│   └── Pipedrive — Connect →
└── E-commerce
    ├── Shopify — Connect →
    └── WooCommerce — Connect →
```

**Progressive revelation:** Show only the 2–3 most relevant integrations based on their onboarding use case.
- Customer Support template → show Zendesk, Google Sheets, HubSpot
- Booking template → show Google Calendar, Calendly, Booksy
- E-commerce template → show Shopify, Stripe, WooCommerce

This is driven by `AIInstance.type` + `User.onboardingData.useCase` already in the DB.

---

## New Agent Templates to Add

Current templates: Customer Support, Sales Bot, FAQ Bot, Internal Helpdesk, Content Writer, Custom.

Add these to match integrations:

| Template | Key Integrations | Primary Channel |
|---|---|---|
| **Appointment Booking Bot** | Google Cal + Booksy/Calendly | WhatsApp, Instagram |
| **E-commerce Support** | Shopify + Stripe | Web widget, WhatsApp |
| **Lead Qualifier** | HubSpot + Google Sheets | Web widget, Telegram |
| **Restaurant Assistant** | Google Cal + Google Business | WhatsApp, Instagram |
| **Real Estate Agent** | Calendly + HubSpot | WhatsApp, Web widget |
| **HR / Recruiting Bot** | Google Sheets + Email | Web widget, Telegram |

Each template pre-populates: system prompt, suggested integrations to connect, example use cases.

---

## Technical Architecture for Integrations

All integrations follow the same pattern:

```
1. Client provides credentials (OAuth or API key)
2. Stored encrypted in InstanceCredential (key = "google_calendar_token" etc.)
3. VPS config updated (credentials synced to OpenClaw)
4. On each chat message:
   - AI decides if it needs to call an integration (function calling / tool use)
   - Calls the integration API
   - Incorporates result into its response
5. Result stored in ChatMessage with tool_calls metadata
```

**OpenClaw already supports tool/function calling.** Each integration is just a tool definition:

```json
{
  "name": "check_calendar_availability",
  "description": "Check Google Calendar for available appointment slots",
  "parameters": {
    "date": "string",
    "duration_minutes": "integer"
  }
}
```

This means each new integration is:
1. A new `InstanceCredential` key type
2. A tool definition pushed to the VPS config
3. A credential UI card in the dashboard

No new backend routes needed per integration (just new credential keys).

---

## Revenue Impact Per Integration

| Integration | Likely Upsell Path |
|---|---|
| Google Calendar | Free → Pro (needs dedicated VPS for webhook reliability) |
| WhatsApp | Strongest Free → Pro converter (volume drives need for Pro tier) |
| Shopify | Pro → Enterprise (high message volume, needs cx32+ VPS) |
| HubSpot | Enterprise tier (B2B clients have budget) |
| Booksy/Mindbody | Stickiest integration — once connected, near-zero churn |

---

_Prioritization: WhatsApp → Google Calendar → Google Sheets → Shopify → HubSpot → Stripe_
_These six integrations cover 80% of the SMB use cases that SynapseForge targets._
