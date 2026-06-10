# FRICTION ANALYSIS — Al Rawdha Pilot

**Date:** 2026-06-10 | **Mode:** READ-ONLY Verification

---

## Critical Friction Points (Sorted by Impact)

### 🔴 F1: Fake Data Presented as Real
**Impact:** Trust destruction
- Rankings.tsx: random scores = fake ratings
- VideoUpload.tsx: error fallback generates fake metrics
- Demo.tsx/DemoVideo.tsx: now have DEMO MODE banner (fixed) but still accessible

### 🔴 F2: Empty Player Dashboard
**Impact:** Immediate drop-off after login
- Player sees 8 cards with "—" values
- No CTA to upload video
- No explanation of what to do next

### 🔴 F3: Intelligence Inaccessible
**Impact:** Core value invisible
- IntelligenceBridge produces real insights
- Zero frontend pages show them
- Coach/scout/player never sees DNA, roles, recommendations

### 🟡 F4: No Data Persistence
**Impact:** Results disappear on refresh
- YOLO analysis → HTTP response → lost
- IntelligenceBridge → process memory → lost on restart
- No video_analyses table, no Supabase writes

### 🟡 F5: Upload Progress Fake
**Impact:** Misleading UX
- Progress bars are client-side timers
- User thinks upload is happening — it's not
- Confusing when "upload" finishes instantly but analysis takes 30s

### 🟡 F6: /analyze/full Unreachable
**Impact:** Best analysis locked away
- Only `/analyze/single` called from frontend
- Full analysis (with IntelligenceBridge) never triggered
- Team analysis, formation analysis — all unreachable

### 🟡 F7: Two Conflicting Player Schemas
**Impact:** Data inconsistency
- Migration 003 vs supabase-schema.sql
- Different field names, different data models
- Server POST and client insert expect different fields

### 🟢 F8: No Storage Buckets
**Impact:** No video archive
- Videos processed then deleted
- No replay, no history

### 🟢 F9: No Coach/Scout Workflow
**Impact:** No operational value
- Coach dashboard = player list only
- Scout dashboard = fake rankings only
- No analysis workflow, no reports, no sharing

### 🟢 F10: Admin Assignment Manual
**Impact:** Onboarding friction
- Only OWNER_OPEN_ID gets admin
- No admin UI to promote users
- Must manually edit Supabase for role changes

---

## Friction Summary

| Severity | Count | Core Theme |
|---|---|---|
| 🔴 Critical | 3 | Fake data + empty dashboards + invisible intelligence |
| 🟡 High | 4 | No persistence + fake progress + unreachable features + schema conflict |
| 🟢 Medium | 3 | No storage + no workflow + manual admin |

**Total friction points: 10**

**Highest-risk area:** Fake data presented as real (F1) — this alone disqualifies the platform from real club validation.