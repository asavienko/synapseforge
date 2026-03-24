import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getEnabledTools } from "@/lib/tools";
import { decrypt } from "@/lib/crypto";

export async function GET(
  _req: NextRequest,
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

  const tools = getEnabledTools(credMap);
  return NextResponse.json({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      requiredCredential: t.requiredCredential ?? null,
      enabled: true,
    })),
  });
}
