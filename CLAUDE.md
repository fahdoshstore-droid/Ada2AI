# Ada2AI — Arabic Sports Platform

## Project Identity
- **Stack:** React 19 + TypeScript 5.9 + Vite 7 + Supabase + TailwindCSS
- **Design:** Dark theme, glass-card, RTL Arabic, teal-prime/navy-dark/scout-blue palette
- **Roles:** player, coach, scout (organization missing from UserType)
- **URLs:** ada2ai.com, ada2ai.cool
- **Supabase Project:** ujjmhqpyehymaavkawiv

## Architecture
- **State:** AuthContext (React Context) + local useState per page
- **Data:** hooks → Supabase direct (services/ layer is DEAD — AuthContext bypasses it)
- **Routing:** React Router v7 with lazy-loaded pages, ProtectedRoute with role guards
- **Deploy:** Vercel (manual prebuilt: `vercel build --prod && vercel deploy --prebuilt --prod`)

## Critical Known Issues (May 2026 Audit)

### P0 — Ship Blockers
1. **RLS policies missing** — RLS is ENABLED but zero policies exist. Tables may be fully locked or fully open.
2. **No Error Boundary** — any React crash = white screen
3. **No 404 route** — missing routes render blank layout
4. **No pagination** — `.select('*')` on every query fetches entire tables

### P1 — Architectural Debt
5. **Dual auth** — `services/auth.ts` defines signIn/signUp/etc but AuthContext calls `supabase.auth.*` directly
6. **services/ layer = 0 consumers** — every hook bypasses services and queries Supabase directly
7. **50+ unused shadcn/ui components** — ~2000 lines of dead code in `components/ui/`
8. **~15 unused npm packages** (cmdk, embla-carousel, vaul, sonner, react-hook-form, zod, recharts, etc.)
9. **No React Query/SWR** — every mount = fresh refetch, no caching or deduplication
10. **No `organization` role** in UserType or roleDashboard

### P2 — Broken Features
11. **No Player Dashboard** — players go to `/sport-id` (static marketing page)
12. **ScoutDashboard buttons are dead** — Eye/Compare/Download/Share have no onClick
13. **CoachDashboard buttons are dead** — "عرض الكل" and "إنشاء خطة تدريبية" do nothing
14. **Rankings category filter broken** — `activeCategory` state changes but doesn't filter data
15. **VideoAnalysis = UI mock** — no upload, no playback, no AI
16. **Demo mode broken** — `useDemoMode` toggles URL param but no hook consumes demo data
17. **SportID "احصل على هويتك" button** — no onClick handler

### P3 — Quality
18. **No tests at all** — zero test files, no test framework
19. **console.log in production** — `[AUTH]`, `[LOGIN]` debug logs scattered
20. **CSP includes unsafe-eval** — security risk in production
21. **No accessibility** — no aria-labels, `<label>` without htmlFor, no keyboard navigation

## What Works Well (KEEP)
- **AuthContext + ProtectedRoute** — solid auth flow, just needs org role
- **LandingPage + Layout** — polished visual design
- **WelcomePage** — role-based transition after login
- **Sentry + PostHog + Vercel Analytics** — monitoring foundation
- **DB Types** — well-defined TypeScript interfaces in `lib/supabase.ts`

## What to DELETE
- `src/components/ui/` (50+ files, zero imports from pages)
- `services/index.ts` (barrel export, 0 consumers)
- `services/auth.ts` (bypassed by AuthContext)
- `lib/security.ts` (CSP headers never applied)
- `demo/data.ts` (never consumed)
- ~15 unused npm packages

## What to REBUILD
- Player Dashboard (`/player` route — doesn't exist)
- Upload System (Supabase Storage)
- Data layer (add React Query, remove dual access)
- Search (server-side RPC instead of client-side filter)
- Error Boundaries + 404 page

## Working Routes
| Path | Component | Protected | Role-Gated |
|------|-----------|-----------|------------|
| `/` | LandingPage | No | No |
| `/login` | LoginPage | No | No |
| `/welcome` | WelcomePage | Yes | No |
| `/sport-id` | SportID (static) | Yes | No |
| `/scout` | ScoutDashboard | Yes | scout |
| `/coach` | CoachDashboard | Yes | coach |
| `/organizations` | OrganizationsDashboard | Yes | No |
| `/video-analysis` | VideoAnalysis (mock) | Yes | No |
| `/rankings` | Rankings | Yes | No |
| `/player-analysis` | PlayerAnalysis | Yes | No |

## Test Accounts
- scout@ada2ai.com / Test1234!
- coach@ada2ai.com / Test1234!
- player@ada2ai.com / Test1234!

## Vercel Deploy
```bash
cd ~/OKComputer/app
vercel build --prod --yes
vercel deploy --prebuilt --prod --yes
# Then verify JS hash matches: find .vercel/output/static/assets/index-*.js
```