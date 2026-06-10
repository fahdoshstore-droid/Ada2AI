# SUPABASE SAFE AUDIT — Ada2AI

**Date:** 2026-06-10 | **Mode:** READ-ONLY — NO modifications made

---

## Project: ujjmhqpyehymaavkawiv.supabase.co

### Connection Status
- ✅ Backend Python client connects (`[Supabase] Connected to ...`)
- ✅ Backend FastAPI loads with Supabase client initialized
- ⚠️ `db.supabase_client.get_supabase` function name changed — import path inconsistent

---

## CRITICAL FINDINGS

### 🔴 F1: Hardcoded Credentials in Source

| File | Line | Content | Severity |
|---|---|---|---|
| `backend/db/supabase_client.py` | 7 | URL hardcoded as fallback | HIGH |
| `backend/db/supabase_client.py` | 8 | `sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO` | HIGH |
| `backend/db/setup_supabase.py` | 7 | URL hardcoded (no env at all) | HIGH |
| `backend/db/setup_supabase.py` | 8 | Same anon key hardcoded | HIGH |

**Note:** This is the `anon` key (not `service_role`), but still a live credential in source code.

### 🔴 F2: Unauthenticated API Routes

| Route | File | Auth | Risk |
|---|---|---|---|
| `/api/sportid` | `api/sportid/route.ts` | ❌ NONE | Direct DB read/write without auth |
| `/api/players` | `api/players/route.ts` | ❌ NONE | Direct DB read/write without auth |

All other `api/` routes use `verifyAuth()` — these two do not.

### 🔴 F3: Missing RLS on 6+ Tables

| Table | Created By | RLS Policy |
|---|---|---|
| `matches` | setup_supabase.py | ❌ NONE |
| `analysis` | setup_supabase.py | ❌ NONE |
| `trainings` | used in api/trainings.ts | ❌ NO MIGRATION |
| `facilities` | used in api/facilities.ts | ❌ NO MIGRATION |
| `evaluations` | referenced in client lib | ❌ NO MIGRATION |
| `match_stats` | referenced in client lib | ❌ NO MIGRATION |

Migration 004 hardened players/academies/scouts — but these 6 tables have NO protection.

---

## CONFIG.TOML FINDINGS

| Setting | Value | Risk |
|---|---|---|
| `site_url` | `http://127.0.0.1:3000` | 🔴 Dev URL in production config |
| `enable_confirmations` | false | ⚠️ No email verification |
| `minimum_password_length` | 6 | ⚠️ Too low |
| `password_requirements` | "" | 🔴 No complexity at all |
| `mfa.totp.enroll_enabled` | false | ⚠️ MFA disabled |
| `db.network_restrictions.enabled` | false | ⚠️ DB open to 0.0.0.0/0 |
| `ssl_enforcement` | commented out | ⚠️ SSL not forced |

---

## FRONTEND SUPABASE USAGE

### Pattern A: Direct Client Access
22+ frontend files import from `@/lib/supabase`. They query Supabase directly with anon key — RLS is the ONLY protection.

### Pattern B: Via Backend
10 `api/` route files create their own Supabase client per request. No connection pooling.

### Pattern C: Mixed
`ClubDashboard` + `useA2AAgent` combine direct Supabase + REST API calls.

---

## MIGRATION STATUS

| Migration | Content | Status |
|---|---|---|
| 001 | unified_schema (users, waitlist) | ✅ Applied |
| 002 | alter_existing_schema | ✅ Applied |
| 003 | players, academies, scouts | ⚠️ PERMISSIVE (`USING (true)`) |
| 004 | production_hardening | ✅ Fixes 003 permissiveness |

**⚠️ If migration 003 was applied without 004, ALL INSERT/UPDATE on players/academies/scouts are unrestricted.**

---

## VERDICT

- **3 HIGH findings** require attention before production
- No `service_role` key in source ✅
- Anon key is in source 🔴
- 6 tables unprotected by RLS 🔴
- 2 API routes unauthenticated 🔴