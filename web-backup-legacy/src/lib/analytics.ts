import posthog from "posthog-js";

export const analytics = {
  // Sign-up funnel
  signupStarted: () => posthog.capture("signup_started"),
  signupCompleted: (method: "email" | "google") =>
    posthog.capture("signup_completed", { method }),
  emailVerified: () => posthog.capture("email_verified"),
  onboardingStep: (step: number, skipped = false) =>
    posthog.capture("onboarding_step", { step, skipped }),
  onboardingCompleted: (props: { hasLLMKey: boolean; hasChannel: boolean }) =>
    posthog.capture("onboarding_completed", props),

  // Activation funnel
  instanceCreated: (type: string) => posthog.capture("instance_created", { type }),
  credentialAdded: (provider: string) => posthog.capture("credential_added", { provider }),
  channelConnected: (channel: string) => posthog.capture("channel_connected", { channel }),
  instanceDeployed: () => posthog.capture("instance_deployed"),
  firstChatMessageSent: () => posthog.capture("first_chat_message_sent"),
  instanceHealthy: () => posthog.capture("instance_healthy"),

  // Engagement
  dashboardVisited: () => posthog.capture("dashboard_visited"),
  managerMessageSent: () => posthog.capture("manager_message_sent"),
  upgradeClicked: (fromPlan: string) =>
    posthog.capture("upgrade_clicked", { from_plan: fromPlan }),
  upgradeCompleted: (plan: string) => posthog.capture("upgrade_completed", { plan }),

  // User identification
  identify: (
    userId: string,
    props: { email?: string; name?: string; plan?: string }
  ) => posthog.identify(userId, props),
};
