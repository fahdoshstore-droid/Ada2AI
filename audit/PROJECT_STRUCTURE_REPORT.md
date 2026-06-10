# PROJECT STRUCTURE REPORT — Ada2AI

**Date:** 2026-06-10 | **Auditor:** صانé | **Mode:** OBSERVATION ONLY

---

## Directory Map

```
~/Ada2AI/
├── audit/                              ← NEW: This audit (8 reports)
├── backend/
│   ├── main.py                         (535L) FastAPI v3.0 — 22+ routes
│   ├── yolo_analyzer.py                (88L)  DEPRECATED shim
│   ├── player_tracker.py              (232L)  LEGACY — IoU tracker (supplanted)
│   ├── video_processor.py             (139L)  Utility (not used by pipeline)
│   ├── sportid_routes.py              (539L)  SQLite CRUD
│   ├── test_api.py                     (80L)  Manual tests
│   ├── yolo11n.pt                      (5.4MB) Production model ✅
│   ├── yolov8n.pt                      (6.2MB) Legacy model ⚠️
│   ├── sportid.db                      (56KB)  SQLite DB
│   ├── db/
│   │   ├── __init__.py                 (1L)    Empty stub
│   │   ├── supabase_client.py          (15L)   🚨 HARDCODED SECRETS
│   │   └── setup_supabase.py          (112L)  Seed + 🚨 HARDCODED SECRETS
│   ├── vision_core/                    (8 files, ~1,700L) ✅ Production-ready
│   │   ├── __init__.py                (3L)
│   │   ├── config.py                  (~120L) VisionConfig, COCOClasses
│   │   ├── detector.py                (~250L) VisionDetector + YOLO11n
│   │   ├── tracker.py                 (~280L) VisionTracker + ByteTrack
│   │   ├── pose.py                    (~270L) PoseAnalyzer (disabled by default)
│   │   ├── events.py                  (~360L) EventDetector (10 event types)
│   │   ├── graph.py                   (~290L) TacticalGraph
│   │   └── pipeline.py                (~400L) VisionPipeline orchestrator
│   ├── intelligence/                   (14 files, ~3,400L) ✅ Production-ready
│   │   ├── __init__.py                (24L)   All engine exports
│   │   ├── schemas.py                 (~280L) Graph-ready dataclasses
│   │   ├── explainability.py          (~350L) Evidence+confidence layer
│   │   ├── talent_graph.py            (~293L) Graph foundations
│   │   ├── ontology/
│   │   │   ├── __init__.py            (3L)
│   │   │   ├── loader.py              (~230L) FootballOntology (inline data)
│   │   │   └── football_ontology.yaml (365L) v1.1 — NOT loaded by Python
│   │   ├── roles/
│   │   │   ├── __init__.py            (3L)
│   │   │   └── role_engine.py         (~255L) RoleProfileEngine
│   │   ├── dna/
│   │   │   ├── __init__.py            (3L)
│   │   │   └── dna_engine.py          (~231L) PlayerDNAEngine
│   │   ├── similarity/
│   │   │   ├── __init__.py            (3L)
│   │   │   └── similarity_engine.py   (~192L) SimilarityEngine
│   │   ├── recommendation/
│   │   │   ├── __init__.py            (3L)
│   │   │   └── scout_engine.py        (~172L) ScoutRecommendationEngine
│   │   ├── temporal/
│   │   │   ├── __init__.py            (3L)
│   │   │   └── temporal_engine.py     (~216L) TemporalProfileEngine
│   │   ├── timeline/
│   │   │   ├── __init__.py            (3L)
│   │   │   └── timeline_engine.py     (~348L) MatchTimelineEngine
│   │   ├── club_identity/
│   │   │   ├── __init__.py            (3L)
│   │   │   └── club_engine.py         (~237L) ClubIdentityEngine
│   │   └── memory/
│   │       ├── __init__.py            (3L)
│   │       └── memory_engine.py       (~252L) IntelligenceMemory
│   ├── copilot/
│   │   ├── __init__.py                (4L)    V1 + V2 exports
│   │   ├── scout_copilot.py           (~352L) V1 — superseded
│   │   └── scout_copilot_v2.py        (~594L) V2 — 9 intents
│   ├── feedback/
│   │   ├── __init__.py                (3L)
│   │   └── feedback_store.py          (~188L) FeedbackStore
│   ├── human_validation/
│   │   ├── __init__.py                (4L)
│   │   └── store.py                   (~241L) HumanValidationStore
│   └── validation/
│       ├── __init__.py                (4L)
│       └── runner.py                  (~338L) ValidationRunner (no route)
├── content-pipeline/                  (3 files, ~1,308L) Standalone CLI — not integrated
│   ├── __init__.py                    (0L)    Empty
│   ├── yolo_pipeline.py               (~433L) Content detection + VTrim
│   └── orchestrator.py                (~875L) Full content pipeline
├── client/                            React 19 + TypeScript + Vite 7
│   ├── src/
│   │   ├── App.tsx                    (255L) 40+ routes
│   │   ├── main.tsx                   (~35L)
│   │   ├── index.css                  (20KL) Global styles
│   │   ├── contexts/                  (4 files) Auth, DemoAuth(dead), Language, Notification
│   │   ├── lib/                       supabase.ts, trpc.ts(dead), sentry.ts, posthog.ts
│   │   ├── types/                     profiles.ts (duplicate of supabase.ts types)
│   │   ├── hooks/                     8 custom hooks
│   │   ├── components/                ErrorBoundary, Navbar, DashboardLayout, etc.
│   │   └── pages/                     30+ page components
│   └── public/                        Static assets
├── supabase/                          config.toml
├── .env / .env.backup / .env.example  Environment files
├── CLAUDE.md / DEPLOY_NOTES.md        Documentation
└── requirements.txt / package.json    Dependencies
```

