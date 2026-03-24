import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email?: string | null) {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).includes(email ?? "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}
