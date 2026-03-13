import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, source } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  await prisma.waitlistEntry.upsert({
    where: { email },
    update: { source },
    create: { email, source },
  });
  return NextResponse.json({ ok: true });
}
