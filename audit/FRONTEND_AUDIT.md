# FRONTEND AUDIT — Ada2AI

**Date:** 2026-06-10 | **Auditor:** صانع | **Mode:** OBSERVATION ONLY

---

## Stack

React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 + wouter routing
State: @tanstack/react-query + Context + local state
Backend: Supabase (auth+DB) + Python API (localhost:5001)
Observability: Sentry + PostHog + Vercel Analytics

---

## Route Map: 35+ routes | 6 dead nav links → 404

---

## Critical Frontend Bugs

1. **YOLOAnalysis.tsx** — fetch() uses relative URLs → 404 in production
2. **Academies.tsx** — fetch("/api/academies") → same problem
3. **NahdaDemo.tsx** — fetch("/api/scout/analyze") → same problem
4. **VideoUpload.tsx** — silently shows random fake data when API fails
5. **useCoachDashboard.ts** — fabricated attendance=80, random monthly data
6. **LoginPage.tsx** — demo credentials visible in UI

---

## Competing API Patterns (3)

| Pattern | Pages | Base URL | Works? |
|---------|-------|----------|--------|
| Supabase client | Dashboard, Rankings, Login | VITE_SUPABASE_URL | ✅ |
| fetch() + API_BASE | ScoutIntelligence, VideoUpload | localhost:5001 | ⚠️ Dev only |
| fetch() relative | YOLOAnalysis, Academies, NahdaDemo | window.origin | ❌ Broken |

---

## Arabic/RTL Issues

- YOLOAnalysis hardcodes dir="rtl" (ignores language toggle)
- ScoutIntelligence Arabic-only (no EN toggle)
- ErrorBoundary English-only fallback
- Font ternary `isRTL ? 'Cairo' : 'Cairo'` — useless

---

## Style Inconsistency

- 3 approaches: inline style={}, Tailwind classes, index.css
- Brand color: #00DCC8 vs #00ff88 (ScoutIntelligence)
- Dark BG: #000A0F vs #0a0e1a vs #0A0E1A
- Border radius: 8px/10px/12px/16px + rounded-lg/xl/2xl — no standard

---

## Dead/Orphan Code

- DemoAuthContext.tsx — not imported in App.tsx
- lib/trpc.ts — 4 lines, unused
- Server packages in client: express, mysql2, drizzle-orm, cookie, jose

---

## Fake Progress Indicators

- YOLOAnalysis: Math.random() * 6 increments
- VideoUpload: simulated upload progress

---

## Production Readiness: ❌ NO

7 blocking issues, 10 critical issues, 12 quality issues.
Frontend is a **prototype masquerading as production**.
Must fix: broken API URLs, fake data fallbacks, fabricated coach data, auth gaps.