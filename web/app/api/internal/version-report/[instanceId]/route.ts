import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const { instanceId } = await params;

  const instance = await prisma.aIInstance.findFirst({
    where: { id: instanceId, gatewayToken: token },
  });
  if (!instance) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { version } = await req.json();
  await prisma.aIInstance.update({
    where: { id: instanceId },
    data: {
      currentVersion: version,
      versionLockedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
