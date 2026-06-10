# TECHNICAL DEBT REPORT — Ada2AI

**Date:** 2026-06-10 | **Auditor:** صانع | **Mode:** OBSERVATION ONLY

---

## CRITICAL 🚨 — Must Fix Before Any Deployment

| ID | Debt | Location | Impact | Effort |
|----|------|----------|--------|--------|
| TD-01 | Hardcoded Supabase secrets in source | `db/supabase_client.py`, `db/setup_supabase.py` | Security breach — full DB access if repo leaked | 1h |
| TD-02 | No authentication on any endpoint | `main.py` (all 22+ routes) | Anyone can access/modify everything | 4h |
| TD-03 | Frontend API calls to wrong origin | `YOLOAnalysis.tsx`, `Academies.tsx`, `NahdaDemo.tsx` | 3 pages completely broken in production | 2h |
| TD-04 | VideoUpload silently serves fake data | `VideoUpload.tsx:128-135` | User sees random numbers as real analysis | 1h |
| TD-05 | Sync blocking on video analysis | `main.py` all /analyze/* | 1 request = entire server blocked | 6h |
| TD-06 | Fabricated coach dashboard data | `useCoachDashboard.ts:102-156` | Integrity violation — fake attendance, Goals, monthly data | 3h |

---

## HIGH ⚠️ — Must Fix Before Closed Beta

| ID | Debt | Location | Impact | Effort |
|----|------|----------|--------|--------|
| TD-07 | Vision → Intelligence bridge unwired | `main.py` vs intelligence engines | Intelligence layer isolated from real data | 8h |
| TD-08 | style_weights={} in recommendation | `main.py` /intelligence/recommend | 40% of scoring dead — recommendations blind to club context | 2h |
| TD-09 | Unbounded in-memory caches | `pipeline._results_cache`, `_signature_cache`, `_dna_profiles_cache` | Memory leak on long-running server | 2h |
| TD-10 | No input validation/rate limiting | All POST endpoints | DoS, abuse, unexpected input crashes | 4h |
| TD-11 | No automated test suite | `test_api.py` only (manual) | Regressions undetected | 16h |
| TD-12 | 6+ dead navigation routes | `DashboardLayout.tsx` nav | Nav links → 404 | 2h |
| TD-13 | Duplicate type definitions | `lib/supabase.ts` vs `types/profiles.ts` | Type mismatch on 'academy' role | 2h |
| TD-14 | No background task processing | Celery defined but unused | Long analyses block server | 8h |

---

## MEDIUM 🟡 — Should Fix for Production Quality

| ID | Debt | Location | Impact | Effort |
|----|------|----------|--------|--------|
| TD-15 | DemoAuthContext dead code | `contexts/DemoAuthContext.tsx` | Confusing — not wired anywhere | 0.5h |
| TD-16 | 3 competing API patterns | Supabase, fetch+base, fetch-relative | Maintenance nightmare | 4h |
| TD-17 | No code splitting/lazy loading | `App.tsx` imports all 40+ pages eagerly | Slow initial load | 3h |
| TD-18 | Style inconsistency (inline vs Tailwind) | Multiple components | No design system | 8h |
| TD-19 | Ontology YAML not loaded | `ontology/loader.py` uses inline dicts | YAML v1.1 additions ignored | 2h |
| TD-20 | Feedback not fed back to engines | FeedbackStore vs ScoutRecommendation | Stored corrections never improve scores | 8h |
| TD-21 | Validation runner has no API route | `validation/runner.py` | Cannot trigger from frontend | 2h |
| TD-22 | Human validation not wired to main.py | `human_validation/store.py` | Sessions not accessible via API | 2h |
| TD-23 | Deprecated FastAPI startup event | `main.py` @app.on_event("startup") | Will break in future FastAPI version | 1h |
| TD-24 | Private attribute access | `main.py` reads pipeline._* caches | Fragile coupling | 2h |
| TD-25 | Fake progress bars | `YOLOAnalysis.tsx`, `VideoUpload.tsx` | Misleading UX | 2h |
| TD-26 | No email verification | `LoginPage.tsx` | Anyone can register | 3h |
| TD-27 | Demo credentials visible in UI | `LoginPage.tsx:476-479` | Security risk | 0.5h |

---

## LOW 🟢 — Quality Improvements

| ID | Debt | Location | Impact | Effort |
|----|------|----------|--------|--------|
| TD-28 | Legacy `player_tracker.py` | `backend/player_tracker.py` | Supplanted by ByteTrack — confusion | 0.5h |
| TD-29 | Legacy `video_processor.py` | `backend/video_processor.py` | Not used by VisionPipeline | 0.5h |
| TD-30 | Legacy `yolov8n.pt` model | `backend/yolov8n.pt` (6.2MB) | Unused model wasting space | 0.1h |
| TD-31 | Duplicate `yolo11n.pt` | backend/ + content-pipeline/ | 10.8MB wasted | 0.1h |
| TD-32 | Copilot V1 still imported | `copilot/__init__.py` exports V1 | Confusion — V2 supersedes | 0.5h |
| TD-33 | ErrorBoundary English-only fallback | `ErrorBoundary.tsx` | Not Arabic-friendly | 1h |
| TD-34 | RTL hardcoded in YOLOAnalysis | `YOLOAnalysis.tsx:134` | Ignores language toggle | 0.5h |
| TD-35 | No structured logging | All modules use print() | No observability in production | 4h |
| TD-36 | Server packages in client bundle | express, mysql2, drizzle-orm, cookie, jose | Bloat + security risk (jose in client) | 1h |
| TD-37 | Zod v4 pre-release | `package.json` | Breaking changes possible | 2h |

---

## Debt Summary

| Severity | Count | Total Effort |
|----------|-------|-------------|
| 🚨 Critical | 6 | ~17h |
| ⚠️ High | 8 | ~44h |
| 🟡 Medium | 15 | ~43h |
| 🟢 Low | 10 | ~10h |
| **TOTAL** | **39** | **~114h** |

---

## Over-Engineered Areas

| Area | Evidence | Recommendation |
|------|----------|----------------|
| Content pipeline | 875-line orchestrator.py — not integrated into API | Trim or isolate completely |
| Docker Compose | Defines Celery + Redis — neither used | Remove or implement |
| tRPC | Defined in lib/trpc.ts — barely used | Remove or commit |
| Multiple auth contexts | AuthContext + DemoAuthContext — only AuthContext wired | Remove DemoAuthContext |

## Under-Engineered Areas

| Area | Evidence | Recommendation |
|------|----------|----------------|
| Vision → Intelligence bridge | Not connected — core value broken | Wire immediately |
| Video processing pipeline | Sync, blocking, no streaming | Add background tasks |
| Test infrastructure | Only manual test script | Add pytest + CI |
| Error handling | Silent fallbacks, swallowed errors | Add proper error boundaries |
| Observability | print() logging only | Add structured logging + metrics |