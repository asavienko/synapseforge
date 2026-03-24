import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify instance ownership
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, userId: true },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Find unanswered questions (messages where wasAnswered is false)
  const unansweredMessages = await prisma.chatMessage.findMany({
    where: {
      instanceId: id,
      role: "user",
      wasAnswered: false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Group similar questions and generate suggestions
  const suggestions = generateKBSuggestions(unansweredMessages);

  return NextResponse.json({ suggestions });
}

interface UnansweredMessage {
  id: string;
  content: string;
  createdAt: Date;
}

function generateKBSuggestions(messages: UnansweredMessage[]): Array<{
  id: string;
  question: string;
  suggestedAnswer: string;
  category: string;
  priority: "high" | "medium" | "low";
  frequency: number;
}> {
  if (messages.length === 0) return [];

  const suggestions: Array<{
    id: string;
    question: string;
    suggestedAnswer: string;
    category: string;
    priority: "high" | "medium" | "low";
    frequency: number;
  }> = [];

  // Group by intent/category patterns
  const categorized = categorizeMessages(messages);

  for (const [category, msgs] of Object.entries(categorized)) {
    if (msgs.length === 0) continue;

    // Take the most recent/representative question
    const representative = msgs[0];
    
    // Generate suggested answer based on category
    const suggestedAnswer = generateSuggestedAnswer(category, representative.content);

    suggestions.push({
      id: `suggestion-${representative.id}`,
      question: representative.content.slice(0, 200),
      suggestedAnswer,
      category,
      priority: msgs.length >= 3 ? "high" : msgs.length >= 2 ? "medium" : "low",
      frequency: msgs.length,
    });
  }

  // Sort by priority then frequency
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.frequency - a.frequency;
  });
}

function categorizeMessages(messages: UnansweredMessage[]): Record<string, UnansweredMessage[]> {
  const categories: Record<string, UnansweredMessage[]> = {
    pricing: [],
    hours: [],
    location: [],
    services: [],
    booking: [],
    policies: [],
    contact: [],
    other: [],
  };

  for (const msg of messages) {
    const content = msg.content.toLowerCase();
    
    if (content.match(/price|cost|how much|charge|fee|payment|pay/)) {
      categories.pricing.push(msg);
    } else if (content.match(/hour|open|close|time|schedule|when/)) {
      categories.hours.push(msg);
    } else if (content.match(/where|location|address|find|direction/)) {
      categories.location.push(msg);
    } else if (content.match(/service|offer|do you|can you|what do/)) {
      categories.services.push(msg);
    } else if (content.match(/book|appointment|reserve|schedule|available/)) {
      categories.booking.push(msg);
    } else if (content.match(/policy|cancel|refund|return|warranty/)) {
      categories.policies.push(msg);
    } else if (content.match(/contact|phone|email|call|reach/)) {
      categories.contact.push(msg);
    } else {
      categories.other.push(msg);
    }
  }

  return categories;
}

function generateSuggestedAnswer(category: string, question: string): string {
  const templates: Record<string, string> = {
    pricing: "Our pricing varies based on [specific factors]. Please check our pricing page or contact us for a custom quote.",
    hours: "We're open [days] from [hours]. You can always message us here and we'll respond as soon as possible!",
    location: "We're located at [your address]. You can find us [landmark description]. Click here for directions: [Google Maps link]",
    services: "We offer a range of services including [list your services]. Would you like more details about any specific service?",
    booking: "You can book an appointment by [booking method]. What date and time works best for you?",
    policies: "Our policy regarding this is [explain policy]. If you have specific questions, please let us know!",
    contact: "You can reach us at [phone] or [email]. We're also available via this chat for quick questions!",
    other: "That's a great question! [Provide a helpful answer here]. Let us know if you need more information.",
  };

  return templates[category] || templates.other;
}
