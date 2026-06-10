# SAFE TEST RESULTS — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY — Non-destructive tests only

---

## Test Suite

### T1: Backend FastAPI Import Check
**Result:** ✅ PASS
- `from main import app` succeeds
- 39 routes registered
- All intelligence engine imports succeed (0 errors)

### T2: IntelligenceBridge Live Test
**Result:** ✅ PASS (10/10 stages)

| Stage | Test | Result |
|---|---|---|
| Pre-enrich | `bridge.has_data() == False` | ✅ |
| Enrich | 3 players + 10 events processed | ✅ |
| Signatures | All 3 built with real distance > 0 | ✅ |
| Event counts | player 7: pass=1, line_breaking=1, sprint=1, transition=1, sprint_press=1 | ✅ |
| Role eval | player 7 → transition_winger fit=0.44 | ✅ |
| Similarity | 2 similar players found | ✅ |
| Recommendations | club_fit_confidence=0.3 (non-zero) | ✅ |
| Temporal | Profile exists | ✅ |
| Explain | role_fit output generated | ✅ |
| Status | sigs=3, dna=3, events=10 | ✅ |

### T3: Frontend TypeScript Check
**Result:** ❌ FAIL (1 file with errors)
- `ScoutIntelligence.tsx`: 3 TS errors
- All other 40+ pages: clean

### T4: Vision Pipeline Config Check
**Result:** ✅ PASS
- VisionConfig auto-detect: `device=mps`
- Model file exists at `~/Ada2AI/content-pipeline/yolo11n.pt`

### T5: Supabase Client Connection
**Result:** ✅ PASS
- `[Supabase] Connected to https://ujjmhqpyehymaavkawiv.supabase.co`
- `⚠️ get_supabase` function name import mismatch (non-blocking)

### T6: Ontology Load Check
**Result:** ✅ PASS
- 8 roles loaded
- 16 tactical concepts loaded
- `get_all_roles()` and `get_all_concepts()` work correctly

### T7: cv2/av Library Conflict
**Result:** ⚠️ WARNING
- `AVFFrameReceiver` and `AVFAudioReceiver` class duplicates
- May cause crashes on video processing
- Non-fatal for import, may fail at runtime during video decode

### T8: Model File Location
**Result:** ⚠️ MISMATCH
- Expected: `backend/content-pipeline/yolo11n.pt` → NOT FOUND
- Actual: `~/Ada2AI/content-pipeline/yolo11n.pt` → EXISTS
- Path mismatch between config and file location

---

## Summary

| Test | Result |
|---|---|
| Backend FastAPI | ✅ PASS |
| IntelligenceBridge | ✅ PASS (10/10) |
| Frontend TypeScript | ❌ FAIL (1 file) |
| Vision Pipeline Config | ✅ PASS |
| Supabase Connection | ✅ PASS |
| Ontology | ✅ PASS |
| cv2/av Conflict | ⚠️ WARNING |
| Model File Path | ⚠️ MISMATCH |

**Pass rate: 5/8 clean, 2 warnings, 1 fail**