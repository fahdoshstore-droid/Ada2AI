# SUPABASE HARDENING REPORT — Ada2AI

**Date:** 2026-06-10 | **Mode:** Non-destructive — NO schema changes applied to production

---

## Changes Made

### 1. Hardcoded Credentials Removed

| File | Before | After |
|---|---|---|
| `backend/db/supabase_client.py` | URL + anon key hardcoded as fallback | `os.getenv()` with empty string default — warns if missing |
| `backend/db/setup_supabase.py` | URL hardcoded (no env), key hardcoded | Both from env vars — exits if missing |

**Zero credentials in source code now.** ✅

### 2. RLS Migration Created (NOT YET APPLIED)

**File:** `supabase/migrations/005_rls_unprotected_tables.sql`

Covers 6 previously unprotected tables:

| Table | RLS Before | RLS After |
|---|---|---|
| `matches` | ❌ None | ✅ SELECT public, INSERT/UPDATE/DELETE denied |
| `analysis` | ❌ None | ✅ SELECT public, INSERT/UPDATE/DELETE denied |
| `trainings` | ❌ None | ✅ SELECT public, INSERT/UPDATE/DELETE denied |
| `facilities` | ❌ None | ✅ SELECT public, INSERT/UPDATE/DELETE denied |
| `evaluations` | ❌ None | ✅ SELECT public, INSERT/UPDATE/DELETE denied |
| `match_stats` | ❌ None | ✅ SELECT public, INSERT/UPDATE/DELETE denied |

**Policy:** Read-only for all users, writes restricted to service_role only.

### 3. Key Rotation Needed

The anon key `sb_publishable_...` was in source code. If this repo was ever public or pushed to a remote:
- **Rotate the anon key** in Supabase Dashboard → API → API Keys → Reset
- Update `.env` files with new key
- Old key will be invalid after rotation

---

## NOT Changed (by design)
- No database schema modifications
- No existing RLS policies removed
- No table data touched
- No Supabase config.toml changes (separate manual step)

## Next Step (Manual)
Apply migration 005 to Supabase:
```bash
cd ~/Ada2AI && supabase db push
```
Or apply via Supabase Dashboard → SQL Editor → paste migration 005 content.