import { AgentTool } from "./types";
import crypto from "crypto";

export const twitterTools: AgentTool[] = [
  {
    name: "twitter_search",
    description: "Search recent tweets by keyword or hashtag",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query, e.g. '#yourbrand' or 'competitor name'",
        },
        max_results: {
          type: "string",
          description: "Results count (10-100)",
        },
      },
      required: ["query"],
    },
    requiredCredential: "twitter_bearer_token",
    execute: async ({ query, max_results }, { credentials }) => {
      const n = Math.min(
        100,
        Math.max(10, parseInt((max_results as string) || "20") || 20)
      );
      const res = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(
          query as string
        )}&max_results=${n}&tweet.fields=created_at,author_id,text`,
        {
          headers: {
            Authorization: `Bearer ${credentials.twitter_bearer_token}`,
          },
        }
      );
      const data = await res.json();
      if (data.errors || data.error)
        return `Twitter API error: ${JSON.stringify(data.errors || data.error)}`;
      return (
        (data.data || [])
          .map(
            (t: { text: string; created_at?: string }) =>
              `${t.text} (${t.created_at?.split("T")[0] || ""})`
          )
          .join("\n") || "No tweets found"
      );
    },
  },
  {
    name: "twitter_post",
    description: "Post a tweet from the configured account",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Tweet content (max 280 chars)",
        },
      },
      required: ["text"],
    },
    requiredCredential: "twitter_api_key",
    execute: async ({ text }, { credentials }) => {
      const tweet = (text as string).slice(0, 280);

      const oauth = buildTwitterOAuth(
        credentials.twitter_api_key,
        credentials.twitter_api_secret,
        credentials.twitter_access_token,
        credentials.twitter_access_secret,
        "POST",
        "https://api.twitter.com/2/tweets",
        {}
      );

      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: oauth,
        },
        body: JSON.stringify({ text: tweet }),
      });
      const data = await res.json();
      if (data.errors || data.error)
        return `Error: ${JSON.stringify(data.errors || data.error)}`;
      return `Tweet posted (ID: ${data.data?.id})`;
    },
  },
];

function buildTwitterOAuth(
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessSecret: string,
  method: string,
  url: string,
  params: Record<string, string>
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2);

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const allParams = { ...params, ...oauthParams };
  const paramStr = Object.keys(allParams)
    .sort()
    .map(
      (k) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`
    )
    .join("&");
  const sigBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    paramStr
  )}`;
  const sigKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(
    accessSecret
  )}`;

  const signature = crypto
    .createHmac("sha1", sigKey)
    .update(sigBase)
    .digest("base64");
  oauthParams["oauth_signature"] = signature;

  const header =
    "OAuth " +
    Object.keys(oauthParams)
      .map(
        (k) =>
          `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`
      )
      .join(", ");

  return header;
}
