/*
  Content Security Policy + Security Headers for Cloudflare/Vercel
  Ada2AI Production — OKComputer Frontend
*/

/*
  Deploy as _headers file in public/ for Cloudflare Pages
  Or as Vercel headers in vercel.json
*/

// CSP directive builder
export const cspDirective = {
  'default-src': "'self'",
  'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-insights.com",
  'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
  'img-src': "'self' data: blob: https://*.supabase.co https://*.vercel-storage.com",
  'font-src': "'self' https://fonts.gstatic.com",
  'connect-src': "'self' https://*.supabase.co wss://*.supabase.co https://*.posthog.com https://*.sentry.io https://vercel.live",
  'frame-src': "'none'",
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'frame-ancestors': "'none'",
}

export function buildCSP(): string {
  return Object.entries(cspDirective)
    .map(([key, val]) => `${key} ${val}`)
    .join('; ')
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': buildCSP(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }
}