import { NextResponse } from "next/server";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://openhelixai.com";

export async function GET() {
  const docs = {
    name: "OpenHelix AI API",
    version: "1.0.0",
    description: "Integrate OpenHelix AI agents into any application. Full OpenAI SDK compatibility.",
    baseUrl: APP_URL,

    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer sf-live-YOUR_KEY",
      description: "Generate API keys from your instance's API Keys tab in the dashboard. Keys start with sf-live-",
    },

    endpoints: [
      {
        method: "POST",
        path: "/api/v1/chat",
        description: "Send a message to your AI agent and get a response",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sf-live-YOUR_KEY",
        },
        body: {
          message: "string — single user message (shorthand)",
          messages: "array — full conversation history [{ role: 'user'|'assistant'|'system', content: string }]",
        },
        response: {
          response: "string — the AI agent's reply",
          model: "string — model used (e.g. gpt-4o-mini)",
          provider: "string — openai | anthropic | openrouter",
          latencyMs: "number — response time in milliseconds",
        },
        example: {
          request: `curl -X POST ${APP_URL}/api/v1/chat \\
  -H "Authorization: Bearer sf-live-xxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "What are your business hours?"}'`,
          response: `{
  "response": "We're open Monday–Friday, 9am–6pm EST. How can I help you?",
  "model": "gpt-4o-mini",
  "provider": "openai",
  "latencyMs": 312
}`,
        },
      },
      {
        method: "POST",
        path: "/api/v1/chat/completions",
        description: "OpenAI-compatible endpoint. Drop-in replacement — works with any OpenAI SDK",
        note: `Set base_url to ${APP_URL}/api/v1 and use your sf-live-* key as the API key. No other changes needed.`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sf-live-YOUR_KEY",
        },
        body: {
          messages: "array — [{ role: 'user'|'assistant'|'system', content: string }]",
          model: "string — optional, overrides instance default",
          temperature: "number — optional (0–2)",
          max_tokens: "number — optional",
          stream: "boolean — optional, enables SSE streaming",
        },
        example: {
          request: `# Python (OpenAI SDK)
from openai import OpenAI
client = OpenAI(
    api_key="sf-live-xxxxxxxxxxxx",
    base_url="${APP_URL}/api/v1"
)
resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(resp.choices[0].message.content)`,
          response: `{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "choices": [{
    "message": { "role": "assistant", "content": "Hello! How can I help?" },
    "finish_reason": "stop"
  }]
}`,
        },
      },
      {
        method: "GET",
        path: "/api/v1/instance",
        description: "Get metadata about the instance associated with your API key",
        headers: {
          "Authorization": "Bearer sf-live-YOUR_KEY",
        },
        response: {
          id: "string — instance ID",
          name: "string — agent name",
          status: "string — running | stopped | pending",
          model: "string — configured LLM model",
          llmProvider: "string — openai | anthropic | openrouter | null",
          channels: "object — { telegram: bool, discord: bool, slack: bool, whatsapp: bool }",
        },
        example: {
          request: `curl ${APP_URL}/api/v1/instance \\
  -H "Authorization: Bearer sf-live-xxxxxxxxxxxx"`,
          response: `{
  "id": "cm_xxxx",
  "name": "Customer Support Agent",
  "status": "running",
  "model": "gpt-4o-mini",
  "llmProvider": "openai",
  "channels": { "telegram": true, "discord": false, "slack": false, "whatsapp": false }
}`,
        },
      },
    ],

    widget: {
      description: "Embed an AI chat widget on any website with a single script tag",
      usage: "Add this to your HTML — no build step, no dependencies:",
      code: `<script
  src="${APP_URL}/widget.js"
  data-instance-id="YOUR_INSTANCE_ID"
  data-position="bottom-right"
  data-color="#8b5cf6"
  data-greeting="Hi! How can I help you today?"
  data-branding="true"
></script>`,
    },

    rateLimits: {
      description: "Rate limits apply per API key",
      free: "60 requests/minute",
      starter: "300 requests/minute",
      growth: "600 requests/minute",
      scale: "1,500 requests/minute",
    },

    support: {
      email: "support@openhelixai.com",
      contact: `${APP_URL}/contact`,
      status: `${APP_URL}/api/health`,
    },
  };

  return NextResponse.json(docs);
}
