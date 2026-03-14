import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.0",
  info: {
    title: "SynapseForge API",
    version: "1.0.0",
    description:
      "Integrate your AI agents into any application. All endpoints require an API key.",
    contact: {
      name: "SynapseForge Support",
      email: "support@synapseforge.ai",
      url: "https://synapseforge.ai",
    },
  },
  servers: [{ url: "https://synapseforge.ai", description: "Production" }],
  security: [{ apiKey: [] }],
  components: {
    securitySchemes: {
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "Your instance API key from the dashboard",
      },
    },
    schemas: {
      Message: {
        type: "object",
        properties: {
          role: { type: "string", enum: ["user", "assistant"] },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ChatResponse: {
        type: "object",
        properties: {
          message: { type: "string", description: "The assistant reply" },
          instanceId: { type: "string" },
          model: { type: "string", description: "The model used to generate the reply" },
          latencyMs: { type: "number", description: "Time taken to generate the response in milliseconds" },
          inputTokens: { type: "number", description: "Number of input tokens consumed" },
          outputTokens: { type: "number", description: "Number of output tokens generated" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/v1/chat": {
      post: {
        summary: "Send a chat message",
        description:
          "Send a message to an AI agent instance and get a response. Supports both single-turn (`message`) and multi-turn (`messages` array) conversations. Pass the full conversation history in `messages` to maintain context across turns.",
        operationId: "sendChatMessage",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "Single user message (single-turn). Use `messages` instead for multi-turn conversations.",
                    example: "How can you help me?",
                  },
                  messages: {
                    type: "array",
                    description: "Full conversation history for multi-turn support. Each message must have `role` (user|assistant) and `content`. The last message must be a user message.",
                    items: {
                      type: "object",
                      required: ["role", "content"],
                      properties: {
                        role: { type: "string", enum: ["user", "assistant"] },
                        content: { type: "string" },
                      },
                    },
                    example: [
                      { role: "user", content: "What are your hours?" },
                      { role: "assistant", content: "We're open Monday–Friday, 9am–6pm." },
                      { role: "user", content: "What about weekends?" },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChatResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized — invalid API key",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "429": {
            description: "Rate limited",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/chat/completions": {
      post: {
        summary: "OpenAI-compatible chat completions",
        description:
          "Drop-in replacement for the OpenAI chat completions endpoint.",
        operationId: "chatCompletions",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["messages"],
                properties: {
                  messages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        role: {
                          type: "string",
                          enum: ["user", "assistant", "system"],
                        },
                        content: { type: "string" },
                      },
                    },
                  },
                  model: {
                    type: "string",
                    description: "Ignored — uses instance model",
                  },
                  stream: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "OpenAI-compatible response" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/history": {
      get: {
        summary: "Get conversation history",
        description: "Retrieve the last 50 messages for this instance.",
        operationId: "getChatHistory",
        responses: {
          "200": {
            description: "List of messages",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    messages: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Message" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
