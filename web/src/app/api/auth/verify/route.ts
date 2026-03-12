import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: "expired" }, { status: 400 });
  }

  // Already-verified case — not an error
  const user = await prisma.user.findUnique({ where: { email: record.identifier } });
  if (user?.emailVerified) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null);
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  // Clean up token
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}
