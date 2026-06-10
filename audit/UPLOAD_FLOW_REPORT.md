# UPLOAD FLOW REPORT — Al Rawdha Pilot

**Date:** 2026-06-10 | **Mode:** READ-ONLY Verification

---

## Upload Architecture

```
VideoUpload.tsx → POST /analyze/single (Python FastAPI) → temp file → YOLO → response
                  NO Supabase persistence anywhere
```

---

## Critical Findings

### ❌ Upload Progress Is Fake
- Client-side `setInterval` ticks +10% every 300ms — cosmetic only
- No real upload progress (no XMLHttpRequest.upload.onprogress)
- User sees progress bar but NO bytes transfer during "upload" phase

### ❌ Error Fallback = Fake Data
- VideoUpload.tsx lines 128-135: if backend fails, generates RANDOMIZED metrics
- User gets fabricated results presented as real analysis
- **This violates "no fake data" rule directly**

### ❌ Zero Persistence
- `saveAnalysisResult()` is a commented-out TODO stub (lines 141-156)
- No `video_analyses` table in Supabase
- No `analysis_data` JSONB column anywhere
- YOLO results exist only in HTTP response — lost forever on page refresh

### ❌ /analyze/full Data Is Ephemeral
- IntelligenceBridge holds signatures/DNA/timeline in Python process memory
- Server restart = ALL intelligence data lost
- No Supabase write from any analysis endpoint

### ⚠️ Single Endpoint Only
- VideoUpload.tsx only calls `/analyze/single`
- `/analyze/team`, `/analyze/full`, `/detect/frame` have NO frontend callers
- Full analysis (with IntelligenceBridge) is unreachable from UI

### ❌ No Supabase Storage Buckets
- config.toml: storage buckets ALL commented out
- Videos → temp files → deleted after processing
- No persistent video storage

### ❌ toUiStatus() Does Not Exist
- No status enum or mapping function anywhere in codebase
- UI uses independent booleans (uploading, analyzing, error)

---

## What Works
- ✅ File validation: video/* types, max 200MB
- ✅ YOLO processing: `/analyze/single` returns real detection data
- ✅ Temp file cleanup: `os.unlink()` in finally blocks
- ✅ Arabic labels in upload UI

---

## Upload Flow Verdict

| Step | Status |
|---|---|
| File selection | ✅ Works |
| Validation | ✅ Works |
| Upload progress | ❌ Fake (cosmetic timer) |
| Backend processing | ✅ YOLO works |
| Persistence | ❌ Zero — all data ephemeral |
| Error handling | ❌ Falls back to fake data |
| Storage | ❌ No buckets configured |

## Status: UPLOAD FLOW — NOT PILOT READY