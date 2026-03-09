import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const instances = await prisma.aIInstance.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(instances);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const plan = PLANS[user.plan as keyof typeof PLANS];
  const instanceCount = await prisma.aIInstance.count({ where: { userId: user.id } });

  if (plan.instances !== -1 && instanceCount >= plan.instances) {
    return NextResponse.json(
      { error: "Instance limit reached for your plan. Contact your manager to upgrade." },
      { status: 403 }
    );
  }

  const { name, type, description } = await req.json();

  const instance = await prisma.aIInstance.create({
    data: {
      name,
      type: type || "assistant",
      status: "stopped",
      tier: plan.tier,
      description,
      userId: user.id,
    },
  });

  return NextResponse.json(instance, { status: 201 });
}
