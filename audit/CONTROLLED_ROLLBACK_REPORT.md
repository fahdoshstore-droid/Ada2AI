# CONTROLLED FRONTEND ROLLBACK — FINAL REPORT

**Date:** 2026-06-10
**Branch:** rollback/frontend-stable
**Base:** ee5406f (CONNECT + VISIBILITY — last visually stable)
**Commit:** d210e19
**Deployed:** https://ada2ai.com

---

## VERDICT: ✅ STABLE CLOSED PILOT STATE

---

## What Changed

### VISUAL ROLLBACK (from ee5406f baseline)
- Original palette: #2563eb, #1e40af, #f8fafc, #dc2626
- Original typography: system-ui, sans-serif
- Original layout, spacing, cards, navigation
- Original component structure preserved

### CRITICAL FIXES PRESERVED (cherry-picked)

| Fix | File | Status |
|---|---|---|
| Auth timeout 5s | useAuth.ts | ✅ |
| ProtectedRoute 8s guard | ProtectedRoute.tsx | ✅ |
| Query timeout 8s | CoachDashboard.tsx | ✅ |
| Query timeout 8s | PlayerDashboard.tsx | ✅ |
| Query timeout 8s | Rankings.tsx | ✅ |
| Query timeout 8s | AdminDashboard.tsx | ✅ |
| AbortController + apiUnavailable | PlayerIntelligence.tsx | ✅ |
| Column: is_verified (NOT is_active) | All dashboards | ✅ |
| Column: name (NOT name_ar) | All dashboards | ✅ |
| mountedRef protection | All pages | ✅ |
| Null guard on user_id.slice | CoachDashboard | ✅ |
| Math.random removal | Rankings | ✅ |

### NOT INCLUDED (rolled back)
- Brand color drift (#00C2A8, #007ABA, #f0f6ff)
- Noto Kufi Arabic font injection
- Google Fonts preconnect
- index.css brand rewrite
- index.html font additions
- Any component redesigns

---

## Production Verification

| Test | Result |
|---|---|
| Landing page | ✅ Renders, original identity |
| Login | ✅ Works |
| CoachDashboard | ✅ 41 players with real names |
| PlayerDashboard | ✅ Timeout-safe |
| Rankings | ✅ Timeout-safe |
| AdminDashboard | ✅ Timeout-safe |
| Intelligence page | ✅ "غير متاح حالياً" after timeout |
| No infinite loading | ✅ All pages timeout-safe |
| No blank pages | ✅ All pages render |
| No crashes | ✅ Zero JS errors |

---

## RLS Investigation Finding

The original "RLS blocks coach" diagnosis was WRONG.

**Actual cause:** Query referenced `is_active` column which does not exist
in the `players` table. Supabase returned 400 error, code misinterpreted
as permission failure.

**Real columns:** `is_verified` (not `is_active`), `name` (not `name_ar`)

**RLS on players:** `Public read players` policy with `USING (true)` —
read access is PUBLIC. No RLS fix needed.

---

## Files Modified (7 total)

1. `useAuth.ts` — timeout on getUser + fetchRole
2. `ProtectedRoute.tsx` — 8s max loading guard
3. `CoachDashboard.tsx` — column fix + timeout + mountedRef + null guard
4. `PlayerDashboard.tsx` — column fix + timeout + mountedRef
5. `Rankings.tsx` — column fix + timeout + mountedRef
6. `AdminDashboard.tsx` — timeout + mountedRef
7. `PlayerIntelligence.tsx` — AbortController + apiUnavailable + mountedRef

---

## Success Conditions

- ✅ Original Ada2AI feel restored
- ✅ Dashboards stable (41 real players visible)
- ✅ No fake data
- ✅ No infinite loading
- ✅ No broken auth
- ✅ No frontend chaos
- ✅ Stable closed pilot