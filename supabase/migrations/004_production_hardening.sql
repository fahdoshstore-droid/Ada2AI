-- ============================================================
-- Migration 004: Production Hardening
-- Consolidates auth on Supabase, fixes RLS, drops dead Manus tables
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. FIX: profiles table — add missing columns
-- ══════════════════════════════════════════════════════════════

-- Add email column if missing (handle_new_user trigger inserts email)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Add user_type column check constraint (replace role for user-type classification)
-- user_type already exists in supabase-schema.sql but 20260101 migration doesn't have it
-- Ensure it has proper check constraint
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
  -- Add new check constraint
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
    CHECK (user_type IN ('player', 'club', 'coach', 'parent', 'scout', 'academy'));
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ══════════════════════════════════════════════════════════════
-- 2. FIX: Trigger handle_new_user — use user_type from metadata
-- ══════════════════════════════════════════════════════════════

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
  -- Profile might already exist (idempotent)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ══════════════════════════════════════════════════════════════
-- 3. FIX: updated_at trigger on profiles
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 4. FIX: RLS policies — secure, not permissive
-- ══════════════════════════════════════════════════════════════

-- PROFILES: Drop all old policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile in profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;

-- PROFILES: New policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- PLAYERS: Drop wildly permissive policies from migration 003
DROP POLICY IF EXISTS "Players are publicly readable" ON public.players;
DROP POLICY IF EXISTS "Authenticated can insert players" ON public.players;
DROP POLICY IF EXISTS "Users can update players" ON public.players;
DROP POLICY IF EXISTS "Users can manage own player" ON public.players; -- from supabase-schema.sql

-- PLAYERS: New policies
CREATE POLICY "players_select_public" ON public.players
  FOR SELECT USING (true); -- Player profiles are publicly viewable

CREATE POLICY "players_insert_own" ON public.players
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "players_update_own" ON public.players
  FOR UPDATE USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "players_delete_own" ON public.players
  FOR DELETE USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "players_service_role" ON public.players
  FOR ALL USING (auth.role() = 'service_role');

-- ACADEMIES: Drop wildly permissive policies from migration 003
DROP POLICY IF EXISTS "Academies are publicly readable" ON public.academies;
DROP POLICY IF EXISTS "Authenticated can insert academies" ON public.academies;
DROP POLICY IF EXISTS "Users can update academies" ON public.academies;
DROP POLICY IF EXISTS "Users can manage own club" ON public.clubs; -- from supabase-schema.sql (different table name)

CREATE POLICY "academies_select_public" ON public.academies
  FOR SELECT USING (true); -- Academy profiles are publicly viewable

CREATE POLICY "academies_insert_own" ON public.academies
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "academies_update_own" ON public.academies
  FOR UPDATE USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "academies_delete_own" ON public.academies
  FOR DELETE USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "academies_service_role" ON public.academies
  FOR ALL USING (auth.role() = 'service_role');

-- SCOUTS: Drop wildly permissive policies
DROP POLICY IF EXISTS "Scouts are publicly readable" ON public.scouts;
DROP POLICY IF EXISTS "Authenticated can insert scouts" ON public.scouts;
DROP POLICY IF EXISTS "Users can update scouts" ON public.scouts;
DROP POLICY IF EXISTS "Users can manage own scout" ON public.scouts;

CREATE POLICY "scouts_select_public" ON public.scouts
  FOR SELECT USING (true); -- Scout profiles are publicly viewable

CREATE POLICY "scouts_insert_own" ON public.scouts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "scouts_update_own" ON public.scouts
  FOR UPDATE USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "scouts_delete_own" ON public.scouts
  FOR DELETE USING (
    auth.uid() = user_id OR auth.role() = 'service_role'
  );

CREATE POLICY "scouts_service_role" ON public.scouts
  FOR ALL USING (auth.role() = 'service_role');

-- CLUBS (if exists from supabase-schema.sql)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clubs' AND table_schema = 'public') THEN
    -- Drop old permissive policies
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own club" ON public.clubs';
    
    -- Add proper policies
    EXECUTE 'CREATE POLICY "clubs_select_public" ON public.clubs FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "clubs_insert_own" ON public.clubs FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id) OR auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "clubs_update_own" ON public.clubs FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id) OR auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "clubs_service_role" ON public.clubs FOR ALL USING (auth.role() = ''service_role'')';
  END IF;
END $$;

-- COACHES (if exists from supabase-schema.sql)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coaches' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own coach" ON public.coaches';
    
    EXECUTE 'CREATE POLICY "coaches_select_public" ON public.coaches FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "coaches_insert_own" ON public.coaches FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id) OR auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "coaches_update_own" ON public.coaches FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id) OR auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "coaches_service_role" ON public.coaches FOR ALL USING (auth.role() = ''service_role'')';
  END IF;
