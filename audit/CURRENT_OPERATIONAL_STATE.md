# CURRENT OPERATIONAL STATE — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY Safe Audit | **Auditor:** صانع

---

## QUESTIONS & ANSWERS

### Is the website currently safe?
**⚠️ PARTIALLY.** Static pages and Supabase-auth pages work. Intelligence pages need backend running. 3 pages display mock data as real.

### Is the frontend operational?
**⚠️ PARTIALLY.** 7 fully ready + 14 conditional (need env vars/proxy) + 6 not ready (mock/no backend/TS errors). `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set for Supabase pages to work.

### Is the backend operational?
**✅ YES — locally.** FastAPI loads cleanly, 39 routes, all engines import. Not deployed publicly. No auth, no CORS, no rate limiting.

### Is Supabase safely configured?
**❌ NO.** 3 HIGH findings:
1. Anon key hardcoded in 2 Python files
2. 2 API routes unauthenticated (sportid, players)
3. 6 tables missing RLS policies (matches, analysis, trainings, facilities, evaluations, match_stats)

### Is IntelligenceBridge actually connected?
**✅ YES — verified with live test.** 10/10 data flow stages pass. Video → detection → tracking → events → signatures → DNA → recommendation → copilot — all connected. Zero mock data in bridge path.

### Are recommendations using real data?
**✅ YES — after bridge fix.** ClubIdentityEngine returns real style_weights (was empty `{}`). Recommendations use DNA traits computed from real signatures. BUT: requires `/analyze/full` to run first to populate bridge.

### Are any pages dangerous to open?
**❌ YES — 3 pages:**
- `/demo` — hardcoded mock players shown as real
- `/demo-video` — hardcoded mock analysis shown as real
- `/demo/nahda` — POSTs analysis without auth

### What MUST NOT be touched?
1. Supabase migrations / RLS policies (without explicit approval)
2. Production `.env` files
3. `api/sportid/route.ts` + `api/players/route.ts` (unauthenticated)
4. `backend/db/setup_supabase.py` (seeds data)
5. Any POST to production Supabase

### What is safe to test right now?
- All GET endpoints on `/intelligence/*` (read-only)
- `/health`, `/config`, `/intelligence/status`
- Static pages: Home, Product, Governance, Features
- Supabase auth flow: `/login`

### What is the single highest-risk area?
**🔴 Unauthenticated API routes (`api/sportid`, `api/players`) + missing RLS on 6 tables.** An attacker with the anon key (hardcoded in source) can read/write matches, analysis, trainings, facilities with zero authentication and zero row-level protection.

---

## CONSERVATIVE RISK MATRIX

| Area | Risk | Detail |
|---|---|---|
| Unauthenticated API routes | 🔴 CRITICAL | sportid + players routes open |
| Missing RLS on 6 tables | 🔴 CRITICAL | matches, analysis, trainings, facilities, evaluations, match_stats |
| Hardcoded Supabase credentials | 🔴 HIGH | 2 Python files with anon key fallback |
| No auth on backend 39 endpoints | 🔴 HIGH | Anyone can POST /analyze/full |
| Mock data as real (3 pages) | 🟡 MEDIUM | Demo, DemoVideo, TeamAnalysis |
| Frontend localhost fallback | 🟡 MEDIUM | ScoutIntelligence + VideoUpload |
| Silent error swallowing | 🟡 MEDIUM | DashboardHome, ParentDashboard |
| Bridge = in-memory only | 🟡 LOW | Data lost on restart |
| cv2/av class conflict | 🟡 LOW | May crash on video decode |
| Model file path mismatch | 🟡 LOW | Config vs actual location |

---

## FINAL VERDICT

```
NOT SAFE FOR TESTING YET
```

**Reasoning:** 2 CRITICAL + 3 HIGH findings block safe testing. The unauthenticated API routes + missing RLS + hardcoded credentials create a path where any test could inadvertently expose or mutate production Supabase data. **After** fixing the 2 unauthenticated routes, adding RLS to 6 tables, and moving credentials to env-only — then it will be `SAFE FOR CLOSED TESTING`.