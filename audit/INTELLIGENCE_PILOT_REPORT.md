# INTELLIGENCE PILOT REPORT — Al Rawdha Pilot

**Date:** 2026-06-10 | **Mode:** Verification Only — NO expansion

---

## IntelligenceBridge Pipeline Status

### ✅ All Stages Operational (Verified with Real Test Data)

| Stage | Input | Output | Status |
|---|---|---|---|
| Signatures | track summaries + events | PlayerEventSignature (21 fields) | ✅ Real data |
| DNA | signatures | PlayerDNAProfile (8 traits + labels) | ✅ Real data |
| Role Fit | signature + role name | score + breakdown | ✅ Real data |
| Similarity | DNA profile | ranked similar players | ✅ Real data |
| Recommendation | DNA + club identity | ScoutRecommendation | ✅ club_fit > 0 |
| Timeline | events | MatchTimeline | ✅ Real data |
| Temporal | track_id | evolution snapshot | ✅ Real data |
| Explain | output_type + data | evidence + confidence | ✅ Real data |

### Mock Propagation Check: ✅ ALL CLEAR

- All signatures have distance > 0
- All DNA profiles have 8 traits
- All signatures linked to real events
- Recommendations have non-zero club_fit
- Bridge.has_data() returns True after enrichment

---

## What's NOT Connected to Users

| Intelligence Output | Backend | Frontend | Gap |
|---|---|---|---|
| Player DNA | ✅ `get_all_dna_profiles()` | ❌ No page | Full gap |
| Role Fits | ✅ `evaluate_role()` | ❌ No page | Full gap |
| Recommendations | ✅ `recommend()` | ❌ No page | Full gap |
| Timeline | ✅ `get_match_timeline()` | ❌ No page | Full gap |
| Temporal Profile | ✅ `get_temporal_profile()` | ❌ No page | Full gap |
| Copilot | ✅ `/intelligence/copilot` | ❌ ScoutIntelligence (separate) | Partial |
| Explain | ✅ `explain()` | ❌ No page | Full gap |

---

## Usefulness Assessment

| Question | Answer |
|---|---|
| Actually useful? | **YES** — DNA profiles and role fits provide real tactical insight |
| Confusing? | Not yet — nobody sees it |
| Too advanced? | Possibly — needs Arabic explanations for coaches |
| Trustworthy? | **YES** — all derived from real tracking data, no mock |
| Actionable? | **PARTIALLY** — recommendations exist but can't be acted on in UI |

---

## Intelligence Verdict

The intelligence layer is **genuinely good** — it produces real, non-fake, evidence-backed outputs. The critical gap is **zero frontend connection**. All intelligence exists in Python process memory and is never shown to any user.

**This is the highest-value, lowest-risk thing to fix:** connect existing intelligence outputs to existing dashboard pages.

## Status: INTELLIGENCE — ENGINE READY, UI DISCONNECTED