END $$;

-- PARENTS (if exists from supabase-schema.sql)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parents' AND table_schema = 'public') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own parent" ON public.parents';
    
    EXECUTE 'CREATE POLICY "parents_select_own" ON public.parents FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id) OR auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "parents_insert_own" ON public.parents FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id) OR auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "parents_update_own" ON public.parents FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id) OR auth.role() = ''service_role'')';
    EXECUTE 'CREATE POLICY "parents_service_role" ON public.parents FOR ALL USING (auth.role() = ''service_role'')';
  END IF;
END $$;

-- WAITLIST (public signup, service_role admin)
DROP POLICY IF EXISTS "Service role full access on waitlist" ON public.waitlist;

CREATE POLICY "waitlist_insert_public" ON public.waitlist
  FOR INSERT WITH CHECK (true); -- Anyone can join waitlist

CREATE POLICY "waitlist_service_role" ON public.waitlist
  FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════════════════════════════
-- 5. FIX: Foreign Keys — players/academies/scouts should reference profiles, not users
-- ══════════════════════════════════════════════════════════════

-- Check if players.user_id references users table and fix it
-- These ALTERs are idempotent — they'll only change if the column type differs
DO $$
BEGIN
  -- Migrate players.user_id FK from users to profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'players' AND kcu.column_name = 'user_id'
  ) THEN
    -- Drop old FK constraint
    ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_user_id_fkey;
  END IF;
  
  -- Migrate academies.user_id FK from users to profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'academies' AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE public.academies DROP CONSTRAINT IF EXISTS academies_user_id_fkey;
  END IF;
  
  -- Migrate scouts.user_id FK from users to profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'scouts' AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE public.scouts DROP CONSTRAINT IF EXISTS scouts_user_id_fkey;
  END IF;
END $$;

-- Add new FKs pointing to profiles(id)
ALTER TABLE public.players 
  ADD CONSTRAINT players_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.academies 
  ADD CONSTRAINT academies_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.scouts 
  ADD CONSTRAINT scouts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ══════════════════════════════════════════════════════════════
-- 6. FIX: Add missing indexes
-- ══════════════════════════════════════════════════════════════

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_sport ON public.profiles(sport);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- Players composite indexes
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_sport_region ON public.players(sport, region);
CREATE INDEX IF NOT EXISTS idx_players_rating ON public.players(rating DESC);
CREATE INDEX IF NOT EXISTS idx_players_academy_id ON public.players(academy_id);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON public.players(is_active) WHERE is_active = true;

-- Academies composite indexes
CREATE INDEX IF NOT EXISTS idx_academies_user_id ON public.academies(user_id);
CREATE INDEX IF NOT EXISTS idx_academies_sport_region ON public.academies(sport, region);
CREATE INDEX IF NOT EXISTS idx_academies_verified_active ON public.academies(verified, is_active) WHERE is_active = true;

-- Scouts composite indexes
CREATE INDEX IF NOT EXISTS idx_scouts_user_id ON public.scouts(user_id);
CREATE INDEX IF NOT EXISTS idx_scouts_sport_region ON public.scouts(sport, region);
CREATE INDEX IF NOT EXISTS idx_scouts_verified ON public.scouts(verified) WHERE verified = true;

-- ══════════════════════════════════════════════════════════════
-- 7. CLEANUP: Drop dead Manus `users` table policies
-- ══════════════════════════════════════════════════════════════

-- Remove RLS policies from the Manus-era `users` table
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can create account" ON public.users;

-- NOTE: We do NOT drop the `users` table yet because it may contain data
-- that needs to be migrated to `profiles` first.
-- After verifying all users have corresponding profiles, run:
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ══════════════════════════════════════════════════════════════
-- 8. MIGRATE: Copy any users data missing from profiles
-- ══════════════════════════════════════════════════════════════

-- Insert profiles for any users table entries that don't have profiles yet
INSERT INTO public.profiles (id, email, full_name, user_type, is_active, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.full_name, u.name, u.email),
  COALESCE(u.role, 'player'),
  COALESCE(u.is_active, true),
  u.created_at,
  u.updated_at
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- 9. FIX: Add unique constraint on profiles.user_id
-- ══════════════════════════════════════════════════════════════

-- This should already exist from supabase-schema.sql but ensure it's there
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- ══════════════════════════════════════════════════════════════
-- 10. VERIFICATION QUERIES (run manually to verify)
-- ══════════════════════════════════════════════════════════════

-- After running this migration, verify with:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- 
-- SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
-- 
-- SELECT conname, conrelid::regclass, confrelid::regclass, contype
-- FROM pg_constraint WHERE conrelid::regclass::text IN ('profiles','players','academies','scouts')
-- ORDER BY conrelid::regclass;