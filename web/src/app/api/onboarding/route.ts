import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";
import { encrypt } from "@/lib/crypto";
import { getTemplateForUseCase } from "@/lib/agent-templates";

const ALLOWED_CRED_KEYS = [
  "openai_api_key",
  "anthropic_api_key",
  "openrouter_api_key",
  "telegram_bot_token",
  "discord_bot_token",
  "slack_app_token",
  "slack_bot_token",
] as const;

type AllowedKey = (typeof ALLOWED_CRED_KEYS)[number];

function isAllowedKey(key: string): key is AllowedKey {
  return (ALLOWED_CRED_KEYS as readonly string[]).includes(key);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // { business, industry, useCase, credentials?: Record<string, string> }
  const data = await req.json();
  const { credentials } = data as { credentials?: Record<string, string> };

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingDone: true,
      onboardingData: JSON.stringify({ business: data.business, industry: data.industry, useCase: data.useCase }),
    },
    include: { manager: true, instances: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  // Save credentials to the user's first instance
  const instance = user.instances[0] ?? null;
  if (instance && credentials && typeof credentials === "object") {
    for (const [key, value] of Object.entries(credentials)) {
      if (!isAllowedKey(key) || !value?.trim()) continue;
      try {
        const encrypted = encrypt(value.trim());
        await prisma.instanceCredential.upsert({
          where: { instanceId_key: { instanceId: instance.id, key } },
          create: { instanceId: instance.id, key, value: encrypted },
          update: { value: encrypted },
        });
      } catch {
        // skip — don't fail the whole request for a bad credential
      }
    }
    // Mark config as needing sync
    await prisma.aIInstance.update({
      where: { id: instance.id },
      data: { configSynced: false },
    });
  }

  // Apply use-case template to instance config
  if (instance) {
    const template = getTemplateForUseCase((data.useCase as string) ?? "custom");

    // Personalize with business name and industry
    const businessName = (data.business as string)?.trim() ?? "";
    const industry = (data.industry as string)?.trim() ?? "";

    // Build personalized agent name
    const agentName = businessName
      ? `${businessName} ${template.agentName}`
      : template.agentName;

    // Inject business context into system prompt
    let systemPrompt = template.systemPrompt;
    if (businessName) {
      systemPrompt = `You are working for ${businessName}${industry ? `, a ${industry} business` : ""}.\n\n${systemPrompt}`;
    }

    // Build config JSON matching the dashboard Config shape
    const config = JSON.stringify({
      model: template.model,
      systemPrompt,
      temperature: template.temperature,
      maxTokens: template.maxTokens,
      agentName,
      businessName,
      businessContext: industry ? `${industry} industry` : "",
      role: "",
      traits: [],
      customInstructions: "",
      memoryEnabled: true,
      thinking: "adaptive",
      language: "English",
    });

    // Update instance: apply config and rename from default if still untouched
    const updateData: { config: string; name?: string; configSynced: boolean } = {
      config,
      configSynced: false,
    };
    if (instance.name === "My First Agent") {
      updateData.name = agentName;
    }

    await prisma.aIInstance.update({
      where: { id: instance.id },
      data: updateData,
    });
  }

  // Notify manager if assigned
  if (user.manager) {
    email.newUserAlert(
      user.manager.email,
      user.manager.name,
      user.name ?? user.email,
      user.email,
      user.onboardingData ?? undefined
    ).catch(console.error);

    // Send in-app welcome message from manager — only if no prior conversation exists
    try {
      const existing = await prisma.message.findFirst({
        where: { userId: session.user.id, managerId: user.manager.id },
      });
      if (!existing) {
        const firstName = (user.name ?? "there").split(" ")[0];
        const business = data.business || "your business";
        const industry = data.industry || "your industry";
        const useCase = data.useCase || "your use case";
        const body = `Hi ${firstName}! I've reviewed your setup for ${business}. Since you're in ${industry} and need ${useCase}, I'll configure your agent specifically for that. I'll have it ready within a few hours! Feel free to message me if you have any questions in the meantime. 🚀`;
        await prisma.message.create({
          data: {
            body,
            senderType: "manager",
            userId: session.user.id,
            managerId: user.manager.id,
          },
        });
      }
    } catch {
      // Non-fatal — don't fail onboarding if message creation fails
    }
  }

  return NextResponse.json({ ok: true, instanceId: instance?.id ?? null });
}
