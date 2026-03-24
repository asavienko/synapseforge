import { AgentTool } from "./types";

export const githubTools: AgentTool[] = [
  {
    name: "github_search_issues",
    description: "Search GitHub issues in a repository. Use to check if a bug is already reported.",
    parameters: {
      type: "object",
      properties: {
        repo: { type: "string", description: "Repo in 'owner/repo' format e.g. 'vercel/next.js'" },
        query: { type: "string", description: "Search query" },
        state: { type: "string", description: "open, closed, or all", enum: ["open", "closed", "all"] },
        max_results: { type: "string", description: "Max results (1-10)" },
      },
      required: ["repo", "query"],
    },
    requiredCredential: "github_token",
    execute: async ({ repo, query, state, max_results }, { credentials }) => {
      const n = Math.min(10, parseInt((max_results as string) || "5") || 5);
      const q = `${query} repo:${repo} is:issue is:${(state as string) || "open"}`;
      const res = await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=${n}`,
        { headers: { Authorization: `Bearer ${credentials.github_token}`, Accept: "application/vnd.github.v3+json" } }
      );
      const data = await res.json();
      if (data.message) return `GitHub error: ${data.message}`;
      const items = data.items || [];
      if (!items.length) return "No issues found";
      return items.map((i: { number: number; title: string; state: string; html_url: string; labels: Array<{ name: string }> }) =>
        `#${i.number} [${i.state.toUpperCase()}] ${i.title}\n${i.html_url}\n${i.labels?.map((l) => l.name).join(", ")}`
      ).join("\n\n");
    },
  },
  {
    name: "github_create_issue",
    description: "Create a GitHub issue from a user-reported bug or support ticket",
    parameters: {
      type: "object",
      properties: {
        repo: { type: "string", description: "Repo in owner/repo format" },
        title: { type: "string", description: "Issue title" },
        body: { type: "string", description: "Issue description" },
        labels: { type: "string", description: "Comma-separated labels" },
      },
      required: ["repo", "title"],
    },
    requiredCredential: "github_token",
    execute: async ({ repo, title, body, labels }, { credentials }) => {
      const payload: Record<string, unknown> = { title, body: body || "" };
      if (labels) payload.labels = (labels as string).split(",").map((l) => l.trim());
      const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
        method: "POST",
        headers: { Authorization: `Bearer ${credentials.github_token}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.message) return `GitHub error: ${data.message}`;
      return `Issue created: #${data.number} — ${data.title}\n${data.html_url}`;
    },
  },
];
