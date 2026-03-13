import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  url: "/api/openapi.json",
  theme: "default",
  darkMode: true,
  layout: "modern",
  customCss: `
    :root {
      --scalar-color-1: #a78bfa;
      --scalar-color-2: #7c3aed;
      --scalar-background-1: #0a0a0f;
      --scalar-background-2: #12121a;
      --scalar-background-3: #1a1a24;
      --scalar-border-color: rgba(255,255,255,0.08);
    }
  `,
  metaData: {
    title: "SynapseForge API",
    description: "Integrate your AI agents anywhere",
    ogDescription: "Complete REST API for SynapseForge AI agents",
  },
  hideDownloadButton: false,
  servers: [{ url: "https://synapseforge.ai", description: "Production" }],
});
