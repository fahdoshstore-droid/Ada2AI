# Ada2Physique — AI Bodybuilding Intelligence Platform

> The **"Hudl + WHOOP + Coach + ChatGPT" for bodybuilding** — a production-grade SaaS
> where one coach scales to thousands of athletes through AI, preserving elite coaching
> quality. Built on top of **Ada2AI's shared infrastructure**; bodybuilding logic is
> isolated as independent, namespaced modules.

**Phase 1 — Coaching Platform** is implemented here. Full 5-phase blueprint:
[`docs/ADA2PHYSIQUE_ARCHITECTURE.md`](docs/ADA2PHYSIQUE_ARCHITECTURE.md).

---

## 1. What is built (Phase 1)

| Layer | Artifact | Status |
|---|---|---|
| Architecture | `docs/ADA2PHYSIQUE_ARCHITECTURE.md` — all 5 phases, API surface, schema, security | ✅ |
| Database | `supabase/migrations/006_ada2physique_phase1.sql` — 19 `physique_*` tables, 51 RLS policies, 2 SECURITY DEFINER helpers, private storage buckets, 15 seeded exercises | ✅ static-validated |
| Backend | `backend/physique/` — isolated FastAPI service (8 routers, AI provider reuse, biomechanics registry, JWT/RBAC, Docker) | ✅ imports + OpenAPI + smoke-tested |
| Frontend | `physique/` — React 19 + TypeScript + Vite + Tailwind v4, athlete/coach/admin dashboards, AI chat, progress charts, program generator | ✅ `tsc` + `vite build` green |

**No fake data.** Every dashboard reads real Supabase rows; every AI feature calls a real
provider through the backend. Screens are intentionally empty until the migration is applied
and users are onboarded — that is the expected, honest pre-migration state.

---

## 2. Topology & reuse map

Ada2Physique lives as **isolated modules inside the Ada2AI monorepo**, deployed independently
but reusing shared services. Bodybuilding logic is quarantined under the `physique_*`
namespace so it can never destabilize Ada2AI's talent-discovery product.

```
SHARED SERVICES (Ada2AI)        REUSE STRATEGY
  Supabase Auth + profiles .... share auth.users + profiles (additive user_type extension)
  Postgres + RLS .............. same project; new physique_* namespace, own RLS (zero overlap)
  Supabase Storage ............ new private buckets physique-videos / physique-photos
  ai-provider (Claude/Ollama) . backend/physique/ai_provider reuses env-based selection
  vision_core (YOLO11/MP) ..... Phase 2 layers biomechanics rules on top (not duplicated)
  Brand design system ......... tokens copied into physique/src/index.css (Tailwind v4)
  Vercel + GitHub Actions ..... new Vercel project from physique/ subfolder

NEW (isolated)
  physique/            frontend  -> Vercel (separate app)
  backend/physique/    backend   -> Google Cloud Run / Docker
```

| Concern | Ada2AI (existing) | Ada2Physique (new) |
|---|---|---|
| Roles | player, club, coach, scout, academy, parent | **athlete**, **admin** (added), coach reused |
| Tables | `unified_*`, `players`, … | `physique_*` (19 tables) |
| Storage | existing buckets | `physique-videos`, `physique-photos` (private) |

The **only** change to shared Ada2AI infrastructure is an additive, non-breaking extension of
`profiles.user_type` CHECK to include `'athlete'` and `'admin'` (coach already valid).

---

## 3. Repository layout

