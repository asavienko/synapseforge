import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicChatUI, type Branding } from "@/components/PublicChatUI";

interface PageProps {
  params: Promise<{ instanceId: string }>;
}

async function loadBranding(instanceId: string): Promise<{
  instance: { id: string; name: string; userId: string; status: string };
  branding: Branding;
} | null> {
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, name: true, userId: true, status: true },
  });

  if (!instance) return null;

  const whiteLabelConfig = await prisma.whiteLabelConfig
    .findUnique({ where: { userId: instance.userId } })
    .catch(() => null);

  const branding: Branding = {
    agentName: instance.name,
    brandColor: whiteLabelConfig?.brandColor ?? "#7c3aed",
    logoUrl: whiteLabelConfig?.logoUrl ?? null,
    welcomeMessage: `Hi! I'm ${instance.name}. How can I help you today?`,
    hidePoweredBy: whiteLabelConfig?.hidePoweredBy ?? false,
  };

  return { instance, branding };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { instanceId } = await params;
  const data = await loadBranding(instanceId);
  const name = data?.branding.agentName ?? "AI Assistant";
  return {
    title: name,
    description: `Chat with ${name}`,
  };
}

export default async function PublicChatPage({ params }: PageProps) {
  const { instanceId } = await params;
  const data = await loadBranding(instanceId);

  if (!data || data.instance.status !== "running") {
    notFound();
  }

  return (
    <PublicChatUI instanceId={data.instance.id} branding={data.branding} />
  );
}
