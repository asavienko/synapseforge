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

  const { name, type, description, systemPrompt, agentTemplateName, agentTemplateId } = await req.json();

  // Build initial config — use template system prompt if provided
  const initialConfig = JSON.stringify({
    model: "gpt-4o",
    systemPrompt: systemPrompt ?? "You are a helpful AI assistant.",
    temperature: 0.7,
    maxTokens: 1024,
    ...(agentTemplateName ? { agentTemplateName } : {}),
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
      userId: user.id,
    },
  });

  await prisma.activityLog.create({
    data: { event: "created", details: `Instance "${name}" created`, instanceId: instance.id },
  });

  // Send onboarding welcome message from manager when the user has a manager assigned
  // and has completed onboarding (so we have their business context)
  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { manager: true },
    });
    if (fullUser?.manager && fullUser.onboardingData) {
      const od = (() => { try { return JSON.parse(fullUser.onboardingData!); } catch { return null; } })();
      const firstName = (fullUser.name ?? "there").split(" ")[0];
      const business = od?.business || "your business";
      const industry = od?.industry || "your industry";
      const templateLabel = agentTemplateName ?? "AI assistant";
      const welcomeBody = `Hi ${firstName}! 🎉 Your new **${name}** (${templateLabel}) is all set up!\n\nBased on your ${industry} context at ${business}, I've pre-configured the agent's system prompt to get you started quickly. You can fine-tune it any time in the Configuration tab.\n\nNext step: add your API keys in the Credentials tab so you can deploy and start chatting. Let me know if you need any help! 🚀`;

      await prisma.message.create({
        data: {
          body: welcomeBody,
          senderType: "manager",
          userId: user.id,
          managerId: fullUser.manager.id,
        },
      });
    }
  } catch {
    // Non-fatal — don't fail instance creation if message fails
  }

  return NextResponse.json(instance, { status: 201 });
}
