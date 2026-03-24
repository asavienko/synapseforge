import { AgentTool } from "./types";

export const apolloTools: AgentTool[] = [
  {
    name: "search_contacts",
    description: "Search for B2B contacts by job title, company, or location. Returns name, email, company, and LinkedIn URL.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Job title filter e.g. 'Marketing Manager'" },
        company_name: { type: "string", description: "Company name filter" },
        location: { type: "string", description: "City or country filter" },
        industry: { type: "string", description: "Industry filter e.g. 'Technology', 'Healthcare'" },
        max_results: { type: "string", description: "Max results (1-10)" },
      },
    },
    requiredCredential: "apollo_api_key",
    execute: async ({ title, company_name, location, industry, max_results }, { credentials }) => {
      const n = Math.min(10, parseInt((max_results as string) || "5") || 5);
      const body: Record<string, unknown> = { per_page: n, page: 1 };
      if (title) body.person_titles = [title];
      if (company_name) body.q_organization_name = company_name;
      if (location) body.person_locations = [location];
      if (industry) body.organization_industry_tag_ids = []; // Apollo uses IDs, fallback to name search

      const res = await fetch("https://api.apollo.io/v1/people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "X-Api-Key": credentials.apollo_api_key,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) return `Apollo error: ${data.error}`;

      const people = data.people || [];
      if (!people.length) return "No contacts found";

      return people.map((p: {
        first_name: string;
        last_name: string;
        title: string;
        organization?: { name: string };
        email?: string;
        linkedin_url?: string;
        city?: string;
        country?: string;
      }) => [
        `👤 ${p.first_name} ${p.last_name} — ${p.title}`,
        `   Company: ${p.organization?.name || "Unknown"}`,
        p.email ? `   Email: ${p.email}` : "   Email: [requires unlock]",
        p.linkedin_url ? `   LinkedIn: ${p.linkedin_url}` : "",
        `   Location: ${[p.city, p.country].filter(Boolean).join(", ")}`,
      ].filter(Boolean).join("\n")).join("\n\n");
    },
  },
  {
    name: "enrich_company",
    description: "Get detailed company information including size, revenue, tech stack, and key people",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Company domain e.g. 'stripe.com'" },
      },
      required: ["domain"],
    },
    requiredCredential: "apollo_api_key",
    execute: async ({ domain }, { credentials }) => {
      const res = await fetch(
        `https://api.apollo.io/v1/organizations/enrich?domain=${encodeURIComponent(domain as string)}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": credentials.apollo_api_key,
          },
        }
      );
      const data = await res.json();
      if (data.error) return `Apollo error: ${data.error}`;

      const org = data.organization;
      if (!org) return "Company not found";

      return [
        `🏢 ${org.name}`,
        `Domain: ${org.primary_domain}`,
        `Industry: ${org.industry || "Unknown"}`,
        `Employees: ${org.estimated_num_employees?.toLocaleString() || "Unknown"}`,
        `Revenue: ${org.estimated_annual_revenue || "Unknown"}`,
        `Founded: ${org.founded_year || "Unknown"}`,
        `HQ: ${[org.city, org.country].filter(Boolean).join(", ")}`,
        org.short_description ? `\nAbout: ${org.short_description?.slice(0, 200)}` : "",
      ].filter(Boolean).join("\n");
    },
  },
];
