# Ada2AI — Agent Rules

## Mandatory Standards (دستور التنفيذ)

1. **الاكتمال واجب** — Every task: implementation + testing + documentation. No "partially done".
2. **لا أنصاف حلول** — Root solution only. No patches over broken architecture.
3. **الجودة + السرعة** — Both required. Neither excuses the other.
4. **لا أعذار** — Time/complexity/difficulty = not excuses.
5. **البحث قبل البناء** — Search first, understand second, implement third.
6. **الاختبار ليس خيارًا** — Untested = unfinished.
7. **لا نهايات مفتوحة** — Don't defer what can be finished now.
8. **الوضوح** — Write code as if someone else will continue from where you left off.
9. **المسؤولية الكاملة** — Own the output start to finish.
10. **10x أو لا شيء** — Standard is "exceptional mastery", not "acceptable".

## Code Standards
- **Arabic RTL** — All user-facing text in Arabic. Use `dir="rtl"` and RTL-safe CSS.
- **Design tokens** — Use existing vars: `teal-prime`, `navy-dark`, `scout-blue`, `ice-white`, `ice-muted`.
- **No shadcn/ui** — The existing `components/ui/` directory is DEAD CODE. Do NOT use it. Build with TailwindCSS directly.
- **Services layer** — The `services/` directory is bypassed. AuthContext calls `supabase.auth.*` directly. For new code, use hooks pattern (like `usePlayers`, `useCoachPlayers`).
- **No console.log** — Remove all debug console.log before committing. Use Sentry `captureError` for errors.
- **TypeScript strict** — All code must pass `npx tsc --noEmit` with zero errors.

## Known Pitfalls
- **Never delete `api` schema** in Supabase — it's required by PostgREST.
- **Local .env ANON_KEY is truncated** — use `vercel env pull` for production values.
- **Vercel `--prod` builds from git** — use `vercel build --prod && vercel deploy --prebuilt --prod` for local deploys.
- **UserType is only player|coach|scout** — `organization` role is missing from type and `roleDashboard()`.
- **RLS is enabled but has zero policies** — tables may be fully locked. Create policies before testing data access.
- **`services/auth.ts` is dead** — AuthContext bypasses it. Don't add new auth logic there.
- **Demo mode (`useDemoMode`) is broken** — toggles URL param but no data source switching. Don't rely on it.

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