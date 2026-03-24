// PATCH { stable?, deprecated? } — mark version stable or deprecated
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { stable, deprecated } = await req.json();

  const data: Record<string, boolean> = {};
  if (stable !== undefined) data.stable = stable;
  if (deprecated !== undefined) data.deprecated = deprecated;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const version = await prisma.openClawVersion.update({
    where: { id },
    data,
  });

  return NextResponse.json({ version });
}
