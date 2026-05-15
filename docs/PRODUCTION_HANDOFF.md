# Ada2AI Production Handoff Document

**Date:** 2026-05-15  
**Branch:** release/production-ready  
**Status:** Stabilization complete

---

## 1. Architecture Overview

- **Frontend:** React 19 + Vite + Wouter (SPA with client-side routing)
- **Backend:** Express API routes in `/api/*` serverless functions (Vercel)
- **Database:** Supabase PostgreSQL (project: `ujjmhqpyehymaavkawiv`)
- **Auth:** Supabase Auth (sole auth system — Manus SDK fully removed)
- **Deployment:** Vercel (no-git-remote: `vercel build --prod && vercel deploy --prebuilt --prod`)
- **Domain:** ada2ai.com

---

## 2. Auth Flow

- `AuthContext.tsx` — Supabase `onAuthStateChange` ONLY
- `ProtectedRoute.tsx` — Role-gated routes, fallback `/dashboard/player`
- `LoginPage.tsx` — Email/password via Supabase Auth
- **DemoAuthContext** exists for demo mode only (not active in production)

### Role Routing
| Role | Default Dashboard |
|------|-------------------|
| player | /dashboard/player |
| coach | /dashboard/coach |
| scout | /dashboard/scout |
| club | /dashboard/club |
| parent | /dashboard/parent |
| academy | /dashboard/player |

---

## 3. Database Schema

- **Canonical schema:** `supabase-schema.sql` (14.6 KB)
- **Migrations:** `supabase/migrations/001` through `004`
- **Critical:** NEVER delete `api` schema — PostgREST requires it
- **PGRST002 fix:** `api` schema + `pgrst_pre_config()` function

### Key Tables
- `profiles` — User profiles (FK to `auth.users`)
- `players` — Player data
- `academies` — Academy/club data
- `scouts` — Scout data
- `facilities` — Facility data

---

## 4. Security

### Headers (vercel.json)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Cache-Control: no-store, private (API routes)
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- Content-Security-Policy (API routes)

### Known Security Issues (requires follow-up)
- **API GET endpoints without auth:** `players`, `academies`, `scouts`, `facilities`, `trainings` — these expose data via unauthenticated GET. RLS on Supabase side limits what's visible, but server-side auth check is recommended.
- **`frontend/api/` removed** — duplicate unauthenticated routes eliminated in this release.

---

## 5. Monitoring

### Sentry
- Package: `@sentry/react` — installed
- Init: `client/src/lib/sentry.ts` — `initSentry()` called in `main.tsx`
- ErrorBoundary: `Sentry.captureException()` wired in `ErrorBoundary.tsx`
- **Requires env var:** `VITE_SENTRY_DSN` (set in Vercel dashboard)

### PostHog
- Package: `posthog-js` — installed
- Init: `client/src/lib/posthog.ts` — `initPostHog()` called in `main.tsx`
- Privacy: `opt_out_capturing_by_default: true`
- **Requires env vars:** `VITE_PUBLIC_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST`

### Vercel Analytics
- Package: `@vercel/analytics` + `@vercel/speed-insights` — installed
- Components: `<Analytics />` + `<SpeedInsights />` mounted in `App.tsx`
- No configuration needed — auto-detects on Vercel deployment

---

## 6. Environment Variables

### Required (Production)
```
VITE_SUPABASE_URL=https://ujjmhqpyehymaavkawiv.supabase.co
VITE_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_URL=<same as above>
SUPABASE_ANON_KEY=<same as above>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard — server only>
ANTHROPIC_API_KEY=<for AI features>
VITE_SENTRY_DSN=<from Sentry dashboard>
VITE_PUBLIC_POSTHOG_KEY=<from PostHog dashboard>
VITE_PUBLIC_POSTHOG_HOST=https://us.posthog.com
```

### Optional
```
GOOGLE_API_KEY=<for video analysis>
VIDEO_DB_API_KEY=<for Agentic Streams>
```

---

## 7. Deployment Commands

```bash
# Build and deploy to production (Vercel)
vercel build --prod && vercel deploy --prebuilt --prod

# Verify deployment (compare JS hashes)
# Check that built assets match deployed assets
```

**⚠️ NEVER use `vercel --prod` directly** — it builds from git, not local. Always use the two-step process above.

---

## 8. Recovery

### Database Recovery
1. Restore from `supabase-schema.sql` (canonical schema)
2. Run migrations in order: `001` → `002` → `003` → `004`
3. Verify with: `SELECT * FROM profiles LIMIT 1;`

### Frontend Recovery
1. `git checkout release/production-ready`
2. `pnpm install`
3. `pnpm build` (or `cd client && pnpm build`)
4. Deploy with Vercel commands above

---

## 9. Known Issues (Post-Stabilization)

| Issue | Severity | Notes |
|-------|----------|-------|
| Unauthenticated GET on 5 API endpoints | Medium | RLS limits data but no server auth check |
| `drizzle.config.ts` dialect changed mysql→postgresql | Low | Unused in production (Supabase client) |
| `/api/ask` stream incompatible with Edge Response | Low | ReadableStream<string> vs Uint8Array |
| Unbounded RAG cache in synthesizer | Low | No LRU limit |
| Duplicate routes `/sport-id`, `/sportid`, `/passport` | Low | All point to same component |
| Chunk size warnings (3MB+ main bundle) | Low | Could code-split in future |

---

_Generated by صانع — 2026-05-15_