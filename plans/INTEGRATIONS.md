# SynapseForge — Agent Integrations Plan
_Last updated: 2026-03-13_

> Agent superpowers: what the AI can actively DO in the world.
> Implemented as tool-calling integrations — the LLM calls tools, tools call external APIs.

---

## Architecture: Agent Tool Framework

All integrations are built on a unified tool-calling framework:

```
User message → LLM (with tool definitions) → LLM requests tool call → Tool executor → External API → Result → LLM → Final response
```

### Tool definition structure (`src/lib/tools/`)

```ts
// src/lib/tools/types.ts
export interface AgentTool {
  name: string;                    // "web_search"
  description: string;            // shown to LLM
  parameters: Record<string, unknown>;  // JSON Schema
  requiredCredential?: string;     // credential key needed (e.g. "tavily_api_key")
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<string>;
}

export interface ToolContext {
  instanceId: string;
  credentials: Record<string, string>;  // decrypted credentials for this instance
}
```

### Chat route integration

In `POST /api/instances/[id]/chat`, after resolving credentials:
1. Load tools enabled for this instance (based on which credentials are present)
2. Pass tool definitions to LLM via `tools` parameter
3. If LLM returns a `tool_use` / `function_call` response: execute tool, append result, re-invoke LLM
4. Stream final response to client

### Tool enablement
Tools auto-enable when their required credential exists:
- Has `tavily_api_key` → `web_search` tool enabled
- Has `facebook_page_token` → `facebook_*` tools enabled
- No credential needed → `get_current_time`, `calculate` always enabled

---

## Tier 1: Must-Have (high SMB demand, low effort)

### 1. Web Search (Tavily + Brave)

**Credential keys:** `tavily_api_key` OR `brave_api_key`
**Tools:** `web_search(query, max_results?)`

```ts
// Tavily: structured results for AI agents
POST https://api.tavily.com/search
{ query, search_depth: "basic", max_results: 5 }

// Brave: general web search
GET https://api.search.brave.com/res/v1/web/search?q={query}&count=5
Authorization: X-Subscription-Token {brave_api_key}
```

**Use cases:**
- FAQ bot answering current info questions
- Competitor research on demand
- News monitoring for client's industry

---

### 2. Firecrawl (URL → clean text)

**Credential key:** `firecrawl_api_key`
**Tools:** `read_url(url)`, `scrape_site(url, pages?)`

```ts
POST https://api.firecrawl.dev/v0/scrape
{ url, pageOptions: { onlyMainContent: true } }
```

**Use cases:**
- Agent reads any URL the user pastes
- Monitor competitor pages for changes
- Extract text from articles for summarization

---

### 3. Google Maps / Places

**Credential key:** `google_maps_api_key`
**Tools:** `find_places(query, location?, type?)`, `get_place_details(placeId)`

```ts
// Places Text Search
GET https://maps.googleapis.com/maps/api/place/textsearch/json?query={q}&key={key}

// Place Details
GET https://maps.googleapis.com/maps/api/place/details/json?place_id={id}&key={key}
```

**Use cases:**
- "Find 50 plumbers in Madrid with phone numbers" → lead list
- Local business chatbot: tell customers how to get there
- Yelp-style competitor research

---

### 4. Whisper Voice Input

**Credential key:** `openai_api_key` (reuses existing)
**Tool:** `transcribe_audio(audioUrl)` (internal, triggered by WhatsApp voice notes)

```ts
// When WhatsApp message has audio attachment:
POST https://api.openai.com/v1/audio/transcriptions
FormData: { file: audioBlob, model: "whisper-1" }
```

**Use cases:**
- WhatsApp users send voice notes → agent transcribes → responds as normal
- Accessibility: voice-first interactions

---

## Tier 2: High Value (medium effort)

### 5. Facebook Graph API

**Credential keys:** `facebook_page_token`, `facebook_page_id`
**Tools:**
- `facebook_get_comments(postId?, limit?)` — read Page post comments
- `facebook_reply_comment(commentId, message)` — reply to a comment
- `facebook_post(message, link?)` — post to Page
- `facebook_get_insights(metric, period?)` — Page analytics

