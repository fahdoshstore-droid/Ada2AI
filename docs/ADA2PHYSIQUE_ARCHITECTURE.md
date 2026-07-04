# Ada2Physique — Architecture Specification v1.0

**Status:** Architecture Freeze (Phase 1)  
**Date:** 26 June 2026  
**Author:** Chief Product Officer / Chief AI Officer / Principal Architect  
**Founder:** Former Classic Physique bodybuilding champion (~90 kg category)  
**Parent Platform:** Ada2AI — Saudi sports intelligence infrastructure  
**Supabase Project:** `ujjmhqpyehymaavkawiv` (shared with Ada2AI)  
**Repository:** Ada2AI monorepo (isolated `physique/` + `backend/physique/` modules)

> **Mission:** Build the "Hudl + WHOOP + Coach + ChatGPT" for bodybuilding — a production-grade SaaS where one coach scales to thousands of athletes through AI, preserving elite coaching quality.

---

## 1. Executive Summary

Ada2Physique is a vertical AI bodybuilding platform built **on top of Ada2AI's shared infrastructure**. It is NOT a generic fitness app. It translates the founder's real Classic Physique competition + coaching expertise into scalable AI: computer-vision exercise analysis, physique scoring, biomechanics, and personalized athlete intelligence.

The platform serves three roles — **Athlete**, **Coach**, **Admin** — and ships in five incremental phases. Every feature must **reduce coaching time** or **improve athlete performance**, or it is not built.

### Design Principles (non-negotiable)
- AI-first · Video-first · Data-first · Mobile-first · Production-first
- Never build features because other fitness apps have them.
- Never use fake data. Never hardcode business logic.
- Reuse Ada2AI infrastructure wherever possible; **no duplicated infrastructure**.
- Keep bodybuilding logic **isolated as independent modules** (namespaced `physique_*`).
- Every AI module exposes reusable APIs. Every component is production-ready.

---

## 2. Topology — Isolated Modules on Shared Infra

Ada2Physique lives as **isolated modules inside the Ada2AI monorepo**, deployed as independent units but sharing core services. This maximizes reuse while keeping bodybuilding logic quarantined so it never destabilizes Ada2AI's talent-discovery product.

```
                        ┌─────────────────────────────────────────────┐
                        │            SHARED SERVICES (Ada2AI)          │
                        │  Supabase Auth · Postgres+RLS · Storage      │
                        │  FastAPI vision_core · intelligence layer    │
                        │  ai-provider (Claude/Ollama/Gemini)          │
                        │  Brand design system · Vercel · GitHub Actions│
                        └───────────────┬─────────────────────────────┘
                                        │ reused (not duplicated)
                ┌───────────────────────┼───────────────────────┐
                ▼                       ▼                       ▼
   ┌────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐
   │  Ada2AI (existing) │  │  Ada2Physique         │  │  Ada2Physique       │
   │  unified/ frontend │  │  physique/ frontend   │  │  backend/physique/  │
   │  backend/          │  │  (Vite+React+TS)      │  │  (FastAPI service)  │
   │  talent discovery  │  │  athlete/coach/admin  │  │  coaching + AI APIs │
   └────────────────────┘  └──────────────────────┘  └────────────────────┘
        separate Vercel app      separate Vercel app        Cloud Run / Docker
```

| Concern | Ada2AI (existing) | Ada2Physique (new) | Reuse strategy |
|---|---|---|---|
| Auth | Supabase Auth + `profiles` | Same | Share `auth.users` + `profiles`; extend `user_type` enum additively |
| Database | `ujjmhqpyehymaavkawiv` | Same | New `physique_*` namespace, own RLS — zero overlap with Ada2AI tables |
| Storage | Supabase Storage | Same | New private buckets `physique-videos`, `physique-photos`; signed URLs only |
| Vision | `backend/vision_core` (YOLO11 + MediaPipe) | Same engine | Phase 2 adds `backend/physique/biomechanics` rules on top of vision_core |
| AI text/vision | `server/_core/ai-provider` + Gemini | Same pattern | `backend/physique/ai_provider` reuses env-based provider selection |
| Brand/UI | `BRAND.md` + `DESIGN.md` tokens | Same tokens | Copy design tokens into `physique/`; bodybuilding-tuned accent |
| Deploy | Vercel + PM2 | Vercel (frontend) + Cloud Run (backend) | New Vercel project from `physique/` subfolder; backend Docker image |
| CI/CD | GitHub Actions | Same | Add `physique` + `backend/physique` jobs to existing workflows |

