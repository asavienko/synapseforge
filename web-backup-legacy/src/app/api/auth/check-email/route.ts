import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/check-email?email=...
 * Check if an email is already registered.
 * Used for real-time validation on sign-up form.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ valid: false, error: "invalid_format" });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ 
        valid: false, 
        error: "already_registered",
        message: "This email is already registered" 
      });
    }

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[check-email] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
