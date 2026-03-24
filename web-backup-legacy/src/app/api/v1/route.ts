import { NextResponse } from "next/server";
import { CORS_HEADERS } from "@/lib/api-auth";

/**
 * GET /api/v1
 * Returns API documentation as JSON.
 */
export async function GET() {
  return NextResponse.json(
    {
      name: "OpenHelix AI Public API",
      version: "1.0.0",
      baseUrl: "/api/v1",
      authentication: {
        type: "Bearer token",
        header: "Authorization: Bearer sf-live-<key>",
        note: "Generate API keys from your instance's API Keys tab in the dashboard.",
      },
      endpoints: [
        {
          method: "POST",
          path: "/api/v1/chat",
          description: "Send a message to your AI agent (OpenHelix AI format)",
          body: {
            message: "string — single message (shorthand)",
            messages: "array — full conversation history [{ role, content }]",
          },
          response: {
            response: "string — assistant reply",
            model: "string — model used",
            provider: "string — openai | anthropic | openrouter",
            latencyMs: "number — response time in ms",
          },
        },
        {
          method: "POST",
          path: "/api/v1/chat/completions",
          description: "OpenAI-compatible chat completions endpoint. Drop-in replacement for any OpenAI SDK.",
          note: "Set base_url to your OpenHelix AI API URL and use your sf-live-* key as the API key.",
          body: {
            messages: "array — [{ role: 'user'|'assistant'|'system', content: string }]",
            model: "string — optional, overrides instance default",
            temperature: "number — optional",
            max_tokens: "number — optional",
          },
        },
        {
          method: "GET",
          path: "/api/v1/instance",
          description: "Get metadata about the instance associated with your API key.",
          response: {
            id: "string",
            name: "string",
            status: "string — running | stopped | pending",
            model: "string — configured model",
            llmProvider: "string — openai | anthropic | openrouter | null",
            channels: "object — { telegram: bool, discord: bool, slack: bool }",
          },
        },
      ],
      sdkExample: {
        python: `from openai import OpenAI\nclient = OpenAI(api_key='sf-live-...', base_url='https://your-domain.com/api/v1')\nresp = client.chat.completions.create(model='gpt-4o', messages=[{'role':'user','content':'Hello!'}])`,
        javascript: `import OpenAI from 'openai';\nconst client = new OpenAI({ apiKey: 'sf-live-...', baseURL: 'https://your-domain.com/api/v1' });\nconst resp = await client.chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'user', content: 'Hello!' }] });`,
        curl: `curl -X POST https://your-domain.com/api/v1/chat \\\n  -H 'Authorization: Bearer sf-live-...' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"message": "Hello!"}'`,
      },
    },
    { headers: CORS_HEADERS }
  );
}
