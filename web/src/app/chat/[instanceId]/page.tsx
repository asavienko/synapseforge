import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicChatUI, type Branding } from "@/components/PublicChatUI";

interface PageProps {
  params: Promise<{ instanceId: string }>;
}

async function loadBranding(instanceId: string): Promise<{
  instance: { id: string; name: string; description: string | null; userId: string; status: string };
  branding: Branding;
} | null> {
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, name: true, description: true, userId: true, status: true },
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

const APP_URL = process.env.NEXTAUTH_URL ?? "https://openhelixai.com";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { instanceId } = await params;
  const data = await loadBranding(instanceId);
  const name = data?.branding.agentName ?? "AI Assistant";
  const description = data?.instance.description ?? `Chat with ${name} — your AI assistant`;

  const ogTitle = encodeURIComponent(name);
  const ogSubtitle = encodeURIComponent(description.length > 80 ? description.slice(0, 77) + "…" : description);
  const ogUrl = `${APP_URL}/api/og?type=agent&title=${ogTitle}&subtitle=${ogSubtitle}`;

  return {
    title: name,
    description,
    openGraph: {
      type: "website",
      title: name,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [ogUrl],
    },
  };
}

export default async function PublicChatPage({ params }: PageProps) {
  const { instanceId } = await params;
  const data = await loadBranding(instanceId);

  if (!data) {
    notFound();
  }

  // Instance exists but is not running — show a polished offline state
  if (data.instance.status !== "running") {
    const { brandColor, agentName, hidePoweredBy } = data.branding;
    return (
      <div className="flex flex-col h-screen bg-[#0a0a0f] text-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8" style={{ borderBottomColor: `${brandColor}30` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>
            {agentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{agentName}</p>
            <p className="text-xs text-zinc-500">Offline</p>
          </div>
        </div>

        {/* Offline body */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${brandColor}18`, border: `1px solid ${brandColor}30` }}>
            😴
          </div>
          <div>
            <h2 className="text-base font-semibold text-white mb-1">{agentName} is offline</h2>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              This assistant is temporarily unavailable. Please check back later.
            </p>
          </div>
        </div>

        {!hidePoweredBy && (
          <div className="flex justify-center py-3 border-t border-white/5">
            <a href="https://openhelixai.com" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Powered by OpenHelix AI
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <PublicChatUI instanceId={data.instance.id} branding={data.branding} />
  );
}
