import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const manager = await prisma.manager.findUnique({ where: { email: session.user.email } });
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clients = await prisma.user.findMany({
    where: { managerId: manager.id },
    select: {
      id: true,
      name: true,
      email: true,
      instances: {
        select: {
          id: true,
          name: true,
          status: true,
          healthStatus: true,
          tier: true,
          vpsUrl: true,
          provisionStatus: true,
          lastCheckedAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    instances: c.instances.map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status,
      healthStatus: i.healthStatus ?? null,
      tier: i.tier,
      vpsUrl: i.vpsUrl ?? null,
      hasGateway: !!i.vpsUrl,
      provisionStatus: i.provisionStatus ?? null,
      lastCheckedAt: i.lastCheckedAt?.toISOString() ?? null,
    })),
  }));

  return NextResponse.json(result);
}

// POST — manager creates an instance on behalf of one of their clients
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const manager = await prisma.manager.findUnique({ where: { email: session.user.email } });
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { userId, name, type, description, systemPrompt, agentTemplateName, agentTemplateId } = body as {
    userId: string;
    name: string;
    type?: string;
    description?: string;
    systemPrompt?: string;
    agentTemplateName?: string;
    agentTemplateId?: string;
  };

  if (!userId || !name) {
    return NextResponse.json({ error: "userId and name are required" }, { status: 400 });
  }

  // Verify the target user belongs to this manager
  const targetUser = await prisma.user.findFirst({
    where: { id: userId, managerId: manager.id },
  });
  if (!targetUser) {
    return NextResponse.json({ error: "Client not found or not assigned to you" }, { status: 404 });
  }

  const plan = PLANS[targetUser.plan as keyof typeof PLANS];
  const instanceCount = await prisma.aIInstance.count({ where: { userId } });
  if (plan.instances !== -1 && instanceCount >= plan.instances) {
    return NextResponse.json({ error: "Client has reached their instance limit." }, { status: 403 });
  }

  const initialConfig = JSON.stringify({
    model: "gpt-4o",
    systemPrompt: systemPrompt ?? "You are a helpful AI assistant.",
    temperature: 0.7,
    maxTokens: 1024,
    ...(agentTemplateName ? { agentTemplateName: String(agentTemplateName) } : {}),
    ...(agentTemplateId ? { agentTemplateId } : {}),
  });

  const instance = await prisma.aIInstance.create({
    data: {
      name,
      type: type || "assistant",
      status: "stopped",
      tier: plan.tier,
      description,
      config: initialConfig,
      userId,
    },
  });

  await prisma.activityLog.create({
    data: { event: "created", details: `Instance "${name}" created by manager`, instanceId: instance.id },
  });

  // Send personalized welcome message to the client based on their onboarding data
  try {
    const od = targetUser.onboardingData as { businessName?: string; industry?: string; useCase?: string } | null;

    const firstName = (targetUser.name ?? "there").split(" ")[0];
    const business = od?.businessName || "your business";
    const industry = od?.industry || "your industry";
    const useCase = od?.useCase || "your workflows";
    const templateLabel = agentTemplateName ?? "AI assistant";

    const welcomeBody = od
      ? `Hi ${firstName}! 🚀 I've just set up your **${name}** (${templateLabel}) based on your ${industry} context at ${business}.\n\nThe agent is pre-configured to help with ${useCase}. All you need to do now is:\n\n1. Go to your instance → Credentials tab\n2. Add your API key (OpenAI, Anthropic, or OpenRouter)\n3. Click Deploy to go live!\n\nLet me know if you have any questions. I'm here to help! 💪`
      : `Hi ${firstName}! 🎉 Your new **${name}** (${templateLabel}) is ready to configure.\n\nHead to your dashboard → Credentials → add your API key, then hit Deploy. I'm here if you need anything!`;

    // Only create if a message thread doesn't already exist, or always add (manager chose to reach out)
    await prisma.message.create({
      data: {
        body: welcomeBody,
        senderType: "manager",
        userId,
        managerId: manager.id,
      },
    });
  } catch {
    // Non-fatal
  }

  return NextResponse.json(instance, { status: 201 });
}
