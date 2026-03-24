import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/feedback
 *
 * Admin endpoint to view user feedback submissions.
 * Protected by admin authentication.
 */
export async function GET() {
  const session = await auth();
  
  // Check if user is admin
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(session?.user?.email ?? "");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For now, return empty array since Feedback model needs migration
    // In production, this would query the database
    return NextResponse.json({ 
      feedback: [],
      total: 0,
      note: "Feedback model requires database migration. Run: npx prisma migrate dev"
    });
  } catch (err) {
    console.error("[admin/feedback] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}