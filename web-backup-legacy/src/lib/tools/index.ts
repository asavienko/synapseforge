import { AgentTool, ToolContext } from "./types";
import { utilityTools } from "./utility";
import { webSearchTools, braveSearchTools } from "./web-search";
import { firecrawlTools } from "./firecrawl";
import { facebookTools } from "./facebook";
import { twitterTools } from "./twitter";
import { youtubeTools } from "./youtube";
import { voiceTools } from "./voice";
import { googleMapsTools } from "./google-maps";
import { hunterTools } from "./hunter";
import { apolloTools } from "./apollo";
import { apifyTools } from "./apify";
import { githubTools } from "./github";
import { coingeckoTools } from "./coingecko";
import { yelpTools } from "./yelp";

export const ALL_TOOLS: AgentTool[] = [
  ...utilityTools,
  ...webSearchTools,
  ...braveSearchTools,
  ...firecrawlTools,
  ...facebookTools,
  ...twitterTools,
  ...youtubeTools,
  ...voiceTools,
  ...googleMapsTools,
  ...hunterTools,
  ...apolloTools,
  ...apifyTools,
  ...githubTools,
  ...coingeckoTools,
  ...yelpTools,
];

export function getEnabledTools(credentials: Record<string, string>): AgentTool[] {
  return ALL_TOOLS.filter((tool) => {
    if (!tool.requiredCredential) return true;
    return !!credentials[tool.requiredCredential];
  });
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const tool = ALL_TOOLS.find((t) => t.name === toolName);
  if (!tool) return `Unknown tool: ${toolName}`;
  try {
    return await tool.execute(args, context);
  } catch (err) {
    console.error(`[tool] ${toolName} error:`, err);
    return `Tool error: ${(err as Error).message}`;
  }
}

export function toolsToOpenAIFormat(tools: AgentTool[]) {
  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
}

export function toolsToAnthropicFormat(tools: AgentTool[]) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters,
  }));
}

export type { AgentTool, ToolContext };
