import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS } from "@/lib/api-auth";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/v1/docs
 *
 * Returns API documentation for developers.
 * Shows available endpoints, authentication, rate limits, and example requests.
 */
export async function GET(_req: NextRequest) {
  const docs = {
    name: "SynapseForge API",
    version: "v1",
    baseUrl: "https://api.openhelixai.com/api/v1",
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer {api_key}",
      description: "API keys start with 'oh-live-' and can be generated in your instance dashboard",
    },
    rateLimits: {
      "GET /instance": "120 requests per minute",
      "POST /chat": "60 requests per minute",
      "POST /chat/stream": "60 requests per minute",
      "POST /chat/completions": "60 requests per minute",
    },
    endpoints: [
      {
        path: "GET /instance",
        description: "Get instance metadata (status, model, channels)",
        example: {
          request: "curl https://api.openhelixai.com/api/v1/instance \\\n  -H \"Authorization: Bearer oh-live-xxxxx\"",
          response: {
            id: "inst_123",
            name: "My AI Agent",
            type: "assistant",
            status: "running",
            tier: "standard",
            model: "gpt-4o",
            llmProvider: "openai",
            channels: {
              telegram: true,
              discord: false,
              slack: true,
            },
            health: {
              status: "healthy",
              lastCheckedAt: "2026-03-26T09:00:00Z",
            },
          },
        },
      },
      {
        path: "POST /chat",
        description: "Send a chat message (non-streaming)",
        body: {
          message: "string (required)",
          sessionId: "string (optional, auto-generated if omitted)",
        },
        example: {
          request: "curl -X POST https://api.openhelixai.com/api/v1/chat \\\n  -H \"Authorization: Bearer oh-live-xxxxx\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"message\": \"Hello!\", \"sessionId\": \"sess_abc\"}'",
          response: {
            response: "Hello! How can I help you today?",
            latencyMs: 850,
            model: "gpt-4o",
            usage: {
              inputTokens: 12,
              outputTokens: 9,
            },
          },
        },
      },
      {
        path: "POST /chat/stream",
        description: "Send a chat message (Server-Sent Events streaming)",
        body: {
          message: "string (required)",
          sessionId: "string (optional)",
        },
        example: {
          request: "curl -X POST https://api.openhelixai.com/api/v1/chat/stream \\\n  -H \"Authorization: Bearer oh-live-xxxxx\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"message\": \"Hello!\"}'",
          notes: "Returns SSE stream with 'data: {...}' lines",
        },
      },
      {
        path: "POST /chat/completions",
        description: "OpenAI-compatible chat completions endpoint",
        body: {
          model: "string (ignored, uses instance config)",
          messages: "array of {role, content} objects",
          stream: "boolean (optional, defaults to false)",
          sessionId: "string (optional, passed as user id)",
        },
        example: {
          request: "curl -X POST https://api.openhelixai.com/api/v1/chat/completions \\\n  -H \"Authorization: Bearer oh-live-xxxxx\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"messages\": [{\"role\": \"user\", \"content\": \"Hello!\"}]}'",
          response: {
            id: "chatcmpl-xxx",
            object: "chat.completion",
            created: 1711459200,
            model: "gpt-4o",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: "Hello! How can I help?" },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 12,
              completion_tokens: 9,
              total_tokens: 21,
            },
          },
        },
      },
    ],
    errors: {
      401: "Invalid or missing API key",
      404: "Instance not found",
      429: "Rate limit exceeded - retry after {retryAfter} seconds",
      500: "Internal server error",
    },
    sdks: {
      javascript: "npm install openhelix-client (coming soon)",
      python: "pip install openhelix (coming soon)",
    },
    support: {
      email: "hello@openhelixai.com",
      docs: "https://docs.openhelixai.com",
    },
  };

  return NextResponse.json(docs, { headers: CORS_HEADERS });
}