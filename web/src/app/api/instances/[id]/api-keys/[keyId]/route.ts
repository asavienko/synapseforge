import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/instances/[id]/api-keys/[keyId] - Delete API key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, keyId } = await params;

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete the credential
    await prisma.userCredential.deleteMany({
      where: {
        id: keyId,
        userId: session.user.id,
        key: { startsWith: `api_key_${id}_` },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api-keys/delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
