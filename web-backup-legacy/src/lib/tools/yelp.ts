import { AgentTool } from "./types";

export const yelpTools: AgentTool[] = [
  {
    name: "yelp_search",
    description: "Search Yelp for local businesses with ratings and reviews",
    parameters: {
      type: "object",
      properties: {
        term: { type: "string", description: "Business type or name" },
        location: { type: "string", description: "City or address" },
        limit: { type: "string", description: "Max results (1-20)" },
      },
      required: ["term", "location"],
    },
    requiredCredential: "yelp_api_key",
    execute: async ({ term, location, limit }, { credentials }) => {
      const n = Math.min(20, parseInt((limit as string) || "10") || 10);
      const res = await fetch(
        `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(term as string)}&location=${encodeURIComponent(location as string)}&limit=${n}`,
        { headers: { Authorization: `Bearer ${credentials.yelp_api_key}` } }
      );
      const data = await res.json();
      if (data.error) return `Yelp error: ${data.error.description}`;
      return (data.businesses || []).map((b: { name: string; rating: number; review_count: number; location: { display_address: string[] }; phone: string }) =>
        `⭐ ${b.rating}/5 — ${b.name} (${b.review_count} reviews)\n   ${b.location.display_address.join(", ")}${b.phone ? `\n   📞 ${b.phone}` : ""}`
      ).join("\n\n") || "No results";
    },
  },
  {
    name: "yelp_get_reviews",
    description: "Get recent reviews for a Yelp business",
    parameters: {
      type: "object",
      properties: {
        business_id: { type: "string", description: "Yelp business ID or alias" },
      },
      required: ["business_id"],
    },
    requiredCredential: "yelp_api_key",
    execute: async ({ business_id }, { credentials }) => {
      const res = await fetch(
        `https://api.yelp.com/v3/businesses/${business_id}/reviews?limit=5`,
        { headers: { Authorization: `Bearer ${credentials.yelp_api_key}` } }
      );
      const data = await res.json();
      if (data.error) return `Yelp error: ${data.error.description}`;
      return (data.reviews || []).map((r: { rating: number; text: string; time_created: string; user: { name: string } }) =>
        `⭐ ${r.rating}/5 — ${r.user.name} (${r.time_created.split(" ")[0]})\n"${r.text.slice(0, 300)}"`
      ).join("\n\n") || "No reviews";
    },
  },
];