**Isolation guarantee:** Ada2Physique touches shared infra only through (a) the additive `profiles.user_type` extension and (b) calling shared services via their existing APIs. It never alters Ada2AI tables, pages, or routes.

---

## 3. Roles & Identity

Reuses `auth.users` 1:1 with `profiles`. Ada2Physique roles map onto `profiles.user_type`:

| Ada2Physique role | `profiles.user_type` value | Notes |
|---|---|---|
| Athlete | `'athlete'` | Already a valid value in Ada2AI schema — zero migration risk |
| Coach | `'coach'` | Already valid |
| Admin | `'admin'` | **New value** — added additively (superset of existing CHECK) |

A `physique_athletes` row (1:1 with `profiles.id`) holds bodybuilding-specific attributes; `physique_coaches` holds coach profile + marketplace fields (Phase 4). Membership in Ada2Physique is determined by the presence of a row in `physique_athletes` / `physique_coaches`, **not** by `user_type` alone — so an Ada2AI scout can also be an Ada2Physique coach without conflict.

---

## 4. Phased Roadmap

| Phase | Theme | Key deliverables | Status |
|---|---|---|---|
| **1** | Coaching Platform | Athlete/coach/admin dashboards, programs, nutrition plans, check-ins, progress logs (weight/measurements/sleep/hydration), exercise library, AI Coach chat (reuses ai-provider), RLS, signed uploads | **This build** |
| **2** | AI Exercise Analysis | Video pipeline on vision_core + `biomechanics` rules for 15 exercises; rep count, ROM, stability, tempo, joint angles, technique mistakes, injury risk | Planned |
| **3** | AI Physique Intelligence | Posing photo/video analysis (symmetry, balance, shoulder:waist, conditioning), weekly comparison reports, progress engine (plateau/strength/composition prediction) | Planned |
| **4** | Coach Marketplace | Public coach profiles, subscriptions, program/consult/nutrition sales, payments, athlete management | Planned |
| **5** | Enterprise Coach Platform | Multi-coach orgs, white-label, bulk operations, advanced analytics, RBAC tiers | Planned |

Phase 1 is delivered in this session as a production-ready foundation. Phases 2–5 are specced here so the schema and module boundaries are forward-compatible.

---

## 5. AI Module Inventory (cross-phase contracts)

Every module is an isolated service exposing a versioned REST API (`/physique/v1/...`). Text/vision intelligence reuses the Ada2AI provider pattern (Claude → Ollama fallback; Gemini Vision for image tasks).

| Module | Phase | Inputs | Outputs | API base |
|---|---|---|---|---|
| AI Coach (chat) | 1 | athlete context + message | coaching reply + suggested actions | `/physique/v1/coach/chat` |
| AI Nutrition Coach | 1 | athlete metrics, goal, progress | calories, macros, meal timing, water | `/physique/v1/nutrition/plan` |
| AI Program Generator | 1 | goal, experience, equipment, weak muscles, recovery, frequency | structured training program | `/physique/v1/programs/generate` |
| AI Check-In Agent | 1 | weekly photos/weight/measurements/training/nutrition | coach-ready report (pre-review) | `/physique/v1/checkins/{id}/report` |
| AI Exercise Coach | 2 | workout video | exercise, reps, ROM, stability, tempo, angles, mistakes, injury risk | `/physique/v1/analysis/exercise` |
| AI Physique Analyzer | 3 | posing photos/videos | symmetry, balance, ratios, conditioning, weak/strong parts, posing quality, delta vs prior week | `/physique/v1/analysis/physique` |
| AI Progress Engine | 3 | athlete timeline | plateau/trend/consistency/adherence detection + forecast | `/physique/v1/progress/{athlete_id}` |
| AI Recovery Engine | 2→3 | sleep, fatigue, training load | recovery score, readiness, deload/rest/volume recs | `/physique/v1/recovery/{athlete_id}` |

