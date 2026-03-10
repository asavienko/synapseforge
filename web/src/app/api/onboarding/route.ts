import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json(); // { business, industry, useCase }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingDone: true,
      onboardingData: JSON.stringify(data),
    },
    include: { manager: true },
  });

  // Notify manager if assigned
  if (user.manager) {
    await email.newUserAlert(
      user.manager.email,
      user.manager.name,
      user.name ?? user.email,
      user.email,
      user.onboardingData ?? undefined
    );
  }

  return NextResponse.json({ ok: true });
}
