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

    const instance = await prisma.aIInstance.create({
      data: {
        name: instanceName,
        type: "assistant",
        status: "stopped",
        tier: "free",
        description: useCaseDescription || `${useCase} assistant`,
        config: JSON.stringify({
          model: "gpt-4o-mini",
          systemPrompt: templateSystemPrompt || "You are a helpful AI assistant.",
          temperature: 0.7,
          maxTokens: 1024,
          ...(templateId ? { templateId } : {}),
        }),
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
