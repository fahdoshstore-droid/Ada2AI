# YOLO VALIDATION REPORT — Al Rawdha Pilot

**Date:** 2026-06-10 | **Mode:** READ-ONLY Verification

---

## YOLO Architecture

- **Model:** YOLO11n (Ultralytics) — STABLE, no migration to YOLO26
- **Device priority:** MPS → CUDA → CPU
- **Tracker:** ByteTrack (replaces IoU-only)
- **SPORTS_BALL_CLASS:** 32 (COCO, corrected)
- **VisionPipeline:** 8 files in `backend/vision_core/`

---

## What Works

### ✅ Detection
- Person detection via YOLO11n on Apple Silicon MPS
- Frame-by-frame analysis with configurable stride
- Confidence threshold configurable (default 0.4)

### ✅ Tracking
- ByteTrack multi-object tracking
- Track summaries: position_avg, event_counts, distance, sprint_count
- Team assignment via spatial clustering

### ✅ Event Detection
- Event types: pass, sprint, shot, tackle, transition, pressure
- Events dataclass: event_type, frame, track_id, position, confidence
- Event timeline available via `get_timeline()`

### ✅ IntelligenceBridge Integration
- `/analyze/full` enriches pipeline output → signatures → DNA → temporal
- 10/10 pipeline stages verified operational
- All intelligence tied to real detection/tracking data

---

## What's Broken

### ❌ /analyze/full Unreachable from UI
- VideoUpload.tsx only calls `/analyze/single`
- Full analysis (with IntelligenceBridge enrichment) has NO frontend trigger
- Intelligence data exists in memory but user can never access it

### ❌ No Polling Mechanism
- VideoUpload.tsx sends request and waits for response
- No WebSocket, no SSE, no polling for long analyses
- Long videos will timeout (no background queue)

### ❌ Analysis Data Not Persisted
- No `video_analyses` table
- No `analysis_data` JSONB column
- YOLO output → HTTP response → lost

### ❌ Heatmaps / Zones / Touches
- Backend generates zone_time_pct in PlayerEventSignature
- Frontend has NO rendering code for heatmaps/zones/touches
- No Supabase persistence for spatial data

---

## Real Football Footage Status
- **NOT TESTED with real Al Rawdha footage yet**
- YOLO works with test data and generic football videos
- No validation against Saudi football training footage

---

## YOLO Verdict

| Component | Status |
|---|---|
| Detection (YOLO11n) | ✅ Operational |
| Tracking (ByteTrack) | ✅ Operational |
| Event detection | ✅ Operational |
| IntelligenceBridge | ✅ Operational |
| UI access to full analysis | ❌ Unreachable |
| Polling/async processing | ❌ Missing |
| Data persistence | ❌ Zero |
| Heatmap/zone rendering | ❌ Missing |
| Real footage validation | ❌ Not tested |

## Status: YOLO — ENGINE READY, PIPELINE INCOMPLETE