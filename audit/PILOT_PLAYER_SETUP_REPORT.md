# PILOT PLAYER SETUP REPORT — Al Rawdha Club

**Date:** 2026-06-10 | **Mode:** READ-ONLY Verification

---

## Current State Assessment

### ❌ Admin Login — PARTIALLY OPERATIONAL
- Supabase email/password auth works
- Admin role assigned ONLY via hardcoded `OWNER_OPEN_ID` env var (server/db.ts:68)
- **No admin UI to assign roles** — must manually set in Supabase dashboard
- **No admin onboarding flow** — only the owner can be admin

### ❌ create-player Edge Function — DOES NOT EXIST
- Zero Supabase Edge Functions deployed
- Player creation via: (a) direct Supabase insert from client/src/lib/supabase.ts:157-163, or (b) Express POST /api/players
- **Two conflicting player table schemas**: migration 003 vs supabase-schema.sql
- Server POST requires `name`, `sport`, `position`, `age`, `region`, `rating`, `speed`, `agility`, `technique`
- Client insert requires `profile_id`, `academy_id`, `position`, `age`, `height_cm`, `weight_cm`

### ❌ Onboarding Flow — INCOMPLETE
- Auth.tsx (unified/) — email/password signup → auto-creates `profiles` row via trigger
- **No player-specific onboarding** — after signup, redirect to `/app/player` which shows ZERO real data
- PlayerDashboard.tsx: all stats = placeholder dashes ("—")
- **No profile completion step** — no prompt for position, age, dominant foot, etc.

### ❌ Player Dashboard — NON-FUNCTIONAL
- PlayerDashboard.tsx (50 lines) — fetches useAuth() only, shows no Supabase data
- All 8 stat cards show "—" (no real data pipeline)
- No analysis history, no video uploads, no recommendations

### ⚠️ Credentials Generation — WORKS (Supabase Auth)
- `supabase.auth.signUp()` creates auth.users entry + profiles row via trigger
- Email confirmations disabled — instant access
- No password strength requirements

### ❌ Upload Permissions — NOT CONFIGURED
- Zero Supabase Storage buckets defined
- Videos go directly to Python backend as multipart uploads (temp files only)
- No role-based upload restrictions

---

## Pilot Player Creation — BLOCKED

Cannot create 3 pilot players because:
1. Player table schema is ambiguous (two conflicting definitions)
2. PlayerDashboard shows no data even if players exist
3. No onboarding flow to set player attributes
4. No way to associate auth users with player records automatically

---

## Required Before Pilot (Minimal)

1. **Resolve player table schema** — decide which schema is canonical
2. **Create 3 player records manually** via Supabase dashboard
3. **Add profile completion step** — after first login, prompt for position/age/foot
4. **Connect PlayerDashboard to real data** — fetch from `players` table
5. **Create Supabase Storage bucket** for video uploads

## Status: PILOT PLAYER SETUP — NOT READY