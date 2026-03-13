import { AgentTool } from "./types";

export const webSearchTools: AgentTool[] = [
  {
    name: "web_search",
    description:
      "Search the web for current information. Use for recent events, prices, hours, news, or any factual query requiring up-to-date info.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        max_results: { type: "string", description: "Number of results (1-10, default 5)" },
      },
      required: ["query"],
    },
    requiredCredential: "tavily_api_key",
    execute: async ({ query, max_results }, { credentials }) => {
      const n = Math.min(10, Math.max(1, parseInt((max_results as string) || "5") || 5));

      if (credentials.tavily_api_key) {
        const res = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: credentials.tavily_api_key,
            query,
            search_depth: "basic",
            max_results: n,
            include_answer: true,
          }),
        });
        const data = await res.json();
        if (data.answer)
          return `Summary: ${data.answer}\n\nSources:\n${(data.results || [])
            .map(
              (r: { url: string; title: string; content: string }) =>
                `- ${r.title} (${r.url}): ${r.content?.slice(0, 200)}`
            )
            .join("\n")}`;
        return (data.results || [])
          .map(
            (r: { url: string; title: string; content: string }) =>
              `${r.title}\n${r.url}\n${r.content?.slice(0, 300)}`
          )
          .join("\n\n");
      }

      if (credentials.brave_api_key) {
        const res = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query as string)}&count=${n}`,
          {
            headers: {
              "X-Subscription-Token": credentials.brave_api_key,
              Accept: "application/json",
            },
          }
        );
        const data = await res.json();
        return (data.web?.results || [])
          .map(
            (r: { url: string; title: string; description: string }) =>
              `${r.title}\n${r.url}\n${r.description}`
          )
          .join("\n\n");
      }

      return "No search API key configured";
    },
  },
];

// Brave fallback tool (uses brave_api_key)
export const braveSearchTools: AgentTool[] = [
  {
    ...webSearchTools[0],
    requiredCredential: "brave_api_key",
  },
];
