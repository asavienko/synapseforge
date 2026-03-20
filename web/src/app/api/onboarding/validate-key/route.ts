import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/onboarding/validate-key
 * 
 * Validates an API key by making a test request to the provider.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await req.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    let isValid = false;
    let error = null;

    // Validate based on key type
    if (key === "openai_api_key") {
      // Test OpenAI key
      try {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${value}`,
          },
        });
        isValid = res.ok;
        if (!isValid) {
          const data = await res.json().catch(() => ({}));
          error = data.error?.message || "Invalid OpenAI API key";
        }
      } catch (err) {
        error = "Failed to validate OpenAI key";
      }
    } else if (key === "anthropic_api_key") {
      // Test Anthropic key
      try {
        const res = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": value,
            "anthropic-version": "2023-06-01",
          },
        });
        isValid = res.ok;
        if (!isValid) {
          const data = await res.json().catch(() => ({}));
          error = data.error?.message || "Invalid Anthropic API key";
        }
      } catch (err) {
        error = "Failed to validate Anthropic key";
      }
    } else if (key === "openrouter_api_key") {
      // Test OpenRouter key
      try {
        const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: {
            Authorization: `Bearer ${value}`,
          },
        });
        isValid = res.ok;
        if (!isValid) {
          const data = await res.json().catch(() => ({}));
          error = data.error?.message || "Invalid OpenRouter API key";
        }
      } catch (err) {
        error = "Failed to validate OpenRouter key";
      }
    } else {
      // Unknown key type - assume valid
      isValid = true;
    }

    return NextResponse.json({ valid: isValid, error });

  } catch (error) {
    console.error("Key validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate key" },
      { status: 500 }
    );
  }
}
