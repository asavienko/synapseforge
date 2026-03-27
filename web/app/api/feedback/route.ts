import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

const feedbackSchema = z.object({
  message: z.string().min(10).max(2000),
});

/**
 * POST /api/feedback
 *
 * Submit user feedback. Rate limited to prevent spam.
 */
export async function POST(req: NextRequest) {
  // Rate limit: 3 feedback submissions per hour per IP
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const allowed = await rateLimit(`feedback:${ip}`, 3, 60 * 60 * 1000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many feedback submissions. Please try again later." },
      { status: 429 }
    );
  }

  // Parse request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Message must be between 10 and 2000 characters" },
      { status: 400 }
    );
  }

  // Get user info if authenticated
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;

  // Store feedback in database (Feedback table created in migration 20260327221000)
  await prisma.feedback.create({
    data: {
      message: parsed.data.message,
      userId,
      userEmail,
      source: "dashboard_widget",
    },
  });

  return NextResponse.json({ success: true });
}