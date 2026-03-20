import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { managerId, plan } = await req.json();

  // Fetch old plan before update for email diff
  const before = await prisma.user.findUnique({ where: { id }, select: { plan: true } });

  const data: { managerId?: string | null; plan?: string } = {};
  if (managerId !== undefined) data.managerId = managerId || null;
  if (plan !== undefined) data.plan = plan;

  const user = await prisma.user.update({ where: { id }, data, include: { manager: true } });

  // Email user when manager is newly assigned
  if (data.managerId && user.manager && user.email) {
    emailService.managerAssigned(user.email, user.name ?? "there", user.manager.name, user.manager.email).catch(console.error);
    const onboardingDataObj = user.onboardingData as { businessName?: string; industry?: string; useCase?: string; teamSize?: string; agentType?: string } | null;
    emailService.newUserAlert(user.manager.email, user.manager.name, user.name ?? user.email, user.email, onboardingDataObj ?? undefined).catch(console.error);
  }

  // Email user when plan changes
  if (data.plan && before && data.plan !== before.plan && user.email) {
    const { PLANS } = await import("@/lib/utils");
    const newPlan = PLANS[data.plan as keyof typeof PLANS];
    const allowedInstances = newPlan?.instances ?? 1;
    const isPlanUpgrade = newPlan !== undefined;
    if (isPlanUpgrade) {
      emailService.planUpgraded(
        user.email,
        user.name ?? "there",
        before.plan,
        data.plan,
        allowedInstances
      ).catch(console.error);
    }
  }

  return NextResponse.json(user);
}
