import { AgentTool } from "./types";

export const firecrawlTools: AgentTool[] = [
  {
    name: "read_url",
    description:
      "Fetch and read the content of any URL. Use when the user shares a link or asks about a specific webpage.",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to fetch and read" },
      },
      required: ["url"],
    },
    requiredCredential: "firecrawl_api_key",
    execute: async ({ url }, { credentials }) => {
      const res = await fetch("https://api.firecrawl.dev/v0/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.firecrawl_api_key}`,
        },
        body: JSON.stringify({ url, pageOptions: { onlyMainContent: true } }),
      });
      const data = await res.json();
      const content = data.data?.markdown || data.data?.content || "";
      return content.slice(0, 3000); // Limit to avoid token explosion
    },
  },
];
