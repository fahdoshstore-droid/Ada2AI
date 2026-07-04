# Ada2AI v2 — TASK-001 Implementation Package

**Architecture Reference:** ARCHITECTURE_V2_FINAL.md v1.0, Section 3.1  
**ACR:** ACR-001 (APPROVED)  
**Date:** 25 June 2026  
**Target:** Codex (OpenAI)  
**Supabase Project:** `ujjmhqpyehymaavkawiv`

---

## Goal

Create the `profiles` table and all supporting database objects (functions, triggers, RLS policies) as specified in Architecture Section 3.1. This is the foundation for all user identity in Ada2AI v2.

---

## Files Expected to Change

| File | Action | Description |
|---|---|---|
| `supabase/migrations/001_profiles.sql` | CREATE | New migration file — the only deliverable |

**No TypeScript files. No client code. No server code. Pure SQL migration.**

---

## Schema Specification (from Architecture Section 3.1)

### `profiles` Table — 12 Columns

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type  TEXT NOT NULL DEFAULT 'player'
             CHECK (user_type IN ('player', 'club', 'coach', 'parent', 'scout', 'academy', 'federation')),
  full_name  TEXT,
  email      TEXT,
  phone      TEXT,
  avatar_url TEXT,
  sport      TEXT,
  region     TEXT,
  city       TEXT,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `handle_new_user()` Function

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'player')
  );
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Never block signup — profile can be completed later
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `on_auth_user_created` Trigger

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### `update_updated_at()` Function

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `trg_profiles_updated_at` Trigger

```sql
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### RLS Policies

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Owner can read own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Owner can insert own profile (needed for trigger-based creation)
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Owner can update own profile
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role bypass for backend operations
CREATE POLICY profiles_service_role ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
```

---

## Validation Commands

After applying the migration to Supabase project `ujjmhqpyehymaavkawiv`, run these checks:

### 1. Table Exists
```bash
curl -s "https://ujjmhqpyehymaavkawiv.supabase.co/rest/v1/profiles?select=count" \
  -H "apikey: sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO" \
  -H "Prefer: count=exact"
```
**Expected:** HTTP 200 (not 404, not 401). Count may be 0 if no users exist yet.

### 2. RLS is Active
```bash
# Anonymous access should be denied
curl -s -o /dev/null -w '%{http_code}' \
  "https://ujjmhqpyehymaavkawiv.supabase.co/rest/v1/profiles?select=id&limit=1" \
  -H "apikey: sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO"
```
**Expected:** HTTP 401 (permission denied) — RLS blocks anonymous reads.

### 3. Trigger Works (Signup Test)
```bash
# Sign up a test user via Supabase Auth
curl -s -X POST "https://ujjmhqpyehymaavkawiv.supabase.co/auth/v1/signup" \
  -H "apikey: sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-task001@ada2ai.com","password":"Test123!@#","data":{"full_name":"Test User","user_type":"player"}}'
```
**Expected:** HTTP 200 with user object. Then verify profile was created:
```bash
# Use the returned access_token to read own profile
curl -s "https://ujjmhqpyehymaavkawiv.supabase.co/rest/v1/profiles?select=*&id=eq.<USER_ID>" \
  -H "apikey: sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
**Expected:** Returns the profile row with `full_name = "Test User"`, `user_type = "player"`.

### 4. TypeScript Build Unaffected
```bash
cd /Users/fahadalmuhanna/Ada2AI && npx tsc --noEmit 2>&1 | grep -c "error TS"
```
**Expected:** Same count as before migration (3 pre-existing errors in `ScoutIntelligence.tsx` — NOT caused by this task).

---

## Success Criteria

- [ ] `public.profiles` table exists in Supabase project `ujjmhqpyehymaavkawiv`
- [ ] Table has exactly 12 columns matching the specification
- [ ] `handle_new_user()` function exists and is SECURITY DEFINER
- [ ] `on_auth_user_created` trigger fires on new signups
- [ ] `update_updated_at()` function exists
- [ ] `trg_profiles_updated_at` trigger fires on profile updates
- [ ] RLS enabled with 4 policies: `profiles_select_own`, `profiles_insert_own`, `profiles_update_own`, `profiles_service_role`
- [ ] Anonymous users cannot read any profiles (401)
- [ ] Authenticated users can read only their own profile
- [ ] New user signup auto-creates a profile row
- [ ] `updated_at` auto-updates on profile modification
- [ ] No TypeScript build regressions introduced

---

## Stop Condition

**STOP if any of these occur:**

1. `profiles` table already exists with a different schema (check column count and types before DROP)
2. `auth.users` is not accessible (Supabase Auth not configured)
3. Migration fails to apply (SQL syntax error, permission denied)
4. RLS policy blocks the trigger from inserting (SECURITY DEFINER should prevent this — verify)

**Do NOT proceed to TASK-002 until all success criteria are met.**

---

## Pre-Flight Notes for Codex

1. **Production has a stale `profiles` table.** The current production `profiles` table has RLS that blocks all anon access (42501). It may have a different schema. The migration uses `CREATE TABLE IF NOT EXISTS` — if the table already exists with wrong columns, you'll need to DROP it first or use a fresh Supabase project.

2. **The `auth.users` table is managed by Supabase.** Do not modify it. The trigger `on_auth_user_created` is the only allowed interaction.

3. **`SECURITY DEFINER` is required** on `handle_new_user()` because the trigger runs in the context of the authenticated user, who does not have INSERT permission on `profiles` (RLS policy `profiles_insert_own` requires `auth.uid() = id`, which is true during signup but the trigger needs elevated privileges).

4. **The `EXCEPTION WHEN others` clause** in `handle_new_user()` is intentional — it prevents a profile creation failure from blocking user signup. The profile can be completed later via `PATCH /api/profile`.

5. **This is Migration 001.** It must be the first migration applied. All subsequent migrations (002-007) depend on `profiles` existing.

---

*End of TASK-001 Implementation Package*
