import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

/**
 * GET /api/instances/[id]/credentials/[key]/reveal
 *
 * Reveals the decrypted value of a credential for the instance owner.
 * Rate limited by nature of being a manual user action.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; key: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, key } = await params;

  // Verify instance ownership
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch the credential
  const credential = await prisma.instanceCredential.findUnique({
    where: { instanceId_key: { instanceId: id, key } },
  });

  if (!credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  // Decrypt the value
  try {
    const decrypted = decrypt(credential.value);
    return NextResponse.json({ value: decrypted });
  } catch (err) {
    console.error("[reveal] Decryption failed:", err);
    return NextResponse.json(
      { error: "Failed to decrypt credential" },
      { status: 500 }
    );
  }
}