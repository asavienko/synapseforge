import { AgentTool } from "./types";

export const utilityTools: AgentTool[] = [
  {
    name: "get_current_time",
    description: "Get the current date and time in a specific timezone",
    parameters: {
      type: "object",
      properties: {
        timezone: { type: "string", description: "IANA timezone name, e.g. 'Europe/Madrid'" },
      },
    },
    execute: async ({ timezone }) => {
      const tz = (timezone as string) || "UTC";
      return new Date().toLocaleString("en-US", { timeZone: tz });
    },
  },
  {
    name: "calculate",
    description: "Perform basic arithmetic calculations",
    parameters: {
      type: "object",
      properties: {
        expression: { type: "string", description: "Math expression, e.g. '150 * 0.85'" },
      },
      required: ["expression"],
    },
    execute: async ({ expression }) => {
      try {
        // Safe eval: only allow numbers and operators
        const safe = (expression as string).replace(/[^0-9+\-*/.() ]/g, "");
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${safe})`)();
        return String(result);
      } catch {
        return "Could not calculate that expression";
      }
    },
  },
];
