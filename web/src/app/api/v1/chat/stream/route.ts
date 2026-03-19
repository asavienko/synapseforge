import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";
import { trackUsage } from "@/lib/usage";

/**
 * Streaming Chat API - Always returns SSE stream
 * 
 * POST /api/v1/chat/stream
 * Headers: Authorization: Bearer {api_key}
 * Body: { message: string, sessionId?: string }
 * 
 * Returns: Streaming SSE response with AI reply
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header. Use: Bearer {api_key}" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.slice(7);

    // Validate API key and get instance
    const keyRecord = await prisma.apiKey.findFirst({
      where: { key: apiKey },
      include: {
        instance: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!keyRecord) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const instance = keyRecord.instance;
    const user = instance?.user;

    if (!instance || !user) {
      return NextResponse.json(
        { error: "Instance not found" },
        { status: 404 }
      );
    }

    // Check if instance is running
    if (instance.status !== "running") {
      return NextResponse.json(
        { error: "Instance is stopped", status: instance.status },
        { status: 400 }
      );
    }

    // Rate limiting by API key
    const rateLimitAllowed = await rateLimit(apiKey, 60, 60 * 1000);

    if (!rateLimitAllowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded",
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { message, sessionId = crypto.randomUUID() } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check plan limits
    const planLimits = getPlanLimits(user.plan);
    const currentUsage = await getCurrentMonthUsage(user.id);

    if (currentUsage >= planLimits.messages) {
      return NextResponse.json(
        { error: "Monthly message limit exceeded", limit: planLimits.messages },
        { status: 429 }
      );
    }

    // Get instance configuration
    const config = instance.config ? JSON.parse(instance.config) : {};
    const systemPrompt = config.systemPrompt || "You are a helpful AI assistant.";

    // Track usage (async, don't block)
    trackUsage({
      userId: user.id,
      instanceId: instance.id,
      type: "chat",
      metadata: { sessionId, messageLength: message.length },
    }).catch(console.error);

    // Update API key last used
    prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    // Validate OpenAI API key is configured
    const openAiKey = process.env.OPENHELIX_OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Set OPENHELIX_OPENAI_KEY environment variable." },
        { status: 502 }
      );
    }

    // Call the LLM - always stream
    const stream = await callLLM({
      message,
      systemPrompt,
      model: config.model || "gpt-4o-mini",
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
      apiKey: openAiKey,
    });

    // Return streaming SSE response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Session-Id": sessionId,
        "X-RateLimit-Limit": "60",
      },
    });

  } catch (error) {
    console.error("[api/v1/chat/stream] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get plan message limits
 */
function getPlanLimits(plan: string): { messages: number } {
  const limits: Record<string, number> = {
    free: 2000,
    starter_10k: 10000,
    growth_30k: 30000,
    scale_100k: 100000,
    business_200k: 200000,
    managed_starter: 10000,
    managed_growth: 30000,
    managed_scale: 100000,
  };
  return { messages: limits[plan] || 2000 };
}

/**
 * Get current month's usage for a user
 */
async function getCurrentMonthUsage(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await prisma.usageEvent.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      type: "chat",
    },
    _sum: { count: true },
  });

  return result._sum.count || 0;
}

/**
 * Call the LLM and return a streaming response
 */
async function callLLM({
  message,
  systemPrompt,
  model,
  temperature,
  maxTokens,
  apiKey,
}: {
  message: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
}): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  // Transform OpenAI stream to SSE format with delta field
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  // Use delta field for SSE format
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ delta: content })}\n\n`)
                  );
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } catch (err) {
        // Stream error - send error event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
        );
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        reader.releaseLock();
      }
    },
  });
}

/**
 * CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
