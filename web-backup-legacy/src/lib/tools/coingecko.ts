import { AgentTool } from "./types";

const ALIASES: Record<string, string> = {
  btc: "bitcoin", bitcoin: "bitcoin", eth: "ethereum", ethereum: "ethereum",
  sol: "solana", solana: "solana", bnb: "binancecoin", xrp: "ripple",
  doge: "dogecoin", dot: "polkadot", link: "chainlink", avax: "avalanche-2",
  matic: "matic-network", polygon: "matic-network",
};

function resolveId(s: string) { return ALIASES[s.toLowerCase()] ?? s.toLowerCase(); }

export const coingeckoTools: AgentTool[] = [
  {
    name: "crypto_price",
    description: "Get current cryptocurrency price. Works for any coin — bitcoin, ethereum, solana, etc.",
    parameters: {
      type: "object",
      properties: {
        coins: { type: "string", description: "Coin name(s) comma-separated e.g. 'bitcoin,ethereum'" },
        currency: { type: "string", description: "Quote currency: usd, eur, gbp (default: usd)" },
      },
      required: ["coins"],
    },
    // No requiredCredential — always available
    execute: async ({ coins, currency }, { credentials }) => {
      const cur = ((currency as string) || "usd").toLowerCase();
      const ids = (coins as string).split(",").map((c) => resolveId(c.trim())).join(",");
      const base = credentials.coingecko_api_key ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
      const headers: Record<string, string> = { Accept: "application/json" };
      if (credentials.coingecko_api_key) headers["x-cg-pro-api-key"] = credentials.coingecko_api_key;

      const res = await fetch(`${base}/simple/price?ids=${ids}&vs_currencies=${cur}&include_24hr_change=true`, { headers });
      const data = await res.json();
      if (data.status?.error_code) return `CoinGecko error: ${data.status.error_message}`;

      return Object.entries(data).map(([id, p]) => {
        const prices = p as Record<string, number>;
        const price = prices[cur];
        const change = prices[`${cur}_24h_change`];
        return `${id.toUpperCase()}: $${price?.toLocaleString()} ${change !== undefined ? `(${change >= 0 ? "+" : ""}${change?.toFixed(2)}% 24h)` : ""}`;
      }).join("\n") || "No data found";
    },
  },
  {
    name: "crypto_chart",
    description: "Get cryptocurrency price trend over a time period",
    parameters: {
      type: "object",
      properties: {
        coin: { type: "string", description: "Coin name or symbol" },
        days: { type: "string", description: "Days of history: 1, 7, 30, 90, 365" },
        currency: { type: "string", description: "Quote currency (default: usd)" },
      },
      required: ["coin"],
    },
    execute: async ({ coin, days, currency }, { credentials }) => {
      const id = resolveId(coin as string);
      const d = (days as string) || "7";
      const cur = (currency as string) || "usd";
      const base = credentials.coingecko_api_key ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
      const headers: Record<string, string> = { Accept: "application/json" };
      if (credentials.coingecko_api_key) headers["x-cg-pro-api-key"] = credentials.coingecko_api_key;

      const res = await fetch(`${base}/coins/${id}/market_chart?vs_currency=${cur}&days=${d}`, { headers });
      const data = await res.json();
      if (!data.prices?.length) return "No chart data";

      const prices = data.prices as [number, number][];
      const first = prices[0][1], last = prices[prices.length - 1][1];
      const high = Math.max(...prices.map(([, p]) => p));
      const low = Math.min(...prices.map(([, p]) => p));
      const change = ((last - first) / first) * 100;

      return `${id.toUpperCase()} — ${d}d chart\nStart: $${first.toLocaleString()} → Now: $${last.toLocaleString()}\nHigh: $${high.toLocaleString()} | Low: $${low.toLocaleString()}\nChange: ${change >= 0 ? "+" : ""}${change.toFixed(2)}% ${change > 5 ? "📈" : change > 0 ? "↗️" : change > -5 ? "↘️" : "📉"}`;
    },
  },
];
