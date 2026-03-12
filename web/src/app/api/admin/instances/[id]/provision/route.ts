import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { provisionInstance, HetznerRegion } from "@/lib/provisioning";

function isAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return adminEmails.includes(email);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  let region: HetznerRegion = "nbg1";
  try {
    const body = await req.json();
    if (body?.region) region = body.region as HetznerRegion;
  } catch {
    // body is optional — default to nbg1
  }

  const result = await provisionInstance(id, region);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error?.includes("not found") ? 404 : 502 });
  }

  return NextResponse.json({ ok: true, serverId: result.serverId, ip: result.ip });
}
