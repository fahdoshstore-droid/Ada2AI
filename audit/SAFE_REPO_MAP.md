# SAFE REPO MAP — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY

---

## Repository Root: ~/Ada2AI

### Major Directories

- `client/` — React 19 + Vite 7 + Tailwind 4 SPA (247 files)
- `backend/` — FastAPI + YOLO11n + Intelligence (66 source files, ~7500 lines)
- `server/` — tRPC server + AI agents + RAG (56 files)
- `sportid-passport/` — Next.js SportID Passport (51 files)
- `unified/` — Unified auth/dashboard SPA (35 files)
- `adapter/` — Express API adapter (23 files)
- `content-pipeline/` — YOLO model + media output (22 files)
- `supabase/` — Migrations + config (17 files)
- `api/` — Vercel serverless functions (11 files)
- `audit/` — Existing audit reports (11 files)
- `docs/` — Architecture + deployment docs (20 files)

### Backend Structure

```
backend/
├── main.py (573 lines) — FastAPI v3.0, 39 routes
├── vision_core/ (8 files, 1701 lines) — YOLO11n + ByteTrack + Pose + Events
├── intelligence/ (13+ files, 3011 lines) — 9 engines + Bridge
│   ├── bridge.py (390 lines) — THE connection: Vision → Intelligence
│   ├── ontology/ — football_ontology.yaml v1.1
│   ├── roles/ — RoleProfileEngine + PlayerEventSignature
│   ├── dna/ — PlayerDNAEngine (8 traits)
│   ├── similarity/ — SimilarityEngine (cosine)
│   ├── recommendation/ — ScoutRecommendationEngine
│   ├── club_identity/ — ClubIdentityEngine (5 Saudi clubs)
│   ├── temporal/ — TemporalProfileEngine
│   ├── timeline/ — MatchTimelineEngine
│   ├── memory/ — IntelligenceMemory
│   └── explainability/ — ExplainabilityEngine (6 types)
├── copilot/ (2 files, 946 lines) — ScoutCopilot V1 + V2 (Arabic)
├── validation/ — ValidationRunner (339 lines)
├── human_validation/ — HumanValidationStore (242 lines)
├── feedback/ — FeedbackStore (188 lines)
├── db/ — Supabase client (15 + 112 lines)
├── yolo_analyzer.py — DEPRECATED
├── player_tracker.py — Possibly abandoned
└── video_processor.py — Possibly abandoned
```

### Environment Files (18 found)

- `.env`, `.env.backup`, `.env.vercel` — HIGH RISK (may contain live keys)
- `client/.env`, `.env.local`, `.env.prod`, `.env.prod_pulled` — HIGH RISK
- `.env.example`, `client/.env.example`, `backend/.env.example` — SAFE (templates)

### Deployment Configs

- 5× `vercel.json` + `project.json` (Vercel deployments)
- `backend/Dockerfile` + `Dockerfile.celery` + `docker-compose.yml`
- `backend/nginx.conf`, `ecosystem.config.cjs` (PM2)

### Hardcoded Secrets

- `backend/db/supabase_client.py` — URL + anon key hardcoded as fallback
- `backend/db/setup_supabase.py` — URL + anon key hardcoded (no env fallback)

### IntelligenceBridge Connection Map

```
IntelligenceBridge (390 lines)
├── Imports: 9 engines (role, dna, similarity, recommendation, club_identity, temporal, timeline, explainability, memory)
└── Used by: main.py → 10 endpoints + /analyze/full enrichment
```