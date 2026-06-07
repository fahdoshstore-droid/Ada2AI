# Ada2AI — Arabic Sports Platform

## Project Identity
- **Stack:** React 19 + TypeScript 5.9 + Vite 7 + Supabase + TailwindCSS + React Query
- **Design:** Dark theme, glass-card, RTL Arabic, teal-prime/navy-dark/scout-blue palette
- **Roles:** player, coach, scout (organization missing from UserType)
- **URLs:** ada2ai.com, ada2ai.cool (DNS issue on .cool)
- **Supabase Project:** ujjmhqpyehymaavkawiv

## Architecture
- **State:** AuthContext (React Context) + local useState per page
- **Data:** hooks → services/ → Supabase (services/ IS used by hooks)
- **Routing:** React Router v7 with lazy-loaded pages, ProtectedRoute with role guards
- **Deploy:** Vercel (manual prebuilt: `vercel build --prod && vercel deploy --prebuilt --prod`)

## Code Standards
- **Arabic RTL** — All user-facing text in Arabic. Use `dir="rtl"` and RTL-safe CSS.
- **Design tokens** — Use existing vars: `teal-prime`, `navy-dark`, `scout-blue`, `ice-white`, `ice-muted`.
- **No shadcn/ui** — removed. Build with TailwindCSS directly.
- **Services layer** — hooks call services/ which wraps Supabase. Use hooks pattern for new code.
- **No console.log** — Use Sentry `captureError` for errors.
- **TypeScript strict** — All code must pass `npx tsc --noEmit` with zero errors.

## Known Pitfalls
- **Never delete `api` schema** in Supabase — it's required by PostgREST.
- **Local .env ANON_KEY is truncated** — use `vercel env pull` for production values.
- **Vercel `--prod` builds from git** — use `vercel build --prod && vercel deploy --prebuilt --prod` for local deploys.
- **UserType is only player|coach|scout** — `organization` role is missing from type and `roleDashboard()`.
- **`services/auth.ts` is dead** — AuthContext bypasses it. Don't add new auth logic there.
- **Demo mode (`useDemoMode`) is broken** — toggles URL param but no data source switching. Don't rely on it.

## Working Routes
| Path | Component | Protected | Role-Gated |
|------|-----------|-----------|------------|
| `/` | LandingPage | No | No |
| `/login` | LoginPage | No | No |
| `/welcome` | WelcomePage | Yes | No |
| `/sport-id` | SportID | Yes | No |
| `/scout` | ScoutDashboard | Yes | scout |
| `/coach` | CoachDashboard | Yes | coach |
| `/coach/evaluate/:playerId` | EvaluationForm | Yes | coach |
| `/coach/workspace` | CoachWorkspace | Yes | coach |
| `/organizations` | OrganizationsDashboard | Yes | No |
| `/video-analysis` | VideoAnalysis (mock) | Yes | No |
| `/rankings` | Rankings | Yes | No |
| `/player-analysis` | PlayerAnalysis | Yes | No |
| `/player/onboarding` | PlayerOnboarding | Yes | player |
| `/player/dashboard` | PlayerDashboard | Yes | player |
| `/player/:id` | PlayerProfile | Yes | No |
| `/player/upload` | PlayerUpload | Yes | player |
| `/club/rawdha` | RawdhaDashboard | Yes | No |
| `/admin` | AdminDashboard | Yes | admin |
| `/privacy` | PrivacyPolicy | No | No |
| `*` | NotFound | No | No |

## Test Accounts
- scout@ada2ai.com / Test1234!
- coach@ada2ai.com / Test1234!
- player@ada2ai.com / Test1234!

## Before Committing
```bash
npx tsc --noEmit    # Must pass with 0 errors
npx vite build      # Must succeed (warnings OK, errors NOT OK)
```

## Deploy
```bash
cd ~/OKComputer/app
vercel build --prod --yes
vercel deploy --prebuilt --prod --yes
# Verify: find .vercel/output/static/assets/index-*.js
```

## Remaining Issues (June 2026)

### P0 — Ship Blockers
1. **ada2ai.cool DNS** — domain doesn't resolve, needs DNS fix

### P1 — Architectural Debt
2. **No `organization` role** in UserType or roleDashboard
3. **index.js = 966KB** — needs code-splitting (react-query + framer-motion + lucide)
4. **No tests** — zero test files, no test framework

### P2 — Features to Build
5. **VideoAnalysis** = UI mock only (no upload, no playback, no AI)
6. **Demo mode broken** — `useDemoMode` toggles URL param but no data source

### P3 — Quality
7. **CSP includes unsafe-eval** — security risk in production
8. **No accessibility** — no aria-labels, keyboard navigation