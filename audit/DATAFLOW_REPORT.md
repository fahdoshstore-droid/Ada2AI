# DATA FLOW AUDIT — Ada2AI

**Date:** 2026-06-10 | **Auditor:** صانع | **Mode:** OBSERVATION ONLY

---

## Complete Data Flow

```
Step 1: Video Upload
   Frontend (YOLOAnalysis / VideoUpload) → FormData POST → /analyze/full
   ⚠️ 3 pages use WRONG base URL (relative fetch → 404)
   ⚠️ No file size validation
   ⚠️ No upload progress (frontend simulates)

Step 2: Frame Extraction
   vision_core/pipeline.py → cv2.VideoCapture → frames[0..N]
   ⚠️ ALL frames loaded into memory — no streaming
   ⚠️ No memory backpressure for long videos
   ✅ Device auto-detection: MPS → CUDA → CPU

Step 3: Detection
   vision_core/detector.py → YOLO11n → Detection[]
   ✅ Real model inference
   ✅ Class filtering: PERSON(0), SPORTS_BALL(32)
   ⚠️ No confidence threshold adjustment per frame

Step 4: Tracking
   vision_core/tracker.py → ByteTrack → TrackInfo[]
   ✅ Real ByteTrack algorithm
   ✅ Ball trajectory tracking
   ⚠️ No identity switch detection/recovery

Step 5: Pose (Optional — disabled by default)
   vision_core/pose.py → YOLO-pose → 17 keypoints
   ⚠️ Disabled in default config — never runs in production

Step 6: Event Extraction
   vision_core/events.py → EventDetector → Events[]
   ✅ 10 event types detected heuristically
   ✅ Arabic labels in output
   ⚠️ Threshold-based — not ML-learned
   ⚠️ No confidence score on individual events

Step 7: Tactical Graph
   vision_core/graph.py → TacticalGraph → Nodes+Edges
   ✅ Player/event relationships built
   ✅ Graph-ready structure
   ⚠️ Not used by intelligence layer downstream

Step 8: 🔴 GAP — Intelligence Layer Input
   Intelligence engines operate on INDEPENDENT demo data
   NOT on real Vision Pipeline output
   main.py provides results from pipeline._results_cache
   BUT intelligence endpoints accept manual request bodies
   
   THIS IS THE CRITICAL MISSING BRIDGE:
   Vision output → Intelligence input is NOT automated

Step 9: Intelligence Processing
   ┌─ RoleProfileEngine: signature → role_fits[]     ✅ Real math
   ├─ PlayerDNAEngine: events → 8-dim DNA vector     ✅ Real math
   ├─ SimilarityEngine: DNA vectors → cosine sim      ✅ Real math
   ├─ ScoutRecommendation: role_fit + system_fit       ⚠️ 40% dead (style_weights={})
   ├─ TemporalProfileEngine: snapshots → trends        ✅ Real math
   ├─ MatchTimelineEngine: events → phases + narrative ✅ Real logic
   ├─ ClubIdentityEngine: club vector → fit score     ✅ Real math
   └─ ExplainabilityEngine: all → Arabic evidence       ✅ Real logic

Step 10: Copilot Reasoning
   ScoutCopilotV2: query → regex match → engine dispatch → Arabic response
   ✅ 9 intent types
   ✅ Cross-engine evidence accumulation
   ⚠️ Template-based, not generative

Step 11: Feedback Loop
   HumanValidationStore → JSON file
   FeedbackStore → JSON file
   ⚠️ Corrections stored BUT never fed back to engine weights
   ⚠️ No model retraining pipeline

Step 12: Frontend Rendering
   ScoutIntelligence.tsx → 6 tabs of intelligence data
   YOLOAnalysis.tsx → detection/tracking results
   ⚠️ ScoutIntelligence uses hardcoded club_id="default"
   ⚠️ ScoutIntelligence uses hardcoded target_role="pressing_forward"
```

---

## Bottlenecks

| Location | Bottleneck | Impact |
|----------|-----------|--------|
| Video upload → analysis | Sync blocking (no async/background) | Server freezes during analysis |
| Frame extraction | All frames in memory | OOM for long videos |
| Vision → Intelligence bridge | **NOT CONNECTED** | Intelligence layer isolated |
| style_weights={} | 40% of recommendation scoring dead | Recommendations don't consider club fit |
| Intelligence engines | Single-threaded | No parallelization across players |

---

## Duplicated Transforms

| Transform | Location A | Location B | Waste |
|-----------|----------|----------|-------|
| Player scoring | useCoachDashboard (frontend) | ScoutRecommendation (backend) | Frontend calculates own scores |
| Club identity | ClubIdentityEngine (backend) | ScoutCopilotV2 hardcoded map (backend) | Duplicate Saudi club data |
| Ontology data | football_ontology.yaml (file) | ontology/loader.py (inline dicts) | YAML not actually loaded |

---

## Memory Waste

| Source | Waste | Fix |
|--------|-------|----|
| Duplicate YOLO models (yolo11n.pt × 2) | 10.8 MB | Remove content-pipeline copy |
| Legacy yolov8n.pt | 6.2 MB | Delete — unused |
| _results_cache (unbounded) | Grows indefinitely | Add LRU eviction |
| _signature_cache (unbounded) | Grows indefinitely | Add LRU eviction |
| _dna_profiles_cache (unbounded) | Grows indefinitely | Add LRU eviction |