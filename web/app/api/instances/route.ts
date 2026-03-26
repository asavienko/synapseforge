import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";
import { getTemplateById } from "@/lib/templates";
import { provisionInstance } from "@/lib/provisioning";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const instances = await prisma.aIInstance.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Quick live health check for any instances with VPS configured
  // This is a "best effort" check - we don't wait for timeouts, just return cached if slow
  const instancesWithHealth = await Promise.all(
    instances.map(async (instance) => {
      if (!instance.vpsUrl || !instance.gatewayToken) {
        return instance;
      }

      // Try a quick health check (3 second timeout)
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch(`${instance.vpsUrl}/hooks/wake`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${instance.gatewayToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: "health-check", mode: "next-heartbeat" }),
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        const healthy = res.status !== 401 && res.status !== 503 && res.status !== 0;
        const newStatus = healthy ? "healthy" : "down";
        
        // Update DB if status changed
        if (instance.healthStatus !== newStatus) {
          await prisma.aIInstance.update({
            where: { id: instance.id },
            data: { healthStatus: newStatus, lastCheckedAt: new Date() },
          });
        }
        
        return { ...instance, healthStatus: newStatus, lastCheckedAt: new Date() };
      } catch {
        // If check fails, return cached value but mark as down if we haven't checked recently
        const lastCheck = instance.lastCheckedAt;
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (!lastCheck || lastCheck < fiveMinutesAgo) {
          await prisma.aIInstance.update({
            where: { id: instance.id },
            data: { healthStatus: "down", lastCheckedAt: new Date() },
          });
          return { ...instance, healthStatus: "down", lastCheckedAt: new Date() };
        }
        
        return instance;
      }
    })
  );

  return NextResponse.json(instancesWithHealth);
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

  const { name, type, description, systemPrompt, agentTemplateName, agentTemplateId, templateId } = await req.json();

  // If templateId is provided, get template data
  const template = templateId ? getTemplateById(templateId) : null;

  // Build initial config — use template data if provided
  const initialConfig = JSON.stringify({
    model: template?.suggestedModel ?? "gpt-4o",
    systemPrompt: systemPrompt ?? template?.systemPrompt ?? "You are a helpful AI assistant.",
    temperature: 0.7,
    maxTokens: 1024,
    ...(agentTemplateName ? { agentTemplateName: String(agentTemplateName) } : {}),
    ...(agentTemplateId ? { agentTemplateId: String(agentTemplateId) } : {}),
    ...(templateId ? { templateId, templateName: template?.name } : {}),
  });

  // Determine if this is a managed plan
  const isManaged = user.plan?.startsWith("managed_");
  const sandboxMode = !isManaged;

  const instance = await prisma.aIInstance.create({
    data: {
      name,
      type: type || "assistant",
      status: "running",
      sandboxMode,
      tier: plan.tier,
      description: description || template?.shortDescription,
      config: initialConfig,
      userId: user.id,
      // For managed plans, set initial provision status
      ...(isManaged ? { provisionStatus: "provisioning" } : {}),
    },
  });

  // Auto-trigger provisioning for managed plans
  if (isManaged) {
    // Fire-and-forget provisioning - don't block instance creation
    provisionInstance(instance.id, "nbg1").catch((error) => {
      console.error("Auto-provisioning failed for instance", instance.id, error);
      // Update instance status to failed, but don't fail the request
      prisma.aIInstance.update({
        where: { id: instance.id },
        data: { provisionStatus: "failed" },
      }).catch(console.error);
    });
  }

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
      const od = fullUser.onboardingData as { businessName?: string; industry?: string } | null;
      const firstName = (fullUser.name ?? "there").split(" ")[0];
      const business = od?.businessName || "your business";
      const industry = od?.industry || "your industry";
      const templateLabel = template?.name ?? agentTemplateName ?? "AI assistant";
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
