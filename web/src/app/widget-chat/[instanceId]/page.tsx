import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WidgetChatUI } from "@/components/WidgetChatUI";

interface PageProps {
  params: Promise<{ instanceId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function loadInstanceData(instanceId: string): Promise<{
  instance: { 
    id: string; 
    name: string; 
    description: string | null; 
    userId: string; 
    status: string;
    config?: string | null;
  };
  branding: {
    agentName: string;
    brandColor: string;
    logoUrl: string | null;
    welcomeMessage: string;
    hidePoweredBy: boolean;
  };
} | null> {
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { 
      id: true, 
      name: true, 
      description: true, 
      userId: true, 
      status: true,
      config: true,
    },
  });

  if (!instance) return null;

  const whiteLabelConfig = await prisma.whiteLabelConfig
    .findUnique({ where: { userId: instance.userId } })
    .catch(() => null);

  // Parse config for custom settings
  let configData: {
    agentName?: string;
    welcomeMessage?: string;
  } = {};
  
  try {
    if (instance.config) {
      configData = JSON.parse(instance.config);
    }
  } catch {
    // Config parsing is optional
  }

  const branding = {
    agentName: configData.agentName || instance.name,
    brandColor: whiteLabelConfig?.brandColor ?? "#7c3aed",
    logoUrl: whiteLabelConfig?.logoUrl ?? null,
    welcomeMessage: configData.welcomeMessage || `Hi! I'm ${instance.name}. How can I help you today?`,
    hidePoweredBy: whiteLabelConfig?.hidePoweredBy ?? false,
  };

  return { instance, branding };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { instanceId } = await params;
  const data = await loadInstanceData(instanceId);
  
  if (!data) {
    return { title: "Chat Not Found" };
  }

  return {
    title: data.branding.agentName,
    description: data.instance.description || `Chat with ${data.branding.agentName}`,
  };
}

export default async function WidgetChatPage({ 
  params, 
  searchParams 
}: PageProps) {
  const { instanceId } = await params;
  const searchParamsData = await searchParams;
  const data = await loadInstanceData(instanceId);

  if (!data) {
    notFound();
  }

  // Allow overriding greeting via query param
  const customGreeting = typeof searchParamsData.greeting === 'string' 
    ? searchParamsData.greeting 
    : null;

  if (customGreeting) {
    data.branding.welcomeMessage = customGreeting;
  }

  // Instance is offline - show offline state
  if (data.instance.status !== "running") {
    return (
      <div className="flex flex-col h-screen bg-[#0a0a0f] text-white">
        {/* Header */}
        <div 
          className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
          style={{ borderBottomColor: `${data.branding.brandColor}30` }}
        >
          {data.branding.logoUrl ? (
            <img
              src={data.branding.logoUrl}
              alt={data.branding.agentName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: data.branding.brandColor }}
            >
              {data.branding.agentName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-white text-sm">{data.branding.agentName}</p>
            <p className="text-xs text-zinc-500">Offline</p>
          </div>
        </div>

        {/* Offline body */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ 
              backgroundColor: `${data.branding.brandColor}18`, 
              border: `1px solid ${data.branding.brandColor}30` 
            }}
          >
            😴
          </div>
          <div>
            <h2 className="text-base font-semibold text-white mb-1">{data.branding.agentName} is offline</h2>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              This assistant is temporarily unavailable. Please check back later.
            </p>
          </div>
        </div>

        {!data.branding.hidePoweredBy && (
          <div className="flex justify-center py-3 border-t border-white/5">
            <a 
              href="https://synapseforge.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Powered by SynapseForge
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <WidgetChatUI
      instanceId={data.instance.id}
      greeting={data.branding.welcomeMessage}
      brandColor={data.branding.brandColor}
      logoUrl={data.branding.logoUrl}
      agentName={data.branding.agentName}
    />
  );
}
