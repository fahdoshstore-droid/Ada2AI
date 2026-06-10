# BACKEND SAFE STATUS — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY — NO files modified

---

## FastAPI Startup Verification

- ✅ `main.py` parses OK (AST validated)
- ✅ FastAPI app created successfully: **39 routes**
- ✅ All critical imports succeed: VisionPipeline, IntelligenceBridge, 9 intelligence engines, Copilot V1+V2
- ✅ VisionConfig auto-detects `device=mps` on Apple Silicon
- ⚠️ Supabase client connects but `get_supabase` function name inconsistent with import
- ⚠️ cv2/av library class conflict (AVFFrameReceiver duplicate) — non-fatal but noisy

---

## Route Registration (26 direct routes + sportid sub-router)

### Vision/Analysis
| Method | Path | Status |
|---|---|---|
| GET | `/` | ✅ health |
| GET | `/health` | ✅ health |
| POST | `/analyze/single` | ✅ single frame |
| POST | `/analyze/team` | ✅ team analysis |
| POST | `/detect/frame` | ✅ detection only |
| POST | `/analyze/full` | ✅ full pipeline + bridge enrich |
| GET | `/config` | ✅ vision config |

### Intelligence
| Method | Path | Status |
|---|---|---|
| GET | `/intelligence/ontology` | ✅ |
| GET | `/intelligence/ontology/roles` | ✅ |
| GET | `/intelligence/ontology/concepts` | ✅ |
| GET | `/intelligence/ontology/events` | ✅ |
| POST | `/intelligence/roles/evaluate/{track_id}` | ✅ via bridge |
| GET | `/intelligence/dna` | ✅ via bridge |
| POST | `/intelligence/similarity` | ✅ via bridge |
| POST | `/intelligence/recommend` | ✅ via bridge (club_fit fix) |
| POST | `/intelligence/copilot` | ✅ via bridge |
| GET | `/intelligence/temporal/{player_id}` | ✅ via bridge |
| GET | `/intelligence/timeline` | ✅ via bridge |
| POST | `/intelligence/explain` | ✅ via bridge |
| GET | `/intelligence/status` | ✅ bridge status |

### Feedback
| Method | Path | Status |
|---|---|---|
| POST | `/intelligence/feedback/note` | ✅ |
| POST | `/intelligence/feedback/verdict` | ✅ |
| POST | `/intelligence/feedback/correction` | ✅ |
| GET | `/intelligence/feedback/insights` | ✅ |
| GET | `/intelligence/feedback/player/{player_id}` | ✅ |

### Graph/Schema
| Method | Path | Status |
|---|---|---|
| GET | `/intelligence/graph/schema` | ✅ |

---

## Critical Dependencies

| Module | Import Status | Notes |
|---|---|---|
| vision_core | ✅ | YOLO11n + ByteTrack + MPS |
| intelligence.bridge | ✅ | 390 lines, 9 engine connections |
| intelligence.ontology | ✅ | 8 roles, 16 concepts |
| intelligence.roles | ✅ | RoleProfileEngine |
| intelligence.dna | ✅ | PlayerDNAEngine (8 traits) |
| intelligence.similarity | ✅ | SimilarityEngine |
| intelligence.recommendation | ✅ | ScoutRecommendationEngine |
| intelligence.club_identity | ✅ | ClubIdentityEngine (5 clubs) |
| intelligence.temporal | ✅ | TemporalProfileEngine |
| intelligence.timeline | ✅ | MatchTimelineEngine |
| intelligence.explainability | ✅ | 6 explain types |
| intelligence.memory | ✅ | IntelligenceMemory |
| copilot | ✅ | V1 + V2 |
| validation | ✅ | ValidationRunner |
| human_validation | ✅ | HumanValidationStore |
| feedback | ✅ | FeedbackStore |
| db.supabase_client | ⚠️ | Connects but function name mismatch |

---

## Runtime Concerns

1. **No authentication on ANY endpoint** — all 39 routes are open
2. **SportID sub-router** (539 lines) mounts additional routes — not audited in this pass
3. **cv2/av library conflict** — duplicate class implementations may cause crashes on video processing
4. **Model file location** — `yolo11n.pt` at `~/Ada2AI/content-pipeline/` not `~/Ada2AI/backend/content-pipeline/`
5. **No CORS configuration visible** in main.py — may block frontend requests
6. **No rate limiting** on upload endpoints — abuse risk
7. **File upload** saves to `/tmp` without size validation or cleanup

---

## Deprecated/Abandoned Files

| File | Status |
|---|---|
| `yolo_analyzer.py` (88 lines) | DEPRECATED — explicitly marked |
| `test_api.py` (91 lines) | STALE — imports from deprecated yolo_analyzer |
| `player_tracker.py` (232 lines) | Possibly replaced by vision_core/tracker.py |
| `video_processor.py` (139 lines) | Pre-vision_core, unclear if used |
| `server.log` | Runtime artifact in repo |
| `sportid.db` | SQLite DB committed to repo |
| `test_frame.jpg` | Test image committed to repo |

---

## Async Behavior

- Endpoints using `async def` — correct for FastAPI
- VisionPipeline.analyze_video is **synchronous** (YOLO inference is CPU/GPU-bound)
- No background task queue for long-running analysis
- `/analyze/full` could block on large videos — no timeout configured