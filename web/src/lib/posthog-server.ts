import { PostHog } from "posthog-node";

let _posthog: PostHog | null = null;

export function getServerPostHog() {
  if (!process.env.POSTHOG_KEY) return null;
  if (!_posthog) {
    _posthog = new PostHog(process.env.POSTHOG_KEY, {
      host: process.env.POSTHOG_HOST ?? "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _posthog;
}

export async function captureServerEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const ph = getServerPostHog();
  if (!ph) return;
  ph.capture({ distinctId: userId, event, properties: properties ?? {} });
  await ph.flush();
}
