# LIVE SAFETY CHECK — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY

---

## SAFE to Open (no side effects, no data mutation)

| Page | Risk | Notes |
|---|---|---|
| `/` Home | ✅ SAFE | Static marketing |
| `/product` | ✅ SAFE | Static + waitlist form |
| `/sport-id` | ✅ SAFE | Static landing |
| `/passport/hub` | ✅ SAFE | Static programs |
| `/passport/governance` | ✅ SAFE | Static compliance |
| `/passport/partnerships` | ✅ SAFE | Static partners |
| `/governance` | ✅ SAFE | Static links |
| `/governance/sub` | ✅ SAFE | Static policy |
| `/modules/:slug` | ✅ SAFE | Static content |
| `/features/*` | ✅ SAFE | Static showcases |
| `/dashboards` | ✅ SAFE | Static landing |
| `/login` | ⚠️ LOW | Auth flow — creates session |
| `/compare` | ⚠️ LOW | Read-only Supabase queries |
| `/rankings` | ⚠️ LOW | Read-only Supabase query |
| `/academies` | ⚠️ LOW | REST GET request |

---

## RISKY to Open (may error or show wrong data)

| Page | Risk | Issue |
|---|---|---|
| `/scout` ScoutIntelligence | 🔴 HIGH | localhost:5001 fallback, TS errors, may crash |
| `/yolo` YOLOAnalysis | 🔴 HIGH | Needs running backend + model |
| `/upload` | 🔴 HIGH | POSTs to /api/analyze — no backend proxy likely |
| `/dashboard/home` | 🟡 MEDIUM | Silent error swallowing on fetch fail |
| `/dashboard/parent` | 🟡 MEDIUM | Silent error swallowing on fetch fail |
| `/passport/facility` | 🟡 MEDIUM | Dead code, always empty |
| `/passport/facility/analytics` | 🟡 MEDIUM | Dead code, always empty |
| `/dashboard/team` | 🟡 MEDIUM | Hardcoded mock data displayed as real |

---

## DANGEROUS — Do NOT Open in Production

| Page | Risk | Reason |
|---|---|---|
| `/demo` Demo | ❌ | Hardcoded mock players shown as real data |
| `/demo-video` DemoVideo | ❌ | Hardcoded mock results shown as real analysis |
| `/demo/nahda` NahdaDemo | ❌ | POSTs analysis without auth |

---

## SAFE to Test (endpoints, no data destruction)

| Endpoint | Method | Safe? | Notes |
|---|---|---|---|
| `/health` | GET | ✅ | No side effects |
| `/intelligence/status` | GET | ✅ | Read-only bridge state |
| `/intelligence/ontology` | GET | ✅ | Static ontology |
| `/intelligence/ontology/roles` | GET | ✅ | Read-only |
| `/intelligence/ontology/concepts` | GET | ✅ | Read-only |
| `/intelligence/ontology/events` | GET | ✅ | Read-only |
| `/intelligence/graph/schema` | GET | ✅ | Schema only |
| `/intelligence/dna` | GET | ✅ | Returns empty without video |
| `/intelligence/timeline` | GET | ✅ | Returns empty without video |
| `/config` | GET | ✅ | Vision config only |

---

## RISKY to Test (makes changes or requires data)

| Endpoint | Method | Risk | Notes |
|---|---|---|---|
| `/analyze/full` | POST | 🟡 | Writes to bridge memory, processes video |
| `/intelligence/roles/evaluate/{id}` | POST | 🟡 | Needs bridge populated first |
| `/intelligence/similarity` | POST | 🟡 | Needs bridge populated |
| `/intelligence/recommend` | POST | 🟡 | Needs bridge populated |
| `/intelligence/copilot` | POST | 🟡 | Needs bridge populated |
| `/intelligence/explain` | POST | 🟡 | Needs bridge populated |
| `/intelligence/feedback/*` | POST | 🔴 | Writes feedback data |
| `/analyze/single` | POST | 🔴 | File upload + processing |
| `/detect/frame` | POST | 🔴 | File upload |

---

## MUST NOT Touch

1. Supabase migrations or RLS policies
2. Authentication configuration
3. Production `.env` files
4. `api/sportid/route.ts` and `api/players/route.ts` (unauthenticated mutation)
5. Any POST endpoint on production Supabase
6. `backend/db/setup_supabase.py` (seeds data)