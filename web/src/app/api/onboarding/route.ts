import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { encrypt } from '@/lib/crypto';
import { PLANS } from '@/lib/utils';
import { createNotification } from '@/lib/notifications';

// Initialize Prisma client
const prisma = new PrismaClient();

const formSchema = z.object({
  business: z.string().min(1),
  industry: z.string().min(1),
  useCase: z.string().min(1),
  useCaseDescription: z.string().optional(),
  channelsWanted: z.array(z.string()).optional(),
  credentials: z.record(z.string(), z.string()).optional(),
  instanceName: z.string().optional(),
});

// Map useCase values to AI instance types
const USE_CASE_TO_TYPE: Record<string, string> = {
  'customer-support': 'support',
  'sales-assistant': 'assistant',
  'data-analyst': 'analyst',
  'internal-tools': 'assistant',
  'content': 'assistant',
  'custom': 'custom',
};

// Generate a tailored system prompt based on onboarding data
function generateSystemPrompt(data: {
  business: string;
  industry: string;
  useCase: string;
  useCaseDescription?: string;
}): string {
  const { business, industry, useCase, useCaseDescription } = data;

  // Base prompt
  let prompt = `You are a helpful AI assistant for ${business}, a ${industry} company.`;

  // Tailor based on use case
  switch (useCase) {
    case 'customer-support':
      prompt += '\n\nYour primary role is customer support. You should:';
      prompt += '\n- Help customers resolve issues quickly and empathetically';
      prompt += '\n- Provide accurate information about products and services';
      prompt += '\n- Escalate to human agents when necessary';
      prompt += '\n- Maintain a friendly, professional tone';
      break;
    case 'sales-assistant':
      prompt += '\n\nYour primary role is a sales assistant. You should:';
      prompt += '\n- Qualify leads by asking about needs, budget, and timeline';
      prompt += '\n- Answer product questions accurately';
      prompt += '\n- Guide prospects toward a purchase decision';
      prompt += '\n- Collect contact information for follow-up';
      break;
    case 'data-analyst':
      prompt += '\n\nYour primary role is a data analyst. You should:';
      prompt += '\n- Help users query and understand their data';
      prompt += '\n- Generate clear, insightful reports';
      prompt += '\n- Identify trends and patterns';
      prompt += '\n- Present findings in an accessible format';
      break;
    case 'internal-tools':
      prompt += '\n\nYour primary role is to automate internal workflows. You should:';
      prompt += '\n- Assist with internal helpdesk queries';
      prompt += '\n- Help employees complete tasks efficiently';
      prompt += '\n- Provide quick access to company information';
      prompt += '\n- Integrate with internal tools and systems';
      break;
    case 'content':
      prompt += '\n\nYour primary role is content creation. You should:';
      prompt += '\n- Draft emails, summaries, and documentation';
      prompt += '\n- Help with translations and rewriting';
      prompt += '\n- Maintain consistent tone and style';
      prompt += '\n- Adapt content for different audiences';
      break;
    case 'custom':
      prompt += '\n\nYour role will be customized for specific business needs.';
      prompt += '\nWork with your manager to define your capabilities.';
      break;
    default:
      prompt += '\n\nAssist users with their inquiries in a helpful, professional manner.';
  }

  // Add use case description if provided
  if (useCaseDescription?.trim()) {
    prompt += `\n\nAdditional context from the user: ${useCaseDescription.trim()}`;
  }

  prompt += '\n\nAlways be concise, accurate, and helpful.';

  return prompt;
}