```ts
// GET comments
GET https://graph.facebook.com/v18.0/{page_id}/feed?fields=comments{message,from}&access_token={token}

// Reply to comment
POST https://graph.facebook.com/v18.0/{comment_id}/comments
{ message: "..." }

// Page insights
GET https://graph.facebook.com/v18.0/{page_id}/insights?metric=page_views_total
```

**Webhook:** Register Facebook Page webhook → pipe to `/api/webhooks/facebook` → trigger agent response to new comments/messages.

---

### 6. Twitter/X

**Credential keys:** `twitter_bearer_token`, `twitter_api_key`, `twitter_api_secret`
**Tools:**
- `twitter_search(query, max_results?)` — search tweets
- `twitter_get_mentions()` — recent mentions of the authenticated account
- `twitter_post(text)` — post a tweet
- `twitter_reply(tweetId, text)` — reply to a tweet

```ts
// Search (v2)
GET https://api.twitter.com/2/tweets/search/recent?query={q}&max_results=10
Authorization: Bearer {bearer_token}

// Post tweet
POST https://api.twitter.com/2/tweets
{ text: "..." }
```

---

### 7. Hunter.io (B2B email finder)

**Credential key:** `hunter_api_key`
**Tools:**
- `find_email(domain, firstName?, lastName?)` — find professional email
- `email_verify(email)` — verify email is real and deliverable

```ts
GET https://api.hunter.io/v2/email-finder?domain={d}&first_name={fn}&last_name={ln}&api_key={key}
GET https://api.hunter.io/v2/email-verifier?email={e}&api_key={key}
```

---

### 8. YouTube Data API

**Credential key:** `youtube_api_key`
**Tools:**
- `youtube_get_comments(videoId, maxResults?)` — recent comments on a video
- `youtube_get_stats(channelId)` — subscriber count, views
- `youtube_search(query, channelId?)` — find videos

```ts
GET https://www.googleapis.com/youtube/v3/commentThreads?videoId={id}&key={key}&maxResults=50
GET https://www.googleapis.com/youtube/v3/channels?id={id}&part=statistics&key={key}
```

---

### 9. Apollo.io (B2B contact database)

**Credential key:** `apollo_api_key`
**Tools:**
- `apollo_search_people(company?, title?, location?)` — find contacts
- `apollo_enrich_company(domain)` — get company details

```ts
POST https://api.apollo.io/v1/people/search
{ person_titles: [...], q_organization_domains: [...] }
Authorization: api_key: {key}
```

---

## Tier 3: Specialized Verticals

### 10. Apify (custom web scraping)

**Credential key:** `apify_api_key`
**Tools:** `apify_run(actorId, input)` — run any Apify actor

```ts
POST https://api.apify.com/v2/acts/{actorId}/runs?token={key}
{ ... input ... }
// Poll run until finished, return dataset
```

Most used actors:
- `apify/google-maps-scraper` — business lead gen
- `apify/amazon-reviews-scraper` — product reviews
- `apify/website-content-crawler` — full site crawl

---

### 11. ElevenLabs (voice output)

**Credential key:** `elevenlabs_api_key`
**Tool:** `speak(text, voiceId?)` — generate voice reply (internal, used on WhatsApp)

```ts
POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}
{ text, model_id: "eleven_multilingual_v2" }
→ Returns audio/mpeg
→ Re-encode to OGG Opus → send as WhatsApp voice note
```

---

### 12. CoinGecko (crypto prices)

**Credential key:** none (free tier) / `coingecko_api_key` (pro)
**Tools:**
- `crypto_price(coinId, currency?)` — current price
- `crypto_chart(coinId, days?)` — price history summary

```ts
GET https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd
GET https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=7
```

---

### 13. GitHub

**Credential key:** `github_token`
**Tools:**
- `github_search_issues(repo, query)` — find related issues
- `github_create_issue(repo, title, body)` — create issue from support ticket
- `github_get_issue(repo, number)` — get issue status

---

### 14. Yelp / TripAdvisor Reviews

**Credential keys:** `yelp_api_key`, `tripadvisor_api_key`
**Tools:**
- `yelp_get_reviews(businessId)` — recent reviews + rating
- `yelp_search(query, location)` — find businesses
- `tripadvisor_get_reviews(locationId)` — recent reviews

---

## DB Schema Additions

