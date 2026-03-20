/**
 * Meta WhatsApp Business API Integration
 * 
 * This module handles all interactions with the Meta Business API for WhatsApp:
 * - OAuth flow management
 * - Message sending and receiving
 * - Webhook verification and registration
 * - Connection health checks
 */

import crypto from "crypto";

const META_GRAPH_API_VERSION = "v18.0";
const META_GRAPH_API_BASE = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface GenerateAuthUrlParams {
  redirectUri: string;
  state: string;
  scope?: string[];
}

interface ExchangeCodeParams {
  code: string;
  redirectUri: string;
}

interface TokenResponse {
  accessToken: string;
  expiresIn?: number;
  tokenType: string;
}

interface WebhookRegistrationParams {
  accessToken: string;
  accountId: string;
  webhookUrl: string;
  verifyToken: string;
}

interface MessagePayload {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text" | "image" | "document" | "audio";
  text?: { body: string };
  image?: { link: string; caption?: string };
  document?: { link: string; caption?: string; filename?: string };
  audio?: { link: string };
}

interface IncomingMessage {
  id: string;
  from: string;
  text: string;
  timestamp: number;
  type: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// OAuth Flow
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Meta OAuth authorization URL
 */
export function generateMetaAuthUrl({
  redirectUri,
  state,
  scope = ["whatsapp_business_management", "whatsapp_business_messaging"],
}: GenerateAuthUrlParams): string {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    throw new Error("META_APP_ID environment variable is required");
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: scope.join(","),
    response_type: "code",
  });

  return `https://www.facebook.com/${META_GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken({
  code,
  redirectUri,
}: ExchangeCodeParams): Promise<TokenResponse> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  
  if (!appId || !appSecret) {
    throw new Error("META_APP_ID and META_APP_SECRET environment variables are required");
  }

  const response = await fetch(
    `${META_GRAPH_API_BASE}/oauth/access_token?${new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: redirectUri,
    })}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

/**
 * Revoke an access token
 */
export async function revokeAccessToken(accessToken: string): Promise<void> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/me/permissions`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token revocation failed: ${error.error?.message || "Unknown error"}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Business Account
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get WhatsApp Business Account ID from access token
 */
export async function getBusinessAccountId(accessToken: string): Promise<string> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/me/whatsapp_business_accounts`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get business account: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  
  if (!data.data || data.data.length === 0) {
    throw new Error("No WhatsApp Business Account found. Please set up WhatsApp in your Meta Business Manager.");
  }

  return data.data[0].id;
}

/**
 * Get connection health status
 */
export async function getConnectionHealth({
  accessToken,
  accountId,
}: {
  accessToken: string;
  accountId: string;
}): Promise<{ healthy: boolean; error: string | null }> {
  try {
    const response = await fetch(
      `${META_GRAPH_API_BASE}/${accountId}?fields=id,name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { 
        healthy: false, 
        error: error.error?.message || "Connection check failed" 
      };
    }

    return { healthy: true, error: null };
  } catch (err) {
    return { 
      healthy: false, 
      error: err instanceof Error ? err.message : "Connection check failed" 
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Webhook Management
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Register webhook endpoint with Meta
 */
export async function registerWebhook({
  accessToken,
  accountId,
  webhookUrl,
  verifyToken,
}: WebhookRegistrationParams): Promise<void> {
  // First, check for existing webhooks
  const existingResponse = await fetch(
    `${META_GRAPH_API_BASE}/${accountId}/subscribed_apps`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!existingResponse.ok) {
    const error = await existingResponse.json();
    throw new Error(`Failed to check existing webhooks: ${error.error?.message || "Unknown error"}`);
  }

  // Subscribe to webhook
  const subscribeResponse = await fetch(
    `${META_GRAPH_API_BASE}/${accountId}/subscribed_apps`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed_fields: ["messages", "message_deliveries", "message_reads"],
        override_callback_uri: webhookUrl,
        verify_token: verifyToken,
      }),
    }
  );

  if (!subscribeResponse.ok) {
    const error = await subscribeResponse.json();
    throw new Error(`Webhook registration failed: ${error.error?.message || "Unknown error"}`);
  }
}

/**
 * Unregister webhook endpoint
 */
export async function unregisterWebhook({
  accessToken,
  accountId,
  _verifyToken,
}: {
  accessToken: string;
  accountId: string;
  _verifyToken?: string;
}): Promise<void> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/${accountId}/subscribed_apps`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Webhook unregistration failed: ${error.error?.message || "Unknown error"}`);
  }
}

/**
 * Verify webhook signature from Meta
 */
export function verifyWebhookSignature({
  signature,
  body,
  appSecret,
}: {
  signature: string;
  body: string;
  appSecret: string;
}): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");

  // Meta sends signature as "sha256=<hash>"
  const receivedHash = signature.replace("sha256=", "");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(receivedHash, "hex")
    );
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Message Handling
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse incoming webhook payload from Meta
 * Returns null if not a message event
 */
export function parseIncomingMessage(payload: unknown): IncomingMessage | null {
  const data = payload as {
    object?: string;
    entry?: Array<{
      changes?: Array<{
        value?: {
          messaging_product?: string;
          metadata?: { phone_number_id?: string };
          messages?: Array<{
            id: string;
            from: string;
            timestamp: string;
            type: string;
            text?: { body: string };
          }>;
        };
      }>;
    }>;
  };

  // Validate payload structure
  if (data.object !== "whatsapp_business_account") {
    return null;
  }

  const entry = data.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  if (!value?.messages || value.messages.length === 0) {
    return null;
  }

  const message = value.messages[0];

  // Only handle text messages for now
  if (message.type !== "text" || !message.text?.body) {
    return null;
  }

  return {
    id: message.id,
    from: message.from,
    text: message.text.body,
    timestamp: parseInt(message.timestamp, 10),
    type: message.type,
  };
}

/**
 * Send WhatsApp message
 */
export async function sendMessage({
  accessToken,
  phoneNumberId,
  to,
  message,
}: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  message: string;
}): Promise<{ messageId: string }> {
  const payload: MessagePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: message },
  };

  const response = await fetch(
    `${META_GRAPH_API_BASE}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send message: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return { messageId: data.messages?.[0]?.id };
}

/**
 * Get phone number ID for a given phone number
 */
export async function getPhoneNumberId({
  accessToken,
  accountId,
  phoneNumber,
}: {
  accessToken: string;
  accountId: string;
  phoneNumber: string;
}): Promise<string | null> {
  const response = await fetch(
    `${META_GRAPH_API_BASE}/${accountId}/phone_numbers`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get phone numbers: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  
  // Find matching phone number
  const match = data.data?.find(
    (pn: { display_phone_number?: string; id?: string }) => 
      pn.display_phone_number?.replace(/\s/g, "") === phoneNumber.replace(/\s/g, "")
  );

  return match?.id || null;
}
