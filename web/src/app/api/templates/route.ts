import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const TEMPLATES = [
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description: "Handles FAQs, troubleshooting, and escalates complex issues",
    systemPrompt: `You are a helpful customer support agent. Your goal is to:
- Answer common questions about products/services
- Troubleshoot basic issues
- Collect information for complex problems
- Escalate to human agents when necessary
- Always be polite and professional
- If you don't know something, admit it and offer to connect with a human`,
    suggestedChannels: ["telegram", "web"],
    icon: "headphones",
  },
  {
    id: "sales-assistant",
    name: "Sales Assistant",
    description: "Qualifies leads, answers product questions, books demos",
    systemPrompt: `You are a sales assistant helping potential customers. Your goal is to:
- Qualify leads by asking about their needs
- Answer product questions accurately
- Highlight key benefits and features
- Book demos or meetings when appropriate
- Never be pushy - focus on being helpful
- Collect contact information for follow-up`,
    suggestedChannels: ["web", "whatsapp"],
    icon: "briefcase",
  },
  {
    id: "appointment-scheduler",
    name: "Appointment Scheduler",
    description: "Books appointments, sends reminders, manages calendar",
    systemPrompt: `You are an appointment scheduling assistant. Your goal is to:
- Help users book appointments
- Check availability
- Collect necessary information
- Send confirmation details
- Handle rescheduling requests
- Be organized and efficient`,
    suggestedChannels: ["whatsapp", "telegram"],
    icon: "calendar",
  },
  {
    id: "faq-bot",
    name: "FAQ Bot",
    description: "Answers frequently asked questions from your knowledge base",
    systemPrompt: `You are a FAQ bot that answers questions based on the provided knowledge base. Your goal is to:
- Answer questions using only the information in your knowledge base
- If the answer isn't in your knowledge base, say so clearly
- Keep answers concise and to the point
- Direct users to human support for complex issues`,
    suggestedChannels: ["web", "telegram"],
    icon: "help-circle",
  },
  {
    id: "lead-qualifier",
    name: "Lead Qualifier",
    description: "Asks qualifying questions and scores leads",
    systemPrompt: `You are a lead qualification assistant. Your goal is to:
- Ask questions to understand the prospect's needs
- Determine budget, authority, need, and timeline (BANT)
- Score leads based on responses
- Collect contact information
- Pass qualified leads to sales team`,
    suggestedChannels: ["web"],
    icon: "target",
  },
  {
    id: "custom",
    name: "Custom Agent",
    description: "Start from scratch and configure everything yourself",
    systemPrompt: "",
    suggestedChannels: [],
    icon: "settings",
  },
];

// GET /api/templates - List available templates
export async function GET() {
  return NextResponse.json({ templates: TEMPLATES });
}

// POST /api/instances/[id]/apply-template - Apply template to instance
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { templateId } = await req.json();

    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, user: { email: session.user.email } },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Apply template configuration
    const updated = await prisma.aIInstance.update({
      where: { id },
      data: {
        systemPrompt: template.systemPrompt || instance.systemPrompt,
        // Store template ID for reference
        // Add any other template-specific configurations
      },
    });

    return NextResponse.json({
      success: true,
      instance: updated,
      template: {
        id: template.id,
        name: template.name,
        suggestedChannels: template.suggestedChannels,
      },
    });
  } catch (error) {
    console.error("[templates] Error:", error);
    return NextResponse.json(
      { error: "Failed to apply template" },
      { status: 500 }
    );
  }
}
