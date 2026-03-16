import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Shared secret for internal endpoints
const INTERNAL_SECRET = process.env.INTERNAL_API_KEY;

export async function GET(req: NextRequest) {
  // Auth via shared secret header
  const authHeader = req.headers.get("x-internal-api-key");
  if (!INTERNAL_SECRET || authHeader !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch("/api/internal/provision-poll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": INTERNAL_SECRET,
      },
    });

    const data = await res.json();
    
    return NextResponse.json({
      ok: true,
      checked: data.checked,
      results: data.results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Provision poll cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}