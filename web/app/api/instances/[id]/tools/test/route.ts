import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { executeTool } from "@/lib/tools";
import { decrypt } from "@/lib/crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    include: { credentials: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const credMap: Record<string, string> = {};
  for (const cred of instance.credentials) {
    try { credMap[cred.key] = decrypt(cred.value); } catch { /* skip malformed */ }
  }

  const { toolName, args } = await req.json();
  if (!toolName) return NextResponse.json({ error: "toolName is required" }, { status: 400 });

  const result = await executeTool(toolName, args ?? {}, { instanceId: id, credentials: credMap });
  return NextResponse.json({ result });
}
