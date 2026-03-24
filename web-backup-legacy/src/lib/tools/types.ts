export interface ToolContext {
  instanceId: string;
  credentials: Record<string, string>;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  requiredCredential?: string; // e.g. "tavily_api_key" — tool is available if this key exists
  execute: (args: Record<string, unknown>, context: ToolContext) => Promise<string>;
}