All modules persist outputs to `physique_ai_reports` (typed `report_kind`) so coach review and audit are first-class.

---

## 6. Video Intelligence Pipeline (Phase 2)

Reuses Ada2AI's `vision_core`. Ada2Physique adds bodybuilding-specific biomechanics rules.

```
Upload (signed URL → physique-videos bucket)
  ↓ FFmpeg frame extraction
  ↓ YOLO11 (person/barbell/equipment detection)
  ↓ MediaPipe Pose (33-landmark skeleton)
  ↓ Biomechanics Engine (backend/physique/biomechanics) — exercise rules
  ↓ Exercise Detection (match against 15 supported movements)
  ↓ Movement Quality scoring (ROM/stability/tempo/angles)
  ↓ AI Report (persisted to physique_ai_reports + coach review queue)
```

### Supported exercises (dedicated movement rules each)
Squat · Bench Press · Deadlift · Shoulder Press · Pull-up · Lat Pulldown · Cable Row · Biceps Curl · Triceps Pushdown · Leg Press · Hack Squat · Lateral Raise · Romanian Deadlift · Hip Thrust · Walking Lunges.

Each rule defines: setup pose, concentric/eccentric joint-angle thresholds, tempo windows, stability heuristics, common mistake signatures, injury-risk flags.

---

## 7. Security & Compliance

- **RLS enabled on every `physique_*` table.** Athletes see only their own data; coaches see only their assigned athletes; admins see all (via service_role / policy).
- **No public buckets.** `physique-videos` and `physique-photos` are private; access via signed upload/download URLs with short TTL.
- **Role-based permissions** enforced at Postgres (RLS) **and** API (FastAPI dependency).
- **Audit logging** via `physique_audit_log` (append-only, service_role insert).
- **Secure API design:** Zod/Pydantic validation, typed responses, rate limiting, no raw SQL from client.
- **Production monitoring:** structured logging (reuse `backend/structured_logging.py`), health endpoint, error tracking.
- **Signed URLs** for all media; never expose service_role key to the client.

---

## 8. UX System

Premium · Minimal · Dark · Luxury-sports branding · Apple-quality motion · Fast · Responsive · Mobile-first.

Reuses Ada2AI design tokens (`BRAND.md`/`DESIGN.md`):
- Primary Teal `#00DCC8`, Deep Ocean `#007ABA`, Navy Abyss `#000A0F` (main BG), Pure Tech `#EEEFEE` (text)
- Surfaces `#0A1628` / cards `#0D1E35`; success `#10B981`, warning `#F59E0B`, error `#EF4444`
- Headlines: Orbitron 900/700 · Body/UI: Cairo 400/600 · Data: Orbitron/JetBrains Mono
- Gradients: primary `135deg #007ABA→#00DCC8`; accent `#00DCC8→#FFA500`; dark `#000A0F→#0A0E1A`

Ada2Physique tuning: a subtle **ember/amber accent** (`#FFA500`) for "intensity/PR" signals, keeping the teal identity as primary. Mobile-first layouts; bottom-tab nav for athletes; sidebar for coach/admin on desktop collapsing to tabs on mobile.

---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · Vite 5 · TailwindCSS · TanStack Query · React Router |
| Backend | FastAPI · Python 3.11 · Pydantic v2 · httpx |
| Data | Supabase (PostgreSQL + RLS + Auth + Storage) |
| AI | YOLO11 · MediaPipe Pose · OpenCV · Gemini Vision · FFmpeg · Claude/Ollama (text) |
| Deploy | Vercel (frontend) · Google Cloud Run + Docker (backend) · GitHub Actions (CI/CD) |

---

## 10. Schema Overview (namespaced `physique_*`)

Phase 1 tables (full DDL in `supabase/migrations/006_ada2physique_phase1.sql`):

