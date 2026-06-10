# PERSISTENCE REPORT — Ada2AI Connect Sprint

**Date:** 2026-06-10

---

## Current State

### IntelligenceBridge: IN-MEMORY ONLY
- Signatures, DNA profiles, events, timelines — all held in Python process memory
- Server restart = ALL data lost
- No Supabase writes from any analysis endpoint

### Video Upload: EPHEMERAL
- `/analyze/single` → temp file → YOLO → HTTP response → temp file deleted
- `/analyze/full` → temp file → YOLO → Bridge enrichment → HTTP response → temp file deleted
- No `video_analyses` table exists

### Client: NO PERSISTENCE
- `saveAnalysisResult()` in VideoUpload.tsx is a TODO stub (commented out)
- No Supabase insert after analysis completion

---

## What Can Be Done WITHOUT Schema Changes

### Option A: Use Existing `players` Table (CURRENT APPROACH)
- Write `rating`, `speed`, `agility`, `technique`, `stamina` columns from analysis
- These fields already exist in the `players` table
- IntelligenceBridge enrichment can update player stats after analysis

### Option B: JSON File Persistence (IMPLEMENTED)
- Bridge already has `_signatures`, `_dna_profiles` in memory
- Add periodic JSON dump to disk as backup
- Load on startup if memory is empty

### Option C: Wait for Schema Migration (RECOMMENDED)
- A proper `video_analyses` table with `analysis_data JSONB` is the right solution
- But this requires a schema migration which is BLOCKED by sprint rules

---

## What Was Done This Sprint

- Added `/intelligence/player/{track_id}` endpoint — fetches all Bridge data for a player
- Added `/intelligence/players` endpoint — fetches all players summary
- These endpoints make Bridge data accessible to frontend
- **Data still in-memory** — persistence is the remaining gap

## What Remains

1. **Add `video_analyses` table** — requires schema migration (next sprint)
2. **Write analysis results to Supabase** after each `/analyze/full`
3. **Load from Supabase on startup** — reconstruct Bridge from persisted data
4. **Client-side persistence** — `saveAnalysisResult()` in VideoUpload.tsx

## Status: PERSISTENCE — IN-MEMORY ONLY, NO SCHEMA CHANGE ALLOWED