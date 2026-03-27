import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { email } from "@/lib/email";

/**
 * POST /api/onboarding
 * 
 * Saves onboarding data and creates initial instance with credentials.
 * Also notifies manager if one is assigned.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      business,
      industry,
      useCase,
      useCaseDescription,
      channelsWanted,
      credentials,
      templateId,
      templateSystemPrompt,
    } = await req.json();

    // Get user with manager info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { manager: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build onboarding data object
    const onboardingData = {
      businessName: business || null,
      industry: industry || null,
      useCase: useCase || null,
      useCaseDescription: useCaseDescription || null,
      channelsWanted: channelsWanted || [],
      completedAt: new Date().toISOString(),
    };

    // Update user with onboarding data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingData,
        onboardingDone: true,
      },
    });

    // Create initial AI instance
    const instanceName = business 
      ? `${business} Assistant` 
      : "My AI Assistant";

    // Generate a meaningful system prompt based on use case if no template provided
    const USE_CASE_PROMPTS: Record<string, string> = {
      "customer-support": `You are a helpful and friendly customer support agent${business ? ` for ${business}` : ""}. Your job is to assist customers with their questions, resolve issues, and ensure a positive experience. Be empathetic, professional, and solution-oriented. If you cannot resolve an issue, offer to escalate to a human agent.`,
      "sales-assistant": `You are a knowledgeable and helpful sales assistant${business ? ` at ${business}` : ""}. Your role is to understand customer needs, present relevant products or services, answer questions about pricing and features, and guide prospects through the buying process. Be consultative rather than pushy — focus on helping customers find the right solution.`,
      "data-analyst": `You are an expert data analyst${business ? ` at ${business}` : ""}. You help users understand data, generate insights, and make data-driven decisions. You can interpret charts, analyze trends, explain statistical concepts, and provide actionable recommendations. Be precise and clear in your explanations.`,
      "internal-tools": `You are an internal assistant${business ? ` for ${business}` : ""}. You help team members with tasks, answer questions about internal processes and tools, and improve workflow efficiency. Be concise, accurate, and proactive in offering relevant information.`,
      "content": `You are a creative content assistant${business ? ` for ${business}` : ""}. You help with writing, editing, brainstorming, and content strategy. You can generate blog posts, social media content, marketing copy, and more. Adapt your tone and style to match the brand voice and target audience.`,
      "custom": `You are a helpful AI assistant${business ? ` for ${business}` : ""}. ${useCaseDescription || "Help users with their questions and tasks efficiently and professionally."}`,
    };

    const derivedSystemPrompt = templateSystemPrompt 
      || (useCase && USE_CASE_PROMPTS[useCase])
      || `You are a helpful AI assistant${business ? ` for ${business}` : ""}. ${useCaseDescription || "Help users with their questions and tasks efficiently and professionally."}`;

    // Upsert: update the existing starter instance (created at signup) rather than creating a duplicate
    const existingInstance = await prisma.aIInstance.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const instanceConfig = JSON.stringify({
      model: "gpt-4o-mini",
      systemPrompt: derivedSystemPrompt,
      temperature: 0.7,
      maxTokens: 1024,
      ...(templateId ? { templateId } : {}),
    });

    const instance = existingInstance
      ? await prisma.aIInstance.update({
          where: { id: existingInstance.id },
          data: {
            name: instanceName,
            description: useCaseDescription || (useCase ? `${useCase.replace(/-/g, " ")} assistant` : "AI assistant"),
            config: instanceConfig,
            status: "running", // keep it running so chat works
          },
        })
      : await prisma.aIInstance.create({
          data: {
            name: instanceName,
            type: "assistant",
            status: "running",
            tier: "minimal",
            description: useCaseDescription || (useCase ? `${useCase.replace(/-/g, " ")} assistant` : "AI assistant"),
            config: instanceConfig,
            userId: user.id,
          },
        });

    // Save credentials if provided
    if (credentials && Object.keys(credentials).length > 0) {
      for (const [key, value] of Object.entries(credentials)) {
        if (value && typeof value === "string" && value.trim()) {
          await prisma.instanceCredential.create({
            data: {
              instanceId: instance.id,
              key,
              value: encrypt(value.trim()),
            },
          });
        }
      }
    }

    // Also save LLM keys to user-level credential vault for reuse
    const llmKeys = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
    for (const key of llmKeys) {
      if (credentials[key]) {
        const provider = key.replace("_api_key", "");
        const existing = await prisma.userCredential.findFirst({
          where: { userId: user.id, provider },
        });
        if (!existing) {
          const value = credentials[key];
          const lastFour = value.slice(-4);
          await prisma.userCredential.create({
            data: {
              userId: user.id,
              provider,
              encryptedKey: encrypt(value),
              lastFour,
            },
          });
        }
      }
    }

    // Notify manager if assigned
    if (user.manager) {
      try {
        await email.newUserAlert(
          user.manager.email,
          user.manager.name,
          user.name || user.email,
          user.email,
          {
            businessName: business || undefined,
            industry: industry || undefined,
            useCase: useCase || undefined,
          }
        );
      } catch (err) {
        console.error("Failed to notify manager:", err);
        // Non-fatal - don't fail onboarding if email fails
      }
    }

    // Create welcome message from manager
    if (user.manager) {
      try {
        await prisma.message.create({
          data: {
            body: `Hi ${user.name?.split(" ")[0] || "there"}! 👋\n\nWelcome to OpenHelix AI! I'm ${user.manager.name}, your dedicated manager. I've received your onboarding info and will be reviewing your setup shortly.\n\nIn the meantime, feel free to explore your dashboard. If you have any questions, just reply here!`,
            senderType: "manager",
            userId: user.id,
            managerId: user.manager.id,
          },
        });
      } catch (err) {
        console.error("Failed to create welcome message:", err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      instanceId: instance.id,
    });

  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
