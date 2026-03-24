import { AgentTool } from "./types";

export const hunterTools: AgentTool[] = [
  {
    name: "find_email",
    description: "Find a professional email address for a person at a company. Useful for B2B outreach and lead generation.",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Company domain e.g. 'apple.com'" },
        first_name: { type: "string", description: "Person's first name" },
        last_name: { type: "string", description: "Person's last name" },
      },
      required: ["domain"],
    },
    requiredCredential: "hunter_api_key",
    execute: async ({ domain, first_name, last_name }, { credentials }) => {
      let url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain as string)}&api_key=${credentials.hunter_api_key}`;
      if (first_name) url += `&first_name=${encodeURIComponent(first_name as string)}`;
      if (last_name) url += `&last_name=${encodeURIComponent(last_name as string)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.errors) return `Hunter.io error: ${data.errors[0]?.details || "Unknown error"}`;

      const email = data.data?.email;
      if (!email) return "Email not found for this person/domain";

      const confidence = data.data?.score;
      return `Email: ${email}\nConfidence: ${confidence}%\nSources: ${data.data?.sources?.length || 0} verified`;
    },
  },
  {
    name: "find_domain_emails",
    description: "Find all known email addresses for a company domain. Returns a list of contacts.",
    parameters: {
      type: "object",
      properties: {
        domain: { type: "string", description: "Company domain e.g. 'stripe.com'" },
        limit: { type: "string", description: "Max results (1-10)" },
      },
      required: ["domain"],
    },
    requiredCredential: "hunter_api_key",
    execute: async ({ domain, limit }, { credentials }) => {
      const n = Math.min(10, parseInt((limit as string) || "5") || 5);
      const res = await fetch(
        `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain as string)}&limit=${n}&api_key=${credentials.hunter_api_key}`
      );
      const data = await res.json();
      if (data.errors) return `Hunter.io error: ${JSON.stringify(data.errors)}`;

      const emails = data.data?.emails || [];
      if (!emails.length) return "No emails found for this domain";

      return emails.map((e: { first_name?: string; last_name?: string; position?: string; value: string; confidence: number }) =>
        `${e.first_name || ""} ${e.last_name || ""} (${e.position || "Unknown"}) — ${e.value} [${e.confidence}% confidence]`
      ).join("\n");
    },
  },
  {
    name: "verify_email",
    description: "Verify if an email address is valid and deliverable before sending",
    parameters: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address to verify" },
      },
      required: ["email"],
    },
    requiredCredential: "hunter_api_key",
    execute: async ({ email }, { credentials }) => {
      const res = await fetch(
        `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email as string)}&api_key=${credentials.hunter_api_key}`
      );
      const data = await res.json();
      if (data.errors) return `Error: ${JSON.stringify(data.errors)}`;

      const result = data.data;
      return `Email: ${result.email}\nStatus: ${result.status}\nDeliverable: ${result.result}\nDisposable: ${result.disposable}\nWebmail: ${result.webmail}`;
    },
  },
];