```prisma
// No new models needed — reuse existing Credential model
// Tool calls are logged in ActivityLog:
// action: "tool_call", details: JSON { tool, args, result_summary, duration_ms }

// Add to AIInstance:
// enabledTools  String[] // auto-populated based on credentials present
// toolCallCount Int     @default(0) // lifetime tool calls for billing
```

---

## API Routes

### Internal tool management

| Route | Purpose |
|---|---|
| `GET /api/instances/[id]/tools` | List available tools for this instance |
| `POST /api/instances/[id]/tools/test` | Test a specific tool with sample args |

### Credential additions (extend existing)

The existing credentials system handles key storage. New credential keys:
- `tavily_api_key`, `brave_api_key`
- `firecrawl_api_key`
- `google_maps_api_key`
- `facebook_page_token`, `facebook_page_id`
- `twitter_bearer_token`
- `hunter_api_key`
- `youtube_api_key`
- `apollo_api_key`
- `apify_api_key`
- `elevenlabs_api_key`
- `coingecko_api_key`
- `github_token`
- `yelp_api_key`

All stored encrypted via existing `upsertCredential()` function.

---

## Credentials Tab UI

Extend the Credentials tab in `[id]/page.tsx` with an "Integrations" section:

Group integrations by category:
- **Web Intelligence:** Tavily, Brave, Firecrawl
- **Social Media:** Facebook, Instagram, Twitter/X, YouTube
- **Lead Generation:** Hunter.io, Apollo, Google Maps
- **Business Tools:** GitHub, CoinGecko, Yelp, TripAdvisor
- **Voice I/O:** ElevenLabs (voice output), Whisper (auto, via OpenAI key)

Each integration card:
- Logo/icon + name + description
- Status: "Connected ✅" or "Not configured"
- Input field(s) for API key(s)
- "Test connection" button → calls `/api/instances/[id]/tools/test`
- Link to the service's API key page

---

## E2E Tests

`cypress/e2e/28-tool-integrations.cy.ts`:
- Intercept all external API calls
- Mock tool responses
- Test: web search tool executes + result returned in chat
- Test: credential setup + "test connection" button
- Test: tool call logged in Activity Log

---

## Build Order (4 phases across 4 agents)

### Agent 1: Tool Engine + Web Search (foundation)
- `src/lib/tools/types.ts` — base types
- `src/lib/tools/index.ts` — tool registry + executor
- `src/lib/tools/web-search.ts` — Tavily + Brave
- `src/lib/tools/firecrawl.ts` — URL reader
- `src/lib/tools/utility.ts` — time, calculator (no credential needed)
- Wire tool calling into `/api/instances/[id]/chat/route.ts` (OpenAI function calling + Anthropic tool use)
- `GET /api/instances/[id]/tools` — list enabled tools
- `POST /api/instances/[id]/tools/test` — test a tool
- Credentials UI: Tavily + Brave + Firecrawl cards in new "Integrations" section
- E2E: intercept tool calls, test web search flow

### Agent 2: Social + Voice I/O
- `src/lib/tools/facebook.ts` — get comments, reply, post, insights
- `src/lib/tools/twitter.ts` — search, mentions, post, reply
- `src/lib/tools/youtube.ts` — comments, stats, search
- `src/lib/tools/voice.ts` — ElevenLabs output + Whisper input
- `/api/webhooks/facebook` — receive FB Page events
- WhatsApp voice note → Whisper transcription pipeline
- Credentials UI: Social + Voice I/O sections

### Agent 3: Lead Gen + Places
- `src/lib/tools/google-maps.ts` — find_places, get_place_details
- `src/lib/tools/hunter.ts` — find_email, email_verify
- `src/lib/tools/apollo.ts` — search_people, enrich_company
- `src/lib/tools/apify.ts` — run_actor
- Credentials UI: Lead Gen section

### Agent 4: Business Tools + Reviews + Crypto
- `src/lib/tools/github.ts` — search_issues, create_issue
- `src/lib/tools/coingecko.ts` — crypto_price, crypto_chart
- `src/lib/tools/yelp.ts` — get_reviews, search
- `src/lib/tools/tripadvisor.ts` — get_reviews
- Activity Log: tool call entries
- E2E: full tool suite smoke test

---

_All tools follow the same pattern: define → register → execute → log._
