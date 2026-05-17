/**
 * Monitoring — Ada2AI Stabilization
 * Sentry: Runtime error capture, auth failure logging
 * PostHog: Page analytics, feature usage tracking
 * Vercel Analytics: Already wired in App.tsx
 *
 * All calls are safe — failures silently ignored.
 * NO behavior changes. NO feature additions.
 * Instrumentation only.
 */
import * as Sentry from '@sentry/react'
import posthog from 'posthog-js'

// ── Sentry Init ──────────────────────────────────────────────
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || ''
const SENTRY_ENABLED = !!SENTRY_DSN

if (SENTRY_ENABLED) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE === 'production' ? 'production' : 'staging',
    release: 'ada2ai@910249b',
    tracesSampleRate: 0.1,        // 10% traces for perf monitoring
    replaysSessionSampleRate: 0,   // No replays (GDPR)
    replaysOnErrorSampleRate: 1.0, // Full replay on errors
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      'Non-Error promise rejection captured',
    ],
    beforeSend(event) {
      // Don't send events in local dev
      if (window.location.hostname === 'localhost') return null
      return event
    },
  })
}

// ── PostHog Init ─────────────────────────────────────────────
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || ''
const POSTHOG_ENABLED = !!POSTHOG_KEY

if (POSTHOG_ENABLED) {
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://us.i.posthog.com',
    // Only capture in production — no `disabled` key in PostHogConfig v1.373+
    capture_pageview: import.meta.env.MODE === 'production',
    capture_pageleave: import.meta.env.MODE === 'production',
    persistence: 'localStorage',
    sanitize_properties: (props) => {
      // Strip PII — never capture email, phone, names
      const sanitized = { ...props }
      delete sanitized.email
      delete sanitized.phone
      delete sanitized.full_name
      delete sanitized.name
      return sanitized
    },
  })
}

// ── Exported Instrumentation API ──────────────────────────────
// These are safe no-ops when monitoring is not configured.

export function captureError(error: Error, context?: Record<string, string>) {
  if (SENTRY_ENABLED) {
    Sentry.captureException(error, { extra: context })
  }
  if (POSTHOG_ENABLED) {
    posthog.capture('error_captured', {
      error_message: error.message,
      error_type: error.name,
      ...context,
    })
  }
}

export function captureAuthEvent(event: 'login' | 'signup' | 'logout' | 'session_expired' | 'auth_failure', detail?: Record<string, string>) {
  if (POSTHOG_ENABLED) {
    posthog.capture(`auth_${event}`, { ...detail })
  }
  if (SENTRY_ENABLED) {
    Sentry.addBreadcrumb({
      category: 'auth',
      message: `auth_${event}`,
      level: event === 'auth_failure' ? 'warning' : 'info',
      data: detail,
    })
  }
}

export function captureRouteChange(path: string) {
  if (POSTHOG_ENABLED) {
    posthog.capture('$pageview', { $current_url: path })
  }
}

export function setUserContext(userId: string, role: string) {
  if (SENTRY_ENABLED) {
    Sentry.setUser({ id: userId })
  }
  if (POSTHOG_ENABLED) {
    posthog.identify(userId, { role })
  }
}

export function clearUserContext() {
  if (SENTRY_ENABLED) {
    Sentry.setUser(null)
  }
  if (POSTHOG_ENABLED) {
    posthog.reset()
  }
}

// Re-export for direct Sentry access if needed
export { Sentry, posthog }