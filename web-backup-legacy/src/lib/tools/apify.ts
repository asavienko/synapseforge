import { AgentTool } from "./types";

const POPULAR_ACTORS: Record<string, string> = {
  "google-maps": "apify/google-maps-scraper",
  "amazon-reviews": "apify/amazon-reviews-scraper",
  "website-crawler": "apify/website-content-crawler",
  "instagram-scraper": "apify/instagram-scraper",
  "linkedin-companies": "apify/linkedin-company-scraper",
  "tripadvisor": "apify/tripadvisor-scraper",
  "yelp": "apify/yelp-scraper",
};

export const apifyTools: AgentTool[] = [
  {
    name: "scrape_web",
    description: "Scrape data from any website using Apify. Choose a preset actor or specify a custom one. Great for lead generation, competitor research, review monitoring.",
    parameters: {
      type: "object",
      properties: {
        preset: {
          type: "string",
          description: "Preset scraper: 'google-maps', 'amazon-reviews', 'website-crawler', 'instagram-scraper', 'tripadvisor', 'yelp'",
          enum: ["google-maps", "amazon-reviews", "website-crawler", "instagram-scraper", "tripadvisor", "yelp"],
        },
        actor_id: { type: "string", description: "Custom Apify actor ID (overrides preset)" },
        input: { type: "string", description: "JSON input for the actor, e.g. '{\"searchTerms\": [\"pizza Madrid\"]}'" },
        max_items: { type: "string", description: "Max results to return (1-50)" },
      },
    },
    requiredCredential: "apify_api_key",
    execute: async ({ preset, actor_id, input, max_items }, { credentials }) => {
      const actorId = (actor_id as string) || POPULAR_ACTORS[preset as string];
      if (!actorId) return "Specify a preset or actor_id";

      const n = Math.min(50, parseInt((max_items as string) || "10") || 10);
      let parsedInput: Record<string, unknown> = {};
      try {
        if (input) parsedInput = JSON.parse(input as string);
      } catch {
        return "Invalid JSON in input parameter";
      }
      parsedInput.maxItems = n;

      // Start run
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?token=${credentials.apify_api_key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedInput),
        }
      );
      const runData = await runRes.json();
      if (runData.error) return `Apify error: ${runData.error.message}`;

      const runId = runData.data?.id;
      if (!runId) return "Failed to start Apify run";

      // Poll for completion (max 30s)
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(
          `https://api.apify.com/v2/actor-runs/${runId}?token=${credentials.apify_api_key}`
        );
        const status = await statusRes.json();
        if (status.data?.status === "SUCCEEDED") break;
        if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status.data?.status)) {
          return `Run ${status.data.status}`;
        }
      }

      // Get results
      const dataRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${credentials.apify_api_key}&limit=${n}&clean=true`
      );
      const items = await dataRes.json();
      if (!Array.isArray(items) || !items.length) return "No results found";

      // Return formatted summary
      return JSON.stringify(items.slice(0, n), null, 2).slice(0, 3000);
    },
  },
];
