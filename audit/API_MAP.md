# API MAP — Ada2AI

**Date:** 2026-06-10 | **Auditor:** صانع | **Mode:** OBSERVATION ONLY

---

## Complete Endpoint Registry

### Vision/Analysis Endpoints

| Method | Path | Purpose | Request | Response | Auth | Frontend Usage | Status |
|--------|------|---------|---------|----------|------|----------------|--------|
| GET | `/` | Health check | — | `{status, version}` | ❌ | — | ✅ Working |
| GET | `/health` | Pipeline status | — | `{pipeline_ready, device, model}` | ❌ | — | ✅ Working |
| POST | `/detect/frame` | Single frame detection | FormData: image | `{detections[]}` | ❌ | — | ✅ Working |
| POST | `/analyze/single` | Single player analysis | FormData: video, track_id | `{metrics, signature, dna}` | ❌ | — | ✅ Working |
| POST | `/analyze/team` | Team formation analysis | FormData: video | `{formation, tracks[]}` | ❌ | — | ✅ Working |
| POST | `/analyze/full` | Full pipeline | FormData: video | `{detections, tracks, events, graph, dna_profiles, signatures}` | ❌ | YOLOAnalysis | ✅ Working |
| GET | `/config` | Pipeline config | — | `{model, device, tracking, pose}` | ❌ | — | ✅ Working |

### Intelligence Endpoints

| Method | Path | Purpose | Request | Response | Auth | Frontend Usage | Status |
|--------|------|---------|---------|----------|------|----------------|--------|
| GET | `/intelligence/ontology` | Full ontology | — | `{roles, concepts, events}` | ❌ | ScoutIntelligence | ✅ Working |
| GET | `/intelligence/roles` | Role definitions | — | `{roles[]}` | ❌ | ScoutIntelligence | ✅ Working |
| GET | `/intelligence/concepts` | Concept definitions | — | `{concepts[]}` | ❌ | — | ✅ Working |
| GET | `/intelligence/events` | Event categories | — | `{categories[]}` | ❌ | — | ✅ Working |
| POST | `/intelligence/roles/evaluate/{track_id}` | Evaluate player role | `{signature}` | `{role_fits[]}` | ❌ | ScoutIntelligence | ⚠️ style_weights dead |
| GET | `/intelligence/dna` | DNA profiles | — | `{profiles[]}` | ❌ | ScoutIntelligence | ✅ Working |
| POST | `/intelligence/similarity` | Find similar players | `{dna_vector}` | `{similar[]}` | ❌ | ScoutIntelligence | ✅ Working |
| POST | `/intelligence/recommend` | Scout recommendation | `{dna, role, club_id}` | `{recommendations[]}` | ❌ | ScoutIntelligence | ⚠️ 40% scoring dead |
| POST | `/intelligence/copilot` | Arabic copilot query | `{query, player_id}` | `{answer, type}` | ❌ | — | ✅ Working |
| POST | `/intelligence/feedback/note` | Add scout note | `{player_id, note}` | `{ok}` | ❌ | — | ✅ Working |
| POST | `/intelligence/feedback/verdict` | Accept/reject verdict | `{player_id, verdict}` | `{ok}` | ❌ | — | ✅ Working |
| POST | `/intelligence/feedback/correction` | Correct output | `{player_id, field, value}` | `{ok}` | ❌ | — | ✅ Working |
| GET | `/intelligence/feedback/insights` | Feedback insights | — | `{acceptance_rate, patterns}` | ❌ | — | ✅ Working |
| GET | `/intelligence/feedback/player/{id}` | Player feedback | — | `{notes, verdicts[]}` | ❌ | — | ✅ Working |
| GET | `/intelligence/graph/schema` | Graph schema | — | `{nodes, edges}` | ❌ | — | ✅ Working |

### SportID Endpoints (SQLite)

| Method | Path | Purpose | Request | Response | Auth | Frontend Usage | Status |
|--------|------|---------|---------|----------|------|----------------|--------|
| GET | `/sportid/players` | List players | — | `{players[]}` | ❌ | — | ✅ Working |
| POST | `/sportid/players` | Create player | `{name, position, club}` | `{player}` | ❌ | — | ✅ Working |
| GET | `/sportid/players/{id}` | Get player | — | `{player}` | ❌ | — | ✅ Working |
| GET | `/sportid/matches` | List matches | — | `{matches[]}` | ❌ | — | ✅ Working |
| POST | `/sportid/matches` | Create match | `{teams, date, venue}` | `{match}` | ❌ | — | ✅ Working |
| POST | `/sportid/analyze` | Run analysis | `{match_id, video_path}` | `{analysis}` | ❌ | — | ✅ Working |
| GET | `/sportid/passport/{player_id}` | Sport passport | — | `{passport}` | ❌ | SportIDPassport | ✅ Working |

---

## Missing Validation

| Endpoint | Issue |
|----------|-------|
| POST /analyze/single | No file size limit — accepts GB videos |
| POST /analyze/team | Same — no file size limit |
| POST /analyze/full | Same — no file size limit |
| POST /detect/frame | No image format validation |
| POST /intelligence/recommend | No club_id validation — accepts any string |
| POST /intelligence/copilot | No query length limit |
| POST /sportid/analyze | Video path not validated — path traversal risk |

---

## Latency Risks

| Endpoint | Expected Latency | Risk |
|----------|-----------------|------|
| POST /analyze/full | 30s-5min (video length) | 🚨 Blocks event loop |
| POST /analyze/team | 30s-5min | 🚨 Blocks event loop |
| POST /analyze/single | 10s-2min | ⚠️ Blocks event loop |
| POST /detect/frame | 100-500ms | ✅ Acceptable |
| GET /intelligence/* | <100ms | ✅ Fast |

---

## Frontend ↔ Backend Wiring

| Frontend Page | API Pattern | Base URL | Wired Correctly? |
|---------------|-------------|----------|-------------------|
| YOLOAnalysis | fetch() | ❌ Relative URL | 🚨 NO — sends to frontend origin |
| ScoutIntelligence | fetch() + API_BASE | localhost:5001 | ✅ YES (dev only) |
| VideoUpload | fetch() + API_BASE | localhost:5001 | ✅ YES (dev only) |
| Academies | fetch() | ❌ Relative URL | 🚨 NO — sends to frontend origin |
| NahdaDemo | fetch() | ❌ Relative URL | 🚨 NO — sends to frontend origin |
| Dashboard pages | Supabase client | VITE_SUPABASE_URL | ✅ YES |
| SportIDPassport | Supabase client | VITE_SUPABASE_URL | ✅ YES |