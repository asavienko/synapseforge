import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM ?? "SynapseForge <onboarding@resend.dev>";
const APP_URL = process.env.NEXTAUTH_URL ?? "https://synapseforge.ai";
const BRAND_COLOR = "#7c3aed";
const FOOTER_EMAIL = "hello@synapseforge.ai";

// ─── Core send ────────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!resend) {
    console.log(`[Email - no RESEND_API_KEY] To: ${to} | Subject: ${subject}`);
    return false;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) { console.error("[Email send error]", error); return false; }
    console.log(`[Email sent] id=${data?.id} To: ${to} | Subject: ${subject}`);
    return true;
  } catch (e) {
    console.error("[Email send exception]", e);
    return false;
  }
}

// ─── Base template ────────────────────────────────────────────────────────────

function base(title: string, body: string, cta?: { href: string; label: string }): string {
  const ctaHtml = cta
    ? `<div style="margin:28px 0 0">
        <a href="${cta.href}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;letter-spacing:0.02em">
          ${cta.label}
        </a>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:40px auto;padding:0 16px">
    <!-- Logo -->
    <div style="margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #27272a">
      <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.01em">⚡ SynapseForge</span>
    </div>

    <!-- Card -->
    <div style="background:#111113;border:1px solid #27272a;border-radius:12px;padding:36px">
      <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0 0 16px;line-height:1.3">${title}</h1>
      <div style="color:#a1a1aa;line-height:1.7;font-size:15px">${body}</div>
      ${ctaHtml}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px">
      <p style="color:#52525b;font-size:12px;margin:0">
        SynapseForge &nbsp;·&nbsp;
        <a href="mailto:${FOOTER_EMAIL}" style="color:#52525b;text-decoration:none">${FOOTER_EMAIL}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Quote block helper ───────────────────────────────────────────────────────

function quote(text: string): string {
  return `<div style="background:#18181b;border-left:3px solid ${BRAND_COLOR};border-radius:0 6px 6px 0;padding:14px 16px;margin:16px 0;color:#e4e4e7;font-style:italic">"${text}"</div>`;
}

function row(label: string, value: string): string {
  return `<p style="margin:6px 0"><strong style="color:#e4e4e7">${label}:</strong> <span style="color:#a1a1aa">${value}</span></p>`;
}

// ─── Email senders ────────────────────────────────────────────────────────────

export const email = {
  // ── Auth ──────────────────────────────────────────────────────────────────

  async verifyEmail(to: string, name: string, token: string) {
    const url = `${APP_URL}/verify-email?token=${token}`;
    return send(
      to,
      "Verify your SynapseForge email",
      base(
        `Verify your email, ${name} 👋`,
        `<p>Thanks for signing up! Click the button below to verify your email address.</p>
         <p style="font-size:13px;color:#71717a">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>`,
        { href: url, label: "Verify Email →" }
      )
    );
  },

  async passwordReset(to: string, resetUrl: string) {
    return send(
      to,
      "Reset your SynapseForge password",
      base(
        "Reset your password 🔑",
        `<p>Someone requested a password reset for your account. Click the button below to choose a new password.</p>
         <p style="font-size:13px;color:#71717a">This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.</p>`,
        { href: resetUrl, label: "Reset Password →" }
      )
    );
  },

  // ── Onboarding ────────────────────────────────────────────────────────────

  async welcome(to: string, name: string) {
    return send(
      to,
      "Welcome to SynapseForge ⚡",
      base(
        `Welcome, ${name}! 🚀`,
        `<p>Your account is set up. Here's what happens next:</p>
         <ol style="padding-left:20px;margin:16px 0">
           <li style="margin-bottom:8px">A dedicated manager will be assigned to your account shortly</li>
           <li style="margin-bottom:8px">They'll help you configure and deploy your first AI agent</li>
           <li style="margin-bottom:8px">Your agent goes live on Telegram, Discord, or Slack — your choice</li>
         </ol>
         <p>In the meantime, you can start setting up your instance in the dashboard.</p>`,
        { href: `${APP_URL}/dashboard`, label: "Go to Dashboard →" }
      )
    );
  },

  async managerAssigned(to: string, name: string, managerName: string, managerEmail: string) {
    return send(
      to,
      `Your manager ${managerName} has been assigned ✅`,
      base(
        `Meet your manager, ${managerName}`,
        `<p>Hi ${name}, your dedicated manager is ready to help. <strong style="color:#e4e4e7">${managerName}</strong> will be your point of contact for configuration, upgrades, and support.</p>
         <p>You can message them directly from your dashboard. They'll typically respond within a few hours.</p>`,
        { href: `${APP_URL}/dashboard/messages`, label: `Message ${managerName} →` }
      )
    );
  },

  async newUserAlert(
    managerEmail: string,
    managerName: string,
    userName: string,
    userEmail: string,
    onboardingData?: string
  ) {
    let context = "";
    if (onboardingData) {
      try {
        const d = JSON.parse(onboardingData);
        context = `<div style="margin:16px 0">
          ${d.business ? row("Business", d.business) : ""}
          ${d.industry ? row("Industry", d.industry) : ""}
          ${d.useCase ? row("Use case", d.useCase) : ""}
          ${d.teamSize ? row("Team size", d.teamSize) : ""}
        </div>`;
      } catch { /* ignore */ }
    }

    return send(
      managerEmail,
      `New client assigned: ${userName}`,
      base(
        `New client: ${userName} 👤`,
        `<p>Hi ${managerName}, a new client has been assigned to you and is expecting to hear from you soon.</p>
         ${row("Name", userName)}
         ${row("Email", userEmail)}
         ${context}`,
        { href: `${APP_URL}/manager`, label: "View in Manager Portal →" }
      )
    );
  },

  // ── Messaging ─────────────────────────────────────────────────────────────

  async newMessage(
    managerEmail: string,
    managerName: string,
    userName: string,
    messagePreview: string
  ) {
    return send(
      managerEmail,
      `New message from ${userName}`,
      base(
        `💬 ${userName} sent you a message`,
        `<p>You have a new message from your client <strong style="color:#e4e4e7">${userName}</strong>:</p>
         ${quote(messagePreview)}`,
        { href: `${APP_URL}/manager`, label: "Reply in Manager Portal →" }
      )
    );
  },

  async newMessageFromManager(
    userEmail: string,
    userName: string,
    managerName: string,
    messagePreview: string
  ) {
    return send(
      userEmail,
      `New message from ${managerName}`,
      base(
        `💬 ${managerName} sent you a message`,
        `<p>Hi ${userName}, your manager <strong style="color:#e4e4e7">${managerName}</strong> has replied:</p>
         ${quote(messagePreview)}`,
        { href: `${APP_URL}/dashboard/messages`, label: "View & Reply →" }
      )
    );
  },

  // ── Instances ─────────────────────────────────────────────────────────────

  async instanceReady(
    to: string,
    userName: string,
    instanceName: string,
    channels: string[]
  ) {
    const channelList = channels.length > 0
      ? `<p>Your agent is now live on: <strong style="color:#e4e4e7">${channels.join(", ")}</strong></p>`
      : `<p>Your agent is running. Add Telegram, Discord or Slack tokens in the Credentials tab to connect it to a channel.</p>`;

    return send(
      to,
      `🚀 Your agent "${instanceName}" is live!`,
      base(
        `"${instanceName}" is deployed and running 🚀`,
        `<p>Hi ${userName}, your AI agent has been deployed to a dedicated cloud server and is ready to use.</p>
         ${channelList}
         <p>You can now chat with it directly in the dashboard, or start a conversation on your connected channels.</p>`,
        { href: `${APP_URL}/dashboard/instances`, label: "View Instance →" }
      )
    );
  },

  // ── Billing ───────────────────────────────────────────────────────────────

  async upgradeRequest(
    managerEmail: string,
    managerName: string,
    userName: string,
    userEmail: string,
    currentPlan: string,
    requestedPlan: string,
    note: string
  ) {
    return send(
      managerEmail,
      `Upgrade request from ${userName}`,
      base(
        `⬆️ Upgrade request: ${userName}`,
        `<p>Hi ${managerName}, a client has requested a plan upgrade and needs your attention.</p>
         ${row("Client", userName)}
         ${row("Email", userEmail)}
         ${row("Current plan", currentPlan)}
         ${row("Requested plan", `<strong style="color:${BRAND_COLOR}">${requestedPlan}</strong>`)}
         ${note ? quote(note) : ""}`,
        { href: `${APP_URL}/manager`, label: "Handle in Manager Portal →" }
      )
    );
  },
};
