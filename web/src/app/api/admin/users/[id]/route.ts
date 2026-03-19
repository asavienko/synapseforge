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

  const data: { managerId?: string | null; plan?: string } = {};
  if (managerId !== undefined) data.managerId = managerId || null;
  if (plan !== undefined) data.plan = plan;

  const user = await prisma.user.update({ where: { id }, data, include: { manager: true } });

  // Email user when manager is newly assigned
  if (data.managerId && user.manager && user.email) {
    emailService.managerAssigned(user.email, user.name ?? "there", user.manager.name, user.manager.email).catch(console.error);
    emailService.newUserAlert(user.manager.email, user.manager.name, user.name ?? user.email, user.email, user.onboardingData ?? undefined).catch(console.error);
  }

  return NextResponse.json(user);
}
