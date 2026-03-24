import { AgentTool } from "./types";

export const googleMapsTools: AgentTool[] = [
  {
    name: "find_places",
    description: "Search for local businesses, restaurants, or any places using Google Maps. Returns name, address, phone, rating, and hours.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query e.g. 'plumbers in Madrid' or 'coffee shops near me'" },
        location: { type: "string", description: "Optional: city or lat,lng to center the search" },
        max_results: { type: "string", description: "Number of results (1-20, default 10)" },
      },
      required: ["query"],
    },
    requiredCredential: "google_maps_api_key",
    execute: async ({ query, location, max_results }, { credentials }) => {
      const n = Math.min(20, parseInt((max_results as string) || "10") || 10);
      let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query as string)}&key=${credentials.google_maps_api_key}`;
      if (location) url += `&location=${encodeURIComponent(location as string)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        return `Google Maps error: ${data.status} — ${data.error_message || ""}`;
      }

      const places = (data.results || []).slice(0, n);
      if (!places.length) return "No places found";

      return places.map((p: {
        name: string;
        formatted_address: string;
        rating?: number;
        user_ratings_total?: number;
        formatted_phone_number?: string;
        opening_hours?: { open_now: boolean };
        place_id: string;
      }) => [
        `📍 ${p.name}`,
        `   ${p.formatted_address}`,
        p.rating ? `   ⭐ ${p.rating}/5 (${p.user_ratings_total} reviews)` : "",
        p.formatted_phone_number ? `   📞 ${p.formatted_phone_number}` : "",
        p.opening_hours ? `   ${p.opening_hours.open_now ? "🟢 Open now" : "🔴 Closed"}` : "",
      ].filter(Boolean).join("\n")).join("\n\n");
    },
  },
  {
    name: "get_place_details",
    description: "Get detailed information about a specific place including phone, website, hours, and reviews",
    parameters: {
      type: "object",
      properties: {
        place_id: { type: "string", description: "Google Place ID from a previous find_places result" },
      },
      required: ["place_id"],
    },
    requiredCredential: "google_maps_api_key",
    execute: async ({ place_id }, { credentials }) => {
      const fields = "name,formatted_address,formatted_phone_number,website,opening_hours,rating,reviews,url";
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${credentials.google_maps_api_key}`
      );
      const data = await res.json();
      if (data.status !== "OK") return `Error: ${data.status}`;

      const p = data.result;
      const hours = p.opening_hours?.weekday_text?.join(", ") || "Hours not available";
      const topReview = p.reviews?.[0];

      return [
        `📍 ${p.name}`,
        `Address: ${p.formatted_address}`,
        p.formatted_phone_number ? `Phone: ${p.formatted_phone_number}` : "",
        p.website ? `Website: ${p.website}` : "",
        `Rating: ⭐ ${p.rating}/5`,
        `Hours: ${hours}`,
        topReview ? `Top review: "${topReview.text?.slice(0, 200)}" — ${topReview.author_name}` : "",
      ].filter(Boolean).join("\n");
    },
  },
];
