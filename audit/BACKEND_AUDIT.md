# BACKEND AUDIT — Ada2AI

**Date:** 2026-06-10 | **Auditor:** صانع | **Mode:** OBSERVATION ONLY

---

## 1. Architecture Overview

```
backend/
├── main.py                  (535 lines) FastAPI v3.0 — 22+ routes
├── yolo_analyzer.py         (88 lines)  DEPRECATED shim
├── player_tracker.py        (232 lines) LEGACY — supplanted by vision_core/tracker
├── video_processor.py       (139 lines) Utility — not used by VisionPipeline
├── sportid_routes.py        (539 lines) SQLite CRUD for SportID
├── test_api.py              (80 lines)  Manual test script
├── db/
│   ├── __init__.py          (1 line)    Empty stub
│   ├── supabase_client.py   (15 lines) HARDCODED SECRETS 🚨
│   └── setup_supabase.py    (112 lines) Seed script + HARDCODED SECRETS 🚨
├── vision_core/             (8 files)  ✅ Production-ready
├── intelligence/            (14 files) ✅ Production-ready
├── copilot/                 (3 files)  ✅ Near-production
├── feedback/                (2 files)  ✅ Production-ready
├── human_validation/        (2 files)  ✅ Production-ready
├── validation/              (2 files)  ✅ Production-ready (not wired to routes)
└── content-pipeline/        (3 files)  Standalone CLI — not integrated
```

**Total:** 9,356 lines Python | 45 source files | Real:Stub ratio = 95.5%

---

## 2. FastAPI Application (main.py)

### Middleware
- CORS: `localhost:3000`, `localhost:3001` + `FRONTEND_URL` env var
- NO auth middleware — all endpoints are unprotected
- NO rate limiting
- NO request validation middleware

### Startup
- Uses `@app.on_event("startup")` — **DEPRECATED** in FastAPI (should use lifespan)
- Pre-warms VisionPipeline (YOLO model load)
- Creates SportID SQLite DB

### Critical Access Patterns
- `pipeline._results_cache` — private attribute access (fragile)
- `pipeline._signature_cache` — private attribute access (fragile)
- `pipeline._dna_profiles_cache` — private attribute access (fragile)

---

## 3. Service Boundaries

| Module | Lines | Status | Storage | Issues |
|--------|-------|--------|---------|--------|
| main.py | 535 | Real | In-memory | Deprecated startup, private access |
| vision_core/ | ~1,700 | Real | In-memory | None — clean module |
| intelligence/ | ~3,400 | Real | JSON files | ontology loader has inline data |
| copilot/ | ~950 | Real | In-memory | 1 TODO, duplicate club maps |
| feedback/ | ~190 | Real | JSON | None |
| human_validation/ | ~240 | Real | JSON | None |
| validation/ | ~340 | Real | JSON | Not wired to any route |
| sportid_routes | 539 | Real | SQLite | Clean CRUD |
| db/ | 128 | Mixed | — | 🚨 Hardcoded secrets |

---

## 4. Blocking Operations

| Location | Operation | Risk |
|----------|-----------|------|
| main.py startup | YOLO model load | Blocking — delays startup |
| main.py /analyze/* | Video processing | Blocking sync — no background tasks |
| vision_core/pipeline.py | Frame-by-frame processing | CPU-bound — blocks event loop |
| content-pipeline/orchestrator.py | `asyncio.run()` inline | Event loop conflict risk |

**No Celery/Redis workers active** — despite docker-compose.yml defining them.

---

## 5. Memory Handling

| Concern | Details |
|---------|---------|
| Video frames | `VideoProcessor` reads entire video into memory — no streaming |
| Results cache | `pipeline._results_cache` — unbounded dict, no eviction |
| DNA profiles cache | `pipeline._dna_profiles_cache` — unbounded dict |
| Signature cache | `pipeline._signature_cache` — unbounded dict |
| JSON stores | Feedback, human_validation, memory, validation — capped at 50-100 entries |
| Detection results | `Detection` objects per frame — accumulate during analysis |

**Risk:** A single long video analysis could consume significant RAM with no backpressure.

---

## 6. Async Behavior

- **FastAPI declared async** but **almost all handlers are synchronous**
- Video upload → sync `pipeline.analyze_video()` blocks the event loop
- No `BackgroundTasks` usage for long-running analysis
- `content-pipeline/orchestrator.py` calls `asyncio.run()` within already-async context — **event loop conflict**

---

## 7. Duplicate Systems

| System A | System B | Relationship |
|----------|----------|--------------|
| `player_tracker.py` (IoU) | `vision_core/tracker.py` (ByteTrack) | A is legacy, B is active |
| `yolo_analyzer.py` | `vision_core/pipeline.py` | A is deprecated shim wrapping B |
| `video_processor.py` | `vision_core/pipeline.py` | A not used by B — unclear if used anywhere |
| `db/supabase_client.py` | `sportid_routes.py` (SQLite) | Two separate data stores |
| Copilot V1 | Copilot V2 | V2 supersedes V1 — V1 still imported & used |
| `ontology/loader.py` (hardcoded) | `ontology/football_ontology.yaml` | YAML exists but loader reads from hardcoded Python dicts |

---

## 8. Critical Security Issues

### 🚨 CRITICAL: Hardcoded Supabase Secrets
- `db/supabase_client.py` — production URL + API key in source
- `db/setup_supabase.py` — production URL + API key in source
- These are committed to git history

### No Authentication
- 22+ API endpoints — zero auth checks
- Anyone who can reach the server can upload videos, run analysis, modify feedback

### No Input Validation
- Video upload endpoints accept any file — no size/type limits
- No path traversal protection outside sportid_routes (SEC-06)
- No rate limiting on expensive analysis endpoints

---

## 9. Summary Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Code Quality | 8/10 | Clean, well-structured, Arabic-first |
| Architecture | 7/10 | Good modularity, some legacy overlap |
| Security | 3/10 | Hardcoded secrets, no auth, no rate limiting |
| Async Correctness | 4/10 | Sync handlers blocking event loop |
| Memory Safety | 5/10 | Unbounded caches, no backpressure |
| Test Coverage | 2/10 | Only manual test script, no automated tests |
| Observability | 3/10 | print() logging, no structured logging, no metrics |