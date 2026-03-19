import { NextResponse } from "next/server";

export async function GET() {
  const docs = {
    name: "SynapseForge API",
    version: "1.0.0",
    description: "API for managing AI instances and chat interactions",
    baseUrl: "https://api.synapseforge.ai",
    
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer YOUR_API_KEY",
      description: "Get your API key from the dashboard under API Keys tab",
    },

    endpoints: [
      {
        method: "POST",
        path: "/api/instances/{id}/chat",
        description: "Send a message to your AI agent",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_API_KEY",
        },
        body: {
          message: "string (required) - The message to send",
          history: "array (optional) - Previous messages for context",
        },
        response: {
          response: "string - The AI's response",
          model: "string - Model used",
          latencyMs: "number - Response time in milliseconds",
        },
        example: {
          request: `curl -X POST https://synapseforge.ai/api/instances/inst_123/chat \\
  -H "Authorization: Bearer sk_test_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello!"}'`,
          response: `{
  "response": "Hello! How can I help you today?",
  "model": "gpt-4o-mini",
  "latencyMs": 245
}`,
        },
      },
      {
        method: "GET",
        path: "/api/instances/{id}/status",
        description: "Check instance health and status",
        headers: {
          "Authorization": "Bearer YOUR_API_KEY",
        },
        response: {
          status: "string - Instance status (running, stopped, error)",
          health: "string - Health check result",
          uptime: "number - Uptime in seconds",
        },
      },
      {
        method: "GET",
        path: "/api/instances/{id}/analytics",
        description: "Get usage analytics for an instance",
        query: {
          days: "number (optional) - Number of days to analyze (default: 7)",
        },
        response: {
          totalMessages: "number",
          avgMessagesPerDay: "number",
          avgResponseTime: "number",
          dailyStats: "array",
          channelStats: "array",
        },
      },
      {
        method: "POST",
        path: "/api/webhooks/whatsapp/meta",
        description: "Webhook for WhatsApp Business API (Meta)",
        note: "This endpoint is called by Meta, not by you directly",
      },
    ],

    webhooks: {
      description: "Receive real-time events from your AI agent",
      setup: "Configure webhook URL in your instance settings",
      events: [
        {
          name: "message.received",
          description: "Triggered when a new message is received",
        },
        {
          name: "message.sent",
          description: "Triggered when a message is sent",
        },
        {
          name: "instance.status_changed",
          description: "Triggered when instance status changes",
        },
      ],
    },

    widget: {
      description: "Embed AI chat on any website",
      usage: "Add this script tag to your HTML:",
      code: `<script 
  src="https://synapseforge.ai/widget.js" 
  data-instance-id="YOUR_INSTANCE_ID"
  data-position="bottom-right"
  data-color="#8b5cf6"
  data-greeting="Hi! How can I help you?"
></script>`,
    },

    rateLimits: {
      description: "API requests are rate limited per instance",
      free: "100 requests/minute",
      pro: "500 requests/minute",
      enterprise: "2000 requests/minute",
    },

    support: {
      email: "support@synapseforge.ai",
      docs: "https://docs.synapseforge.ai",
      status: "https://synapseforge.ai/status",
    },
  };

  return NextResponse.json(docs);
}