| Table | Purpose | Owner (RLS) |
|---|---|---|
| `physique_athletes` | 1:1 bodybuilding profile per athlete | athlete (`auth.uid()`) |
| `physique_coaches` | 1:1 coach profile (marketplace-ready) | coach (`auth.uid()`) |
| `physique_coach_athletes` | coach↔athlete assignment (N:M) | coach; athlete sees own |
| `physique_exercise_library` | canonical exercises + movement-rule refs | public read; coach/admin write |
| `physique_programs` | training programs (template or assigned) | coach (creator); athlete sees assigned |
| `physique_program_days` | days within a program | via program |
| `physique_program_blocks` | exercise blocks (sets/reps/RPE/tempo) within a day | via program |
| `physique_nutrition_plans` | nutrition plans | coach (creator); athlete sees assigned |
| `physique_nutrition_targets` | daily calorie/macro/water targets per plan | via plan |
| `physique_assignments` | program/nutrition plan assignment to athlete | coach |
| `physique_check_ins` | weekly check-in records | athlete owns; assigned coach reads |
| `physique_measurements` | body measurements timeline | athlete |
| `physique_bodyweight` | body weight timeline | athlete |
| `physique_workout_logs` | completed workout sets (strength/volume/PRs) | athlete |
| `physique_sleep_logs` | sleep duration/quality | athlete |
| `physique_hydration_logs` | water intake | athlete |
| `physique_messages` | AI/athlete/coach chat thread | thread participants |
| `physique_ai_reports` | typed AI outputs (check-in/exercise/physique/progress/recovery) | athlete + assigned coach |

Phase 2–5 forward-compatible additions (later migrations): `physique_video_analyses`, `physique_physique_scores`, `physique_progress_forecasts`, `physique_recovery_scores`, `physique_marketplace_*`, `physique_orgs`.

All tables: `id uuid PK default gen_random_uuid()`, `created_at`/`updated_at` timestamptz default now(), `update_updated_at()` trigger reuse, indexes on hot paths, RLS enabled.

---

## 11. API Surface (Phase 1 — `/physique/v1`)

All endpoints require Supabase JWT; RBAC enforced. Implemented in `backend/physique/routers/`.

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/physique/v1/me` | any | current athlete/coach profile |
| POST | `/physique/v1/athletes` | athlete | onboard athlete profile |
| GET/POST/PUT | `/physique/v1/programs` | coach | manage programs |
| GET/POST | `/physique/v1/programs/{id}/days` `/blocks` | coach | program structure |
| POST | `/physique/v1/assignments` | coach | assign program/nutrition to athlete |
| GET | `/physique/v1/athletes/{id}/program` | athlete | active assigned program |
| GET/POST/PUT | `/physique/v1/nutrition/plans` | coach | manage nutrition plans |
| GET | `/physique/v1/athletes/{id}/nutrition` | athlete | active nutrition targets |
| POST | `/physique/v1/logs/bodyweight` `/measurements` `/workout` `/sleep` `/hydration` | athlete | log progress |
| GET | `/physique/v1/athletes/{id}/progress` | athlete/coach | progress dashboard data |
| GET/POST | `/physique/v1/checkins` | athlete | weekly check-ins |
| POST | `/physique/v1/coach/chat` | athlete | AI Coach chat (reuses ai-provider) |
| POST | `/physique/v1/nutrition/plan` | coach/athlete | AI Nutrition Coach |
| POST | `/physique/v1/programs/generate` | coach | AI Program Generator |
| POST | `/physique/v1/checkins/{id}/report` | system/coach | AI Check-In Agent |
| POST | `/physique/v1/uploads/sign` | any | signed upload URL for private bucket |
| GET | `/physique/v1/admin/stats` | admin | platform analytics |

---

## 12. Development Rules (binding)

1. Never use fake data. Frontend reads real Supabase rows; AI modules call real providers.
2. Never hardcode business logic — encode movement rules in `backend/physique/biomechanics`, nutrition logic in services, not UI.
3. Never duplicate Ada2AI infrastructure — reuse via shared services/APIs.
4. Every AI module exposes reusable versioned APIs.
5. Every component is production-ready (typed, validated, RLS-protected, error-handled).
6. Every feature has measurable business value (coaching-time saved or performance gained).
7. Build incrementally — Phase 1 first; schema/module boundaries forward-compatible.
8. Optimize for scalability, maintainability, and future AI expansion.
