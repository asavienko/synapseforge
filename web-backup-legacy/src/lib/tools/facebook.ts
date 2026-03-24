import { AgentTool } from "./types";

export const facebookTools: AgentTool[] = [
  {
    name: "facebook_get_comments",
    description:
      "Get recent comments on your Facebook Page posts. Use to monitor engagement and respond to customers.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "string", description: "Number of comments (1-50, default 20)" },
      },
    },
    requiredCredential: "facebook_page_token",
    execute: async ({ limit }, { credentials }) => {
      const n = Math.min(50, parseInt((limit as string) || "20") || 20);
      const pageId = credentials.facebook_page_id;
      const token = credentials.facebook_page_token;
      if (!pageId) return "facebook_page_id credential not configured";

      const res = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed?fields=message,created_time,comments{message,from,created_time}&limit=${n}&access_token=${token}`
      );
      const data = await res.json();
      if (data.error) return `Facebook API error: ${data.error.message}`;

      const posts = (data.data || []).slice(0, 5);
      return (
        posts
          .map(
            (p: {
              message?: string;
              created_time: string;
              comments?: {
                data: Array<{ from?: { name: string }; message: string }>;
              };
            }) =>
              `Post: "${(p.message || "").slice(0, 100)}"\nComments:\n${(p.comments?.data || [])
                .map((c) => `  ${c.from?.name ?? "Unknown"}: ${c.message}`)
                .join("\n")}`
          )
          .join("\n\n") || "No posts found"
      );
    },
  },
  {
    name: "facebook_reply_comment",
    description:
      "Reply to a specific Facebook comment. Provide the comment ID and your reply message.",
    parameters: {
      type: "object",
      properties: {
        comment_id: {
          type: "string",
          description: "The Facebook comment ID to reply to",
        },
        message: { type: "string", description: "Your reply message" },
      },
      required: ["comment_id", "message"],
    },
    requiredCredential: "facebook_page_token",
    execute: async ({ comment_id, message }, { credentials }) => {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${comment_id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            access_token: credentials.facebook_page_token,
          }),
        }
      );
      const data = await res.json();
      if (data.error) return `Error: ${data.error.message}`;
      return `Replied successfully (ID: ${data.id})`;
    },
  },
  {
    name: "facebook_post",
    description: "Post a message to your Facebook Page",
    parameters: {
      type: "object",
      properties: {
        message: { type: "string", description: "The post content" },
        link: { type: "string", description: "Optional URL to include" },
      },
      required: ["message"],
    },
    requiredCredential: "facebook_page_token",
    execute: async ({ message, link }, { credentials }) => {
      const pageId = credentials.facebook_page_id;
      const body: Record<string, string> = {
        message: message as string,
        access_token: credentials.facebook_page_token,
      };
      if (link) body.link = link as string;

      const res = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (data.error) return `Error: ${data.error.message}`;
      return `Posted successfully (ID: ${data.id})`;
    },
  },
  {
    name: "facebook_get_insights",
    description:
      "Get Facebook Page insights — views, reach, engagement metrics",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Time period: 'day', 'week', 'days_28'",
          enum: ["day", "week", "days_28"],
        },
      },
    },
    requiredCredential: "facebook_page_token",
    execute: async ({ period }, { credentials }) => {
      const pageId = credentials.facebook_page_id;
      const p = (period as string) || "week";
      const metrics =
        "page_views_total,page_fan_count,page_post_engagements";
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/insights?metric=${metrics}&period=${p}&access_token=${credentials.facebook_page_token}`
      );
      const data = await res.json();
      if (data.error) return `Error: ${data.error.message}`;
      return (
        (data.data || [])
          .map(
            (m: { name: string; values: Array<{ value: number }> }) =>
              `${m.name}: ${m.values?.[0]?.value ?? "N/A"}`
          )
          .join("\n") || "No insights available"
      );
    },
  },
];
