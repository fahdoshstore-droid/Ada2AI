/**
 * Sentry – lightweight error monitoring
 * Initializes only when VITE_SENTRY_DSN is set
 */
import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry() {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
  });
}

/** Drop-in error boundary that reports to Sentry */
export const SentryErrorBoundary = Sentry.ErrorBoundary;