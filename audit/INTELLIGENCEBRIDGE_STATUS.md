# INTELLIGENCEBRIDGE STATUS — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY — verified with live Python test

---

## Bridge File: `backend/intelligence/bridge.py` (390 lines)

---

## Data Flow Verification — End-to-End

### Stage 1: Video → Detection
| Item | Source | Status |
|---|---|---|
| Model | YOLO11n (`~/Ada2AI/content-pipeline/yolo11n.pt`) | ✅ exists |
| Device | MPS (Apple Silicon auto-detect) | ✅ |
| Detection | SportsDetector → bounding boxes + classes | ✅ |
| Class | SPORTS_BALL=32 (COCO) | ✅ corrected from 37 |

### Stage 2: Detection → Tracking
| Item | Source | Status |
|---|---|---|
| Tracker | ByteTrack (iou+motion) | ✅ replaced IoU-only |
| Output | `{track_id: {total_distance, avg_speed, max_speed, team, frames_visible}}` | ✅ |

### Stage 3: Tracking → Events
| Item | Source | Status |
|---|---|---|
| Extractor | EventExtractor | ✅ |
| Event types | pass, sprint, shot, pressure, transition, dribble, possession, sprint_press, recovery_run, line_breaking_pass, progressive_pass | ✅ |
| Output | `list[dict]` with event_type + actors + metadata | ✅ |

### Stage 4: Events → Signatures
| Item | Source | Status |
|---|---|---|
| Bridge.enrich() | Builds PlayerEventSignature from tracking+events | ✅ VERIFIED |
| Signature fields | pass_count, progressive_passes, line_breaking_passes, sprint_count, transition_count, sprint_presses, recovery_runs, total_distance_meters, average_speed_mps, max_speed_mps, frames_visible, team_id | ✅ all populated |

**Test evidence (player 7):**
- pass_count=1, line_breaking_passes=1, sprint_count=1, transition_count=1, sprint_presses=1 ✅

### Stage 5: Signatures → DNA
| Item | Source | Status |
|---|---|---|
| PlayerDNAEngine.generate_profile() | Takes PlayerEventSignature → PlayerDNAProfile | ✅ |
| DNA traits (8) | transition_threat, progressive_play, pressing_intensity, ball_retention, tempo_control, spatial_presence, recovery_capacity, directness | ✅ |

**Test evidence (player 7): traits dict with 8 keys, all > 0**

### Stage 6: DNA → Recommendation
| Item | Source | Status |
|---|---|---|
| SimilarityEngine.find_similar() | cosine similarity on DNA traits | ✅ |
| ScoutRecommendationEngine.recommend() | contextual fit for club identity | ✅ |
| ClubIdentityEngine | 5 Saudi clubs with style_weights | ✅ FIXED (was empty `{}`) |

**Test evidence: club_fit_confidence=0.3 returned (non-zero = real calculation)**

### Stage 7: Recommendation → Copilot
| Item | Source | Status |
|---|---|---|
| ScoutCopilotV2 | 9/9 Arabic intent patterns | ✅ |
| Data source | bridge.get_all_signatures() + bridge.get_dna() | ✅ via bridge |

---

## Mock/Synthetic Data — ZERO DETECTED

✅ Bridge.enrich() only operates on data passed from VisionPipeline
✅ All signatures built from real tracking metrics + events
✅ DNA profiles computed from signatures — no hardcoded vectors
✅ ClubIdentityEngine returns real style weights (not empty dict)
✅ Copilot reads from bridge signatures — no mock player arrays

---

## Cold Start Behavior

When NO video has been analyzed:
- `bridge.has_data()` → False ✅
- All intelligence endpoints return "no data" — not fake data ✅
- Copilot receives empty signature dict → graceful fallback ✅

---

## Verified Test Results (10/10 stages)

| # | Stage | Result |
|---|---|---|
| 1 | Pre-enrich empty | ✅ |
| 2 | Enrich with 3 players + 10 events | ✅ |
| 3 | Signatures built with real distance | ✅ |
| 4 | Event counts match input | ✅ |
| 5 | Role evaluation works | ✅ |
| 6 | Similarity works (2 results) | ✅ |
| 7 | Recommendation with club identity | ✅ |
| 8 | Temporal profile exists | ✅ |
| 9 | Explainability output | ✅ |
| 10 | Status consistent | ✅ |

---

## Residual Risks

1. **Bridge is singleton** — only one video's data at a time. Sequential analyses overwrite.
2. **No persistence** — bridge data is in-memory only. Server restart = all intelligence lost.
3. **Enrichment only via /analyze/full** — other analyze endpoints (single, team) don't enrich bridge.
4. **ClubIdentityEngine** has only 5 clubs hardcoded — clubs not in ontology get default weights.