// Handle POST request to /api/onboarding
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    // Get the current session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build onboarding data JSON
    const onboardingData = {
      business: validatedData.business,
      industry: validatedData.industry,
      useCase: validatedData.useCase,
      useCaseDescription: validatedData.useCaseDescription,
      channelsWanted: validatedData.channelsWanted,
      completedAt: new Date().toISOString(),
    };

    // Update user with onboarding data as JSON
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingData: JSON.stringify(onboardingData),
        onboardingDone: true,
      },
    });

    // Fetch the updated user to get their plan and assign a manager
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        plan: true, 
        name: true, 
        email: true,
        managerId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Assign a manager if not already assigned
    let managerAssigned = false;
    if (!user.managerId) {
      // Find the manager with the fewest assigned users
      const managers = await prisma.manager.findMany({
        select: { id: true, _count: { select: { users: true } } },
        orderBy: { users: { _count: 'asc' } },
        take: 1,
      });

      if (managers.length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { managerId: managers[0].id },
        });
        managerAssigned = true;
      }
    }

    // Create manager notification if manager was assigned
    if (managerAssigned) {
      const assignedManager = await prisma.manager.findFirst({
        where: { users: { some: { id: user.id } } },
      });

      if (assignedManager) {
        // Create notification for the user about their manager
        await createNotification({
          userId: user.id,
          type: 'manager.assigned',
          title: 'Your dedicated manager has been assigned',
          body: `${assignedManager.name} will be your point of contact. They will reach out soon to help you get started.`,
          href: '/dashboard/messages',
        });

        // Create a message from the manager to the user
        await prisma.message.create({
          data: {
            userId: user.id,
            managerId: assignedManager.id,
            senderType: 'manager',
            body: `Hi ${user.name?.split(' ')[0] || 'there'}! Welcome to SynapseForge! 👋\n\nI'm ${assignedManager.name}, your dedicated manager. I've reviewed your onboarding information:\n\n• Business: ${validatedData.business}\n• Industry: ${validatedData.industry}\n• Use case: ${validatedData.useCase}${validatedData.useCaseDescription ? '\n• Details: ' + validatedData.useCaseDescription.substring(0, 100) + (validatedData.useCaseDescription.length > 100 ? '...' : '') : ''}\n\nI'll be reaching out shortly to help you get your AI agent set up perfectly for your needs. Feel free to message me here anytime!`,
            read: false,
          },
        });
      }
    }

    // Determine instance type from use case
    const instanceType = USE_CASE_TO_TYPE[validatedData.useCase] || 'assistant';

    // Get tier from user's plan
    const planConfig = PLANS[user.plan as keyof typeof PLANS];
    const tier = planConfig?.tier || 'minimal';

    // Generate instance name (use business name or fallback)
    const instanceName = validatedData.instanceName || `${validatedData.business} AI`;

    // Generate tailored system prompt
    const systemPrompt = generateSystemPrompt({
      business: validatedData.business,
      industry: validatedData.industry,
      useCase: validatedData.useCase,
      useCaseDescription: validatedData.useCaseDescription,
    });

    // Build initial config
    const initialConfig = JSON.stringify({
      model: 'openai/gpt-4o',
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1024,
    });

    // Create the AI instance
    const instance = await prisma.aIInstance.create({
      data: {
        name: instanceName,
        type: instanceType,
        status: 'stopped',
        tier,
        description: `AI instance for ${validatedData.business} (${validatedData.industry})`,
        config: initialConfig,
        userId: session.user.id,
      },
    });

    // Store credentials if provided
    if (validatedData.credentials) {
      for (const [key, value] of Object.entries(validatedData.credentials)) {
        if (typeof value === 'string' && value.trim()) {
          try {
            const encrypted = encrypt(value.trim());
            await prisma.instanceCredential.upsert({
              where: {
                instanceId_key: {
                  instanceId: instance.id,
                  key,
                },
              },
              create: {
                instanceId: instance.id,
                key,
                value: encrypted,
              },
              update: {
                value: encrypted,
              },
            });
          } catch (err) {
            console.error(`Failed to encrypt and store credential ${key}:`, err);
            // Continue with other credentials - don't fail the whole request
          }
        }
      }

      // If an LLM key was provided, update configSynced to false to signal need for VPS sync
      const llmKeys = ['openai_api_key', 'anthropic_api_key', 'openrouter_api_key'];
      const hasLlmKey = Object.keys(validatedData.credentials).some(k => llmKeys.includes(k));
      if (hasLlmKey) {
        await prisma.aIInstance.update({
          where: { id: instance.id },
          data: { configSynced: false, sandboxMode: false },
        });
      }
    }

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        instanceId: instance.id,
        event: 'created',
        details: `Instance "${instanceName}" created via onboarding`,
      },
    });

    // Return instanceId for redirection
    return NextResponse.json({
      success: true,
      instanceId: instance.id,
      managerAssigned,
      redirectTo: `/dashboard/instances/${instance.id}?firstRun=1`,
    }, { status: 201 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: (error as any).errors.map((e: any) => e.message)
      }, { status: 400 });
    }

    // Generic error handling
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
