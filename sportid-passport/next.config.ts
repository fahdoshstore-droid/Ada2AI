import type { NextConfig } from "next";

const securityHeaders = [
  // Enforce HTTPS for 2 years, include subdomains, allow preload list
  { key: 'Strict-Transport-Security',       value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent clickjacking — only same origin can frame the app
  { key: 'X-Frame-Options',                 value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options',          value: 'nosniff' },
  // Enable XSS filter in legacy browsers
  { key: 'X-XSS-Protection',               value: '1; mode=block' },
  // Control referrer information sent with requests
  { key: 'Referrer-Policy',                 value: 'strict-origin-when-cross-origin' },
  // Restrict browser feature access
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',           // not needed (QR is display-only in this POC)
      'microphone=()',
      'geolocation=(self)',  // allowed for future facility location features
      'payment=()',
      'usb=()',
      'interest-cohort=()',  // opt out of FLoC
    ].join(', '),
  },
  // Enable DNS prefetch for faster navigation
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires unsafe-eval (dev HMR) and unsafe-inline (RSC inline scripts)
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Tailwind CSS uses inline styles
      "style-src 'self' 'unsafe-inline'",
      // data: for QR code canvas→dataURL, blob: for any future media
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // API routes only — no external fetch in this POC
      "connect-src 'self'",
      // No iframes embedded from this app
      "frame-ancestors 'none'",
      // Prevent base-tag hijacking
      "base-uri 'self'",
      // Only allow form submissions to same origin
      "form-action 'self'",
      // Prevent embedding plugins
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['recharts'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Prevent exposing server info
  poweredByHeader: false,

  // Image optimisation: allow data URLs and local images only
  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
