/**
 * Analytics — Ada2AI
 * Wraps Vercel Analytics `track()` for event monitoring.
 * Safe: all calls are wrapped in try/catch — analytics never breaks the app.
 */
import { track } from '@vercel/analytics'

export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean>
): void {
  try {
    track(eventName, properties)
  } catch {
    // Analytics is fire-and-forget — silently ignore failures
  }
}
