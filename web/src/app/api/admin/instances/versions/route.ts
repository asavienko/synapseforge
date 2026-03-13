// GET — return all instances with their currentVersion field
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instances = await prisma.aIInstance.findMany({
    select: {
      id: true,
      name: true,
      currentVersion: true,
      targetVersion: true,
      autoUpdate: true,
      versionLockedAt: true,
      status: true,
      provisionStatus: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ instances });
}
