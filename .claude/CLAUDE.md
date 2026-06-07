# Ada2AI — Agent Rules (دستور التنفيذ)

## Mandatory Standards

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
- **No shadcn/ui** — components/ui/ was removed. Build with TailwindCSS directly.
- **Services layer** — hooks call services/ which wraps Supabase. Use hooks pattern for new code (like `usePlayers`, `useCoachPlayers`).
- **No console.log** — Use Sentry `captureError` for errors.
- **TypeScript strict** — All code must pass `npx tsc --noEmit` with zero errors.

## Known Pitfalls
- **Never delete `api` schema** in Supabase — it's required by PostgREST.
- **Local .env ANON_KEY is truncated** — use `vercel env pull` for production values.
- **Vercel `--prod` builds from git** — use `vercel build --prod && vercel deploy --prebuilt --prod` for local deploys.
- **UserType is only player|coach|scout** — `organization` role is missing.
- **`services/auth.ts` is dead** — AuthContext bypasses it. Don't add new auth logic there.
- **Demo mode (`useDemoMode`) is broken** — toggles URL param but no data source switching.
- **RLS policies exist** — profiles (auth.uid = id), reports (scout/coach access). Don't drop them.

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