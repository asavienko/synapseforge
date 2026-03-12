import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { provisionInstance, HetznerRegion } from "@/lib/provisioning";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const manager = await prisma.manager.findUnique({
    where: { email: session.user.email },
  });
  if (!manager) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Verify instance belongs to one of this manager's assigned clients
  const instance = await prisma.aIInstance.findFirst({
    where: {
      id,
      user: { managerId: manager.id },
    },
    select: { id: true },
  });
  if (!instance) {
    return NextResponse.json(
      { error: "Instance not found or not assigned to your clients" },
      { status: 404 }
    );
  }

  let region: HetznerRegion = "nbg1";
  try {
    const body = await req.json();
    if (body?.region) region = body.region as HetznerRegion;
  } catch {
    // body optional
  }

  const result = await provisionInstance(id, region);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error?.includes("not found") ? 404 : 502 }
    );
  }

  return NextResponse.json({ ok: true, serverId: result.serverId, ip: result.ip });
}
