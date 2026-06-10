# FRONTEND SAFE STATUS — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY — NO files modified

---

## Compilation

- `tsc --noEmit`: **3 TS errors** in `ScoutIntelligence.tsx` only
  - L165: style prop passes function instead of calling it
  - L323: Cannot find namespace 'JSX'
  - L341: CSSProperties not callable
- All other 40+ pages compile clean

---

## Route Map (37+ routes)

### Public Pages (no auth required)
- `/` Home — **static** ✅
- `/login` LoginPage — Supabase auth ✅
- `/product` Product — static + tRPC waitlist ⚠️
- `/scouts` Scouts — REST `/api/scouts` ⚠️ needs proxy
- `/compare` Compare — Supabase hooks ✅
- `/players` Players — REST `/api/players` ⚠️ needs proxy
- `/upload` Upload — REST `/api/analyze` ⚠️ needs proxy
- `/demo/nahda` NahdaDemo — REST `/api/scout/analyze` ⚠️ needs proxy
- `/demo` Demo — **hardcoded mock** ❌
- `/demo-video` DemoVideo — **hardcoded mock** ❌
- `/yolo` YOLOAnalysis — REST backend ⚠️ needs config
- `/scout` ScoutIntelligence — **localhost fallback** ❌
- `/rankings` Rankings — Supabase direct ⚠️ no error handling
- `/sport-id|sportid|passport` SportIDPassport — static ✅
- `/passport/athlete` AthleteProfile — Supabase hooks ✅
- `/passport/athlete/career` AthleteCareer — Supabase hooks ✅
- `/passport/athlete/history` AthleteHistory — Supabase hooks ✅
- `/passport/athlete/points` AthletePoints — Supabase + **static mock** ⚠️
- `/passport/facility` Facility — **no backend** ❌
- `/passport/facility/checkin` FacilityCheckin — simulated scan ⚠️
- `/passport/facility/analytics` FacilityAnalytics — **no backend** ❌
- `/passport/ministry` MinistryPassport — Supabase hooks ✅
- `/passport/hub` Hub — static ✅
- `/passport/governance` GovernancePassport — static ✅
- `/passport/partnerships` Partnerships — static ✅
- `/training` TrainingHub — REST `/api/players` ⚠️ needs proxy
- `/governance` Governance — static ✅
- `/governance/sub` SubGovernance — static ✅
- `/governance/team` TeamMembers — **placeholder** ❌
- `/modules/:slug` ModuleDetail — static ✅
- `/features/*` — static showcase pages ✅
- `/dashboards` Dashboards — static landing ✅
- `/academies` Academies — REST `/api/academies` ⚠️ needs proxy

### Protected Pages (auth required + role gating)
- `/coach` CoachDashboard — Supabase hooks ✅
- `/dashboard` DashboardRedirect (by role) ✅
- `/dashboard/player` PlayerProfile — Supabase write ⚠️ console-only errors
- `/dashboard/coach` CoachDashboard — Supabase hooks ✅
- `/dashboard/scout` ScoutDashboard — Supabase hooks ✅
- `/dashboard/club` ClubDashboard — Supabase + REST hybrid ⚠️
- `/dashboard/parent` ParentDashboard — **silent error swallowing** ❌
- `/dashboard/videos` VideoUpload — **localhost fallback** ⚠️
- `/dashboard/team` TeamAnalysis — **hardcoded mock** ❌

---

## Critical Issues

### 🔴 Production Blockers
1. **VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY not set** — Supabase client initializes with empty strings
2. **2 files hardcoded localhost:5001** — ScoutIntelligence.tsx + VideoUpload.tsx
3. **3 TS errors in ScoutIntelligence.tsx** — prevents strict builds
4. **10+ pages use relative `/api/...`** — will 404 if frontend deployed separately
5. **Facility + FacilityAnalytics** — dead code, no backend, always empty state

### 🟡 UX Degradation
1. DashboardHome + ParentDashboard — `.catch(() => setLoading(false))` silently swallows errors
2. PlayerProfile save failures — console only, no user feedback
3. Rankings — no error handling on Supabase query
4. AthletePoints — mixes real Supabase data + hardcoded static transactions

### 🟢 Working
- Auth-protected routes with role gating
- Supabase integration via react-query hooks (usePlayers, useEvaluations, etc.)
- Most pages have proper loading spinners
- Error boundaries + toast notifications at app level
- i18n Arabic/English properly handled

---

## Production Readiness Summary

| Category | Count | Pages |
|---|---|---|
| ✅ Production Ready | 7 | Home, LoginPage, Compare, AthleteProfile/Career/History, MinistryPassport, CoachDashboard, ScoutDashboard |
| ⚠️ Conditional | 14 | Need VITE_API_URL or Vite proxy setup |
| ❌ Not Ready | 6 | Demo, DemoVideo, ScoutIntelligence, Facility, FacilityAnalytics, TeamAnalysis |