---

## Module Responsibilities

| Module | Responsibility | Lines | Real Logic |
|--------|---------------|-------|------------|
| vision_core | Video → detection → tracking → events → graph | ~1,700 | 100% |
| intelligence | Tactical analysis, DNA, roles, similarity, timeline | ~3,400 | 100% |
| copilot | Arabic football reasoning | ~950 | 95% (1 TODO) |
| feedback | Scout judgment capture | ~190 | 100% |
| human_validation | Expert review sessions | ~240 | 100% |
| validation | Pipeline stress testing | ~340 | 100% |
| content-pipeline | Social media content generation | ~1,308 | 100% (standalone) |
| sportid_routes | Player/match CRUD (SQLite) | ~539 | 100% |
| db | Supabase connection | ~128 | 50% (secrets issue) |
| client | Frontend UI (React) | ~12,000+ | 75% (mock data, broken APIs) |

---

## Dead Code Candidates

| File | Reason | Safe to Remove? |
|------|--------|-----------------|
| `backend/player_tracker.py` | Supplanted by vision_core/tracker.py (ByteTrack) | ✅ Yes |
| `backend/video_processor.py` | Not used by VisionPipeline | ⚠️ Verify no other usage |
| `backend/yolo_analyzer.py` | Explicitly DEPRECATED | ✅ Yes (after updating imports) |
| `backend/yolov8n.pt` | Legacy model, project uses yolo11n.pt | ✅ Yes |
| `backend/db/__init__.py` | 1-line empty | ✅ Yes |
| `client/src/contexts/DemoAuthContext.tsx` | Dead code — not wired to App.tsx | ✅ Yes |
| `client/src/lib/trpc.ts` | Barely used — 4 lines | ⚠️ Verify no usage |
| `content-pipeline/yolo11n.pt` | Duplicate of backend/ copy | ✅ Yes |
| `content-pipeline/__init__.py` | 0-byte empty file | ✅ Yes |

---

## Duplicate Systems

| Duplication | Files | Resolution |
|-------------|-------|------------|
| YOLO model file x2 | backend/yolo11n.pt + content-pipeline/yolo11n.pt | Keep backend/, remove content-pipeline/ |
| Tracker x2 | player_tracker.py (IoU) + vision_core/tracker.py (ByteTrack) | Remove legacy |
| Analysis wrapper | yolo_analyzer.py + vision_core/pipeline.py | Remove deprecated shim |
| UserType definition | lib/supabase.ts + types/profiles.ts | Consolidate to one |
| Club name→ID map | scout_copilot_v2.py lines 517 + 560 | Extract to shared constant |
| Ontology data | football_ontology.yaml + loader.py inline dicts | Load from YAML |

---

## Abandoned Experiments

| Experiment | Evidence | Status |
|-----------|----------|--------|
| Legacy IoU tracker | player_tracker.py — supplanted by ByteTrack | Dead — remove |
| YOLOv8 model | yolov8n.pt — project uses YOLO11n | Dead — remove |
| DemoAuthContext | Not wired to App.tsx | Dead — remove |
| tRPC integration | lib/trpc.ts — 4 lines, unused | Dead — remove or commit |
| Docker Compose (Celery+Redis) | docker-compose.yml defines workers — none running | Premature — implement or remove |
| Nafath integration | /features/nafath route exists | Unclear if active |