```
physique/                      # Frontend (Vercel app)
  src/
    lib/        supabase.ts · api.ts · types.ts
    hooks/      useAuth.tsx · useProfile.ts
    components/ Layout · ProtectedRoute · ui · LineChart
    pages/      Landing · Auth · Onboard
    pages/app/  AthleteDashboard · CoachDashboard · AdminDashboard
                CoachChat · Progress · Programs
  package.json · vite.config.ts · tsconfig.json · vercel.json · index.html
  public/favicon.svg · .env.example

backend/physique/              # Backend (Cloud Run / Docker)
  app.py · api.py · config.py · deps.py · schemas.py
  supabase_service.py · ai_provider.py · requirements.txt · Dockerfile
  routers/    me · coach · nutrition · programs · checkins · uploads · admin
  biomechanics/ registry.py (15 movement rules, Phase 2 hooks)

supabase/migrations/006_ada2physique_phase1.sql
docs/ADA2PHYSIQUE_ARCHITECTURE.md
ADA2PHYSIQUE_README.md          # this file
```

---

## 4. Prerequisites

- **Supabase project** `ujjmhqpyehymaavkawiv` (shared with Ada2AI) with `auth.users`,
  `public.profiles`, and the `handle_new_user()` signup trigger (from Ada2AI migrations).
- **Node 18+** and **npm** (this repo's root `node_modules` already has React 19, Vite 7,
  Tailwind v4, TanStack Query, TypeScript). The frontend symlinks `react-router-dom`,
  `react-router`, and `@remix-run/router` from `unified/node_modules`.
- **Python 3.11+** with `fastapi`, `uvicorn`, `pydantic>=2`, `supabase`, `httpx`, `PyJWT`.
- An AI provider key (Anthropic **or** Ollama **or** Gemini) for the AI endpoints.

> ⚠️ Frontend role routing is **English / LTR** (the product spec is English and the
> audience is international bodybuilding). The Ada2AI `unified/` app remains Arabic/RTL.

---

## 5. Database setup — apply migration 006

The migration is **idempotent** and **two-phase** (all tables first, then all policies) to
avoid forward-reference errors. It reuses Ada2AI's `update_updated_at()` trigger function
and `profiles` table — it does **not** recreate them.

**Option A — Supabase Studio SQL editor:** open the SQL editor on project
`ujjmhqpyehymaavkawiv`, paste `supabase/migrations/006_ada2physique_phase1.sql`, run.

**Option B — Supabase CLI:**
```bash
supabase db push            # if linked to the project
# or
supabase migration up
```

**Option C — psql:**
```bash
psql "postgresql://<user>:<pass>@db.ujjmhqpyehymaavkawiv.supabase.co:5432/postgres" \
  -f supabase/migrations/006_ada2physique_phase1.sql
```

What it creates:
- 19 `physique_*` tables (athletes, coaches, coach_athletes, exercise_library, programs,
  program_days, program_blocks, nutrition_plans, nutrition_targets, assignments, check_ins,
  measurements, bodyweight, workout_logs, sleep_logs, hydration_logs, messages, ai_reports,
  audit_log)
- 51 RLS policies + 2 `SECURITY DEFINER` helpers (`physique_is_admin`, `physique_is_assigned_coach`)
- Private storage buckets `physique-videos`, `physique-photos` + storage policies
- 15 seeded canonical exercises (CV-supported in Phase 2)
- Additive `profiles.user_type` CHECK extension (non-breaking)

Static validation performed: 207 statements, balanced parentheses, no invalid
`CREATE POLICY IF EXISTS` (Postgres lacks that syntax), FK dependency order verified.

---

## 6. Backend setup (`backend/physique/`)

### Environment variables
```bash
# Supabase (shared Ada2AI project)
SUPABASE_URL=https://ujjmhqpyehymaavkawiv.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # service-role for trusted enforcer + AI persistence
SUPABASE_JWT_SECRET=...            # local HS256 JWT verification (preferred over remote)

# AI providers (any one enables text AI; env-based selection reuses Ada2AI pattern)
ANTHROPIC_API_KEY=...              # optional
ANTHROPIC_MODEL=claude-sonnet-4-5-20250914
OLLAMA_BASE_URL=http://localhost:11434   # optional, local fallback
OLLAMA_TEXT_MODEL=qwen3:14b
GEMINI_API_KEY=...                 # optional (Phase 2 vision)

# Service
CORS_ORIGIN=https://your-physique.vercel.app
LOG_LEVEL=INFO
```

### Run locally
```bash
# from repo root — run as a module so relative imports resolve
cd backend
python -m uvicorn physique.app:app --host 0.0.0.0 --port 8080 --reload
# OpenAPI docs: http://localhost:8080/docs
# Health:       http://localhost:8080/physique/v1/health
```

### Run with Docker (Cloud Run ready)
Build context is `backend/` (the Dockerfile copies the `physique/` package):
```bash
docker build -f physique/Dockerfile -t ada2physique-backend .
docker run -p 8080:8080 --env-file .env ada2physique-backend
```

### API surface (Phase 1 — `/physique/v1`)
All endpoints require a Supabase JWT (Bearer); RBAC mirrors the database RLS.

| Method | Path | Role |
|---|---|---|
| GET | `/me` | any |
| POST | `/coach/chat` | athlete |
| POST | `/nutrition/plan` | coach/athlete |
| POST | `/programs/generate` | coach |
| POST | `/checkins/{id}/report` | coach/athlete |
| POST | `/uploads/sign` | any |
| GET | `/admin/stats` | admin |
| GET | `/health` | public |

The backend is the **trusted enforcer**: it verifies the JWT locally with
`SUPABASE_JWT_SECRET` (remote Supabase Auth fallback), resolves the role from `profiles`,
and role-gates every route — defense-in-depth on top of RLS.

---

## 7. Frontend setup (`physique/`)

### Environment
```bash
cp physique/.env.example physique/.env.local
# fill in:
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
#   VITE_PHYSIQUE_API_URL  (empty in dev -> Vite proxies /physique -> localhost:8080;
#                           for a remote backend set the FULL base incl. /physique/v1)
```

### Develop
```bash
cd physique
npm run dev        # http://localhost:5174 (proxies /physique -> :8080)
```

### Verify (no network required)
This dev environment keeps build tooling in the repo-root `node_modules`, so verify with
the root binaries (do **not** run `npm install` — no network):
```bash
cd physique
../node_modules/.bin/tsc --noEmit -p tsconfig.json   # type-check (strict)
../node_modules/.bin/vite build                       # production build
```
Both must exit green. Current build: **137 modules, ~143 kB gzip JS, ~5 kB gzip CSS**.
(`npm run build` — which is `tsc --noEmit && vite build` — works after a full
`npm install`, e.g. on Vercel / CI with network.)

### Deploy to Vercel
Create a **separate Vercel project** rooted at the `physique/` subfolder:
- **Root Directory:** `physique`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PHYSIQUE_API_URL`
  (set to the Cloud Run backend base, e.g.
  `https://ada2physique-backend-xxxx.run.app/physique/v1`)

`physique/vercel.json` provides SPA fallback (rewrites non-asset routes to `index.html`
and leaves `/physique/*` for the backend / serverless functions).

---

## 8. Roles & onboarding flow

| Role | How created | First screen |
|---|---|---|
| **Athlete** | Self-signup; `Auth.tsx` passes `options.data.user_type = "athlete"` → `handle_new_user` trigger sets `profiles.user_type` | `/onboard` (creates `physique_athletes` row) → `/app/athlete` |
| **Coach** | Self-signup with `user_type = "coach"` | `/onboard` (creates `physique_coaches` row) → `/app/coach` |
| **Admin** | **Provisioned server-side only** (service-role sets `profiles.user_type = 'admin'`) — no self-signup | `/app/admin` (no onboarding needed) |

After login, each role is routed to its dashboard (`roleHome`). Dashboards redirect
un-onboarded athletes/coaches to `/onboard`.

---

## 9. Security model

1. **Row Level Security** on every `physique_*` table — the primary enforcement layer.
   Athletes own their rows; coaches read/write assigned athletes; admins see all.
