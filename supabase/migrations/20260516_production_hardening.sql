-- Migration 004: Production Hardening
-- Date: 2026-05-16
-- Purpose: Add indexes, auth verification function, triggers, constraints
--          Based on ACTUAL schema (verified via REST API)

-- ============================================================
-- 1. ENSURE API SCHEMA EXISTS
-- ============================================================
CREATE SCHEMA IF NOT EXISTS api;
GRANT USAGE ON SCHEMA api TO anon;
GRANT USAGE ON SCHEMA api TO authenticated;

-- ============================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================

-- Players table (most queried)
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_sport ON public.players(sport);
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players(position);
CREATE INDEX IF NOT EXISTS idx_players_rating ON public.players(rating DESC);
CREATE INDEX IF NOT EXISTS idx_players_verified ON public.players(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_players_club ON public.players(club);

-- Matches table indexes
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_competition ON public.matches(competition);

-- Organizations table indexes
CREATE INDEX IF NOT EXISTS idx_orgs_type ON public.organizations(type);
CREATE INDEX IF NOT EXISTS idx_orgs_verified ON public.organizations(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_orgs_city ON public.organizations(city);

-- Video analyses indexes
CREATE INDEX IF NOT EXISTS idx_video_match_id ON public.video_analyses(match_id);
CREATE INDEX IF NOT EXISTS idx_video_status ON public.video_analyses(status);
CREATE INDEX IF NOT EXISTS idx_video_created ON public.video_analyses(created_at DESC);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- ============================================================
-- 3. VERIFY AUTH HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.verify_auth()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: no authenticated user'
      USING HINT = 'Authentication required for this operation';
  END IF;
  RETURN uid;
END;
$$;

CREATE OR REPLACE FUNCTION api.verify_auth()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: no authenticated user'
      USING HINT = 'Authentication required for this operation';
  END IF;
  RETURN uid;
END;
$$;

-- ============================================================
-- 4. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to tables that have updated_at column
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND column_name = 'updated_at' 
    AND table_name IN ('players', 'organizations', 'video_analyses', 'profiles')
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW
         EXECUTE FUNCTION public.update_updated_at_column();',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- 5. DATA INTEGRITY CONSTRAINTS
-- ============================================================

ALTER TABLE public.players DROP CONSTRAINT IF EXISTS check_rating_bounds;
ALTER TABLE public.players ADD CONSTRAINT check_rating_bounds 
  CHECK (rating >= 0 AND rating <= 100);

ALTER TABLE public.players DROP CONSTRAINT IF EXISTS check_age_bounds;
ALTER TABLE public.players ADD CONSTRAINT check_age_bounds 
  CHECK (age IS NULL OR (age >= 4 AND age <= 80));

-- ============================================================
-- 6. ENSURE RLS IS ENABLED (idempotent)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. API SCHEMA VIEWS (DROP + CREATE for column changes)
-- ============================================================

-- Drop existing views first (column order may differ)
DROP VIEW IF EXISTS api.players CASCADE;
DROP VIEW IF EXISTS api.matches CASCADE;
DROP VIEW IF EXISTS api.organizations CASCADE;
DROP VIEW IF EXISTS api.reports CASCADE;
DROP VIEW IF EXISTS api.video_analyses CASCADE;
DROP VIEW IF EXISTS api.profiles CASCADE;

-- Players: full public-facing view
CREATE VIEW api.players WITH (security_barrier = true) AS
  SELECT id, user_id, name, name_en, sport, rating, position, age,
         height_cm, weight_kg, dominant_foot, jersey_number,
         club, nationality, achievements, video_url, stats,
         goals, assists, speed, passing, shooting, fitness,
         dribbling, defense, clean_sheets, saves,
         scouts_count, appearances, is_verified,
         created_at, updated_at
  FROM public.players;

-- Matches: full view
CREATE VIEW api.matches WITH (security_barrier = true) AS
  SELECT id, home_team, away_team, home_score, away_score, score,
         result, competition, match_date, season, venue, is_completed,
         created_at
  FROM public.matches;

-- Organizations: full view
CREATE VIEW api.organizations WITH (security_barrier = true) AS
  SELECT id, name, name_en, type, city, region, players_count,
         staff_count, rating, is_verified, logo_url, website,
         founded_year, created_at, updated_at
  FROM public.organizations;

-- Reports: auth-only view
CREATE VIEW api.reports WITH (security_barrier = true) AS
  SELECT id, player_id, scout_id, content, rating,
         created_at, updated_at
  FROM public.reports;

-- Video analyses: full view
CREATE VIEW api.video_analyses WITH (security_barrier = true) AS
  SELECT id, match_id, title, match, date, duration, status,
         video_url, thumbnail_url, analysis_data, uploaded_by,
         created_at, updated_at
  FROM public.video_analyses;

-- Profiles: EXCLUDE email and phone
CREATE VIEW api.profiles WITH (security_barrier = true) AS
  SELECT id, full_name, role, user_type, avatar_url,
         sport, region, city, is_active, created_at, updated_at
  FROM public.profiles;

-- ============================================================
-- 8. GRANTS
-- ============================================================

GRANT SELECT ON api.players TO anon;
GRANT SELECT ON api.matches TO anon;
GRANT SELECT ON api.organizations TO anon;
GRANT SELECT ON api.video_analyses TO anon;

GRANT SELECT ON api.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON api.players TO authenticated;
GRANT SELECT, INSERT, UPDATE ON api.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE ON api.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON api.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON api.video_analyses TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA api TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================
-- 9. PGRST CONFIG (fix PGRST002)
-- ============================================================

CREATE OR REPLACE FUNCTION public.pgrst_pre_config()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', '{}', false);
  PERFORM set_config('pgrst.db_schemas', 'api,public', false);
  PERFORM set_config('pgrst.db_anon_role', 'anon', false);
END;
$$;

NOTIFY pgrst, 'reload schema';
