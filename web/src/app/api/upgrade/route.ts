import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestedPlan, note } = await req.json();
  if (!requestedPlan) return NextResponse.json({ error: "Requested plan required." }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { manager: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Send message to manager in-app
  if (user.manager) {
    const body = `⬆️ Upgrade request: ${user.plan} → ${requestedPlan}${note ? `\n\n"${note}"` : ""}`;
    await prisma.message.create({
      data: { body, senderType: "user", userId: user.id, managerId: user.manager.id },
    });

    // Email notification to manager
    await email.upgradeRequest(
      user.manager.email,
      user.manager.name,
      user.name ?? user.email,
      user.email,
      user.plan,
      requestedPlan,
      note ?? ""
    );
  }

  return NextResponse.json({ ok: true });
}
