import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Use verified domain when available, otherwise fall back to Resend's pre-verified domain.
// To use a custom domain: verify synapseforge.ai at https://resend.com/domains
// then set RESEND_FROM env var to "SynapseForge <hello@synapseforge.ai>"
const FROM = process.env.RESEND_FROM ?? "SynapseForge <onboarding@resend.dev>";

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!resend) {
    console.log(`[Email - no RESEND_API_KEY] To: ${to} | Subject: ${subject}`);
    return false;
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("[Email send error]", error);
      return false;
    }
    console.log(`[Email sent] id=${data?.id} To: ${to} | Subject: ${subject}`);
    return true;
  } catch (e) {
    console.error("[Email send exception]", e);
    return false;
  }
}

export const email = {
  async welcome(to: string, name: string) {
    await send(to, "Welcome to SynapseForge ⚡", `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:40px;border-radius:12px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#fff">⚡ SynapseForge</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px">Welcome, ${name}! 👋</h1>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px">
          Your account is set up. A dedicated manager will be assigned to your account shortly and will reach out to understand your needs.
        </p>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px">
          In the meantime, you can explore your dashboard, configure your first AI instance, or message your manager once assigned.
        </p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
          Go to Dashboard →
        </a>
        <p style="color:#52525b;font-size:12px;margin-top:40px">SynapseForge · hello@synapseforge.ai</p>
      </div>
    `);
  },

  async managerAssigned(to: string, name: string, managerName: string, managerEmail: string) {
    await send(to, `Your manager ${managerName} has been assigned`, `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:40px;border-radius:12px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#fff">⚡ SynapseForge</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px">Meet your manager, ${managerName}</h1>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px">
          Hi ${name}, your dedicated manager has been assigned. ${managerName} will be your point of contact for everything — configuration, upgrades, and support.
        </p>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px">
          You can message them directly from your dashboard, or reply to this email.
        </p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/messages" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
          Message ${managerName} →
        </a>
        <p style="color:#52525b;font-size:12px;margin-top:40px">SynapseForge · ${managerEmail}</p>
      </div>
    `);
  },

  async newUserAlert(managerEmail: string, managerName: string, userName: string, userEmail: string, onboardingData?: string) {
    let context = "";
    if (onboardingData) {
      try {
        const d = JSON.parse(onboardingData);
        context = `<p style="color:#a1a1aa;margin:0 0 8px"><strong style="color:#e4e4e7">Business:</strong> ${d.business ?? "—"}</p>
        <p style="color:#a1a1aa;margin:0 0 8px"><strong style="color:#e4e4e7">Industry:</strong> ${d.industry ?? "—"}</p>
        <p style="color:#a1a1aa;margin:0 0 8px"><strong style="color:#e4e4e7">Use case:</strong> ${d.useCase ?? "—"}</p>`;
      } catch {}
    }
    await send(managerEmail, `New client assigned: ${userName}`, `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:40px;border-radius:12px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#fff">⚡ SynapseForge</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px">New client: ${userName}</h1>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 16px">Hi ${managerName}, a new client has been assigned to you.</p>
        <p style="color:#a1a1aa;margin:0 0 8px"><strong style="color:#e4e4e7">Name:</strong> ${userName}</p>
        <p style="color:#a1a1aa;margin:0 0 24px"><strong style="color:#e4e4e7">Email:</strong> ${userEmail}</p>
        ${context}
        <a href="${process.env.NEXTAUTH_URL}/manager" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
          View in Manager Portal →
        </a>
        <p style="color:#52525b;font-size:12px;margin-top:40px">SynapseForge · hello@synapseforge.ai</p>
      </div>
    `);
  },

  async newMessage(managerEmail: string, managerName: string, userName: string, messagePreview: string) {
    await send(managerEmail, `New message from ${userName}`, `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:40px;border-radius:12px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#fff">⚡ SynapseForge</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px">💬 ${userName} sent you a message</h1>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin:0 0 24px">
          <p style="color:#e4e4e7;margin:0;font-style:italic">"${messagePreview}"</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/manager" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
          Reply in Manager Portal →
        </a>
        <p style="color:#52525b;font-size:12px;margin-top:40px">SynapseForge · hello@synapseforge.ai</p>
      </div>
    `);
  },

  async passwordReset(to: string, resetUrl: string) {
    await send(to, "Reset your SynapseForge password", `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:40px;border-radius:12px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#fff">⚡ SynapseForge</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px">Reset your password</h1>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
          Reset Password →
        </a>
        <p style="color:#a1a1aa;font-size:13px;margin-top:24px">If you didn't request this, ignore this email.</p>
        <p style="color:#52525b;font-size:12px;margin-top:40px">SynapseForge · hello@synapseforge.ai</p>
      </div>
    `);
  },

  async verifyEmail(to: string, name: string, token: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    await send(to, "Verify your SynapseForge email", `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:40px;border-radius:12px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#fff">⚡ SynapseForge</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px">Verify your email, ${name}</h1>
        <p style="color:#a1a1aa;line-height:1.6;margin:0 0 24px">
          Click the button below to verify your email address. This link expires in 24 hours.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
          Verify Email →
        </a>
        <p style="color:#a1a1aa;font-size:13px;margin-top:24px">If you didn't create an account, ignore this email.</p>
        <p style="color:#52525b;font-size:12px;margin-top:40px">SynapseForge · hello@synapseforge.ai</p>
      </div>
    `);
  },

  async upgradeRequest(managerEmail: string, managerName: string, userName: string, userEmail: string, currentPlan: string, requestedPlan: string, note: string) {
    await send(managerEmail, `Upgrade request from ${userName}`, `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e4e4e7;padding:40px;border-radius:12px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#fff">⚡ SynapseForge</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px">⬆️ Upgrade request: ${userName}</h1>
        <p style="color:#a1a1aa;margin:0 0 8px"><strong style="color:#e4e4e7">From:</strong> ${currentPlan} → <strong style="color:#7c3aed">${requestedPlan}</strong></p>
        <p style="color:#a1a1aa;margin:0 0 8px"><strong style="color:#e4e4e7">Email:</strong> ${userEmail}</p>
        ${note ? `<div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px;margin:16px 0 24px"><p style="color:#e4e4e7;margin:0">"${note}"</p></div>` : ""}
        <a href="${process.env.NEXTAUTH_URL}/manager" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">
          Handle in Manager Portal →
        </a>
        <p style="color:#52525b;font-size:12px;margin-top:40px">SynapseForge · hello@synapseforge.ai</p>
      </div>
    `);
  },
};