2. **Backend trusted enforcer** — JWT verified locally (HS256 with `SUPABASE_JWT_SECRET`,
   remote fallback), role resolved from `profiles`, every route role-gated. Service-role
   used only for AI persistence and admin aggregations.
3. **Signed uploads only** — `physique-videos` / `physique-photos` are **private** buckets;
   `/uploads/sign` issues signed upload URLs scoped to `<uid>/<uuid>.<ext>` (first folder =
   `auth.uid()` for storage RLS).
4. **Audit logging** — `physique_audit_log` table for sensitive actions.
5. **Admins cannot self-signup** — provisioned server-side only.

---

## 10. AI modules (Phase 1 implemented → Phase 2–5 planned)

| Module | Phase | Status | Endpoint |
|---|---|---|---|
| AI Coach chat | 1 | ✅ | `POST /coach/chat` |
| AI Nutrition Coach | 1 | ✅ | `POST /nutrition/plan` |
| AI Program Generator | 1 | ✅ | `POST /programs/generate` |
| AI Check-In Agent | 1 | ✅ | `POST /checkins/{id}/report` |
| AI Exercise Coach (CV) | 2 | planned | vision_core + `biomechanics/registry.py` (15 rules ready) |
| AI Physique Analyzer | 3 | planned | posing photo/video scoring |
| AI Progress Engine | 3 | planned | plateau/forecast detection |
| AI Recovery Engine | 3 | planned | readiness/deload |
| Coach Marketplace | 4 | planned | `physique_marketplace_*` |
| Enterprise Coach Platform | 5 | planned | `physique_orgs` |

The 15-exercise biomechanics registry (`backend/physique/biomechanics/registry.py`) and the
`is_cv_supported` flag on seeded exercises are forward-compatible hooks for Phase 2.

---

## 11. Development rules (binding)

1. Never use fake data. Frontend reads real Supabase rows; AI calls real providers.
2. Never hardcode business logic — movement rules live in `biomechanics`, nutrition/AI logic
   in backend services, never in UI.
3. Never duplicate Ada2AI infrastructure — reuse via shared services/APIs.
4. Every AI module exposes reusable, versioned APIs.
5. Every component is production-ready: typed (strict `tsconfig`), validated, RLS-protected,
   error-handled.
6. Every feature has measurable business value (coaching-time saved or performance gained).
7. Build incrementally — Phase 1 first; schema/module boundaries forward-compatible.

---

## 12. Quick verification (reproduce the green build)

```bash
# Backend smoke (imports + OpenAPI + auth gating)
python -c "from backend.physique.app import app; print(len(app.routes), 'routes')"
python -c "from fastapi.testclient import TestClient; from backend.physique.app import app; \
c=TestClient(app); assert c.get('/physique/v1/health').status_code==200; \
assert c.get('/physique/v1/me').status_code==401; print('backend ok')"

# Frontend type-check + build
cd physique
../node_modules/.bin/tsc --noEmit -p tsconfig.json && ../node_modules/.bin/vite build
```

---

## 13. Roadmap

- **Phase 1 — Coaching Platform** ✅ (this release): programs, nutrition, check-ins, AI chat,
  dashboards, RLS, signed uploads, admin analytics.
- **Phase 2 — AI Exercise Analysis:** video upload → frame extraction → YOLO11 → MediaPipe
  Pose → biomechanics engine → rep/ROM/tempo/technique/injury-risk report.
- **Phase 3 — AI Physique Intelligence:** symmetry, muscle balance, conditioning scoring,
  progress forecasting, recovery engine.
- **Phase 4 — Coach Marketplace:** public coach profiles, subscriptions, program/consultation
  sales, payments.
- **Phase 5 — Enterprise Coach Platform:** organizations, multi-coach teams, bulk analytics.

*Built on Ada2AI infrastructure. Classic Physique expertise, scaled by AI.*
