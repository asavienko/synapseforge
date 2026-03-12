import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Reuse the same validation logic as the credentials route
async function validateLLMKey(key: string, value: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (key === "openai_api_key") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${value}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { valid: true };
      const d = await res.json().catch(() => ({}));
      return { valid: false, error: (d as { error?: { message?: string } })?.error?.message ?? `OpenAI returned ${res.status}` };
    }

    if (key === "anthropic_api_key") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": value,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok || res.status === 529) return { valid: true };
      if (res.status === 401) return { valid: false, error: "Invalid API key" };
      const d = await res.json().catch(() => ({}));
      return { valid: false, error: (d as { error?: { message?: string } })?.error?.message ?? `Anthropic returned ${res.status}` };
    }

    if (key === "openrouter_api_key") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${value}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { valid: true };
      return { valid: false, error: `OpenRouter returned ${res.status}` };
    }

    return { valid: false, error: "Unsupported key type" };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "Validation request failed" };
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { key, value } = body as { key: string; value: string };

  if (!key || !value) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  const ALLOWED = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
  if (!ALLOWED.includes(key)) {
    return NextResponse.json({ error: "Unsupported key type" }, { status: 400 });
  }

  const result = await validateLLMKey(key, value);
  return NextResponse.json(result, { status: result.valid ? 200 : 400 });
}
