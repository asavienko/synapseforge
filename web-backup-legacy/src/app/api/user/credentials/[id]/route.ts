import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";

// DELETE /api/user/credentials/[id] - Delete a stored API key
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify the credential belongs to the user
  const credential = await prisma.userCredential.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      provider: true,
    },
  });

  if (!credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  // Delete the credential
  await prisma.userCredential.delete({
    where: { id },
  });

  // Track credential deletion
  captureServerEvent(session.user.id, "user_credential_deleted", {
    provider: credential.provider,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
