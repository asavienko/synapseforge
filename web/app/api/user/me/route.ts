import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * GET /api/user/me
 * Returns basic info about the currently authenticated user,
 * including the `isAdmin` flag (derived from ADMIN_EMAILS env var).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const isAdmin = adminEmails.includes(session.user.email ?? "");

  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    isAdmin,
  });
}
