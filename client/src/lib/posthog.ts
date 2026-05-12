/**
 * PostHog – lightweight product analytics
 * Initializes only when VITE_PUBLIC_POSTHOG_KEY is set
 * Opted out by default until user consents
 */
import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined;

export function initPostHog() {
  if (!POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST || "https://us.posthog.com",
    capture_pageview: true,
    opt_out_capturing_by_default: true, // require explicit user consent
  });
}

/** Call after user grants analytics consent */
export function optInPostHog() {
  posthog.opt_in_capturing();
}

/** Call if user revokes consent */
export function optOutPostHog() {
  posthog.opt_out_capturing();
}