-- ========================================================
-- Ada2AI Production Database Schema Backup
-- Project: ujjmhqpyehymaavkawiv
-- Generated: 2026-05-14
-- ========================================================

-- ==========================================
-- TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.matches (
  away_score integer,
  away_team text,
  competition text,
  created_at timestamptz DEFAULT now(),
  home_score integer,
  home_team text,
  id uuid DEFAULT gen_random_uuid(),
  is_completed boolean,
  match_date date,
  result text,
  score text,
  season text,
  venue text
  , PRIMARY KEY (id)
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.organizations (
  city text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  founded_year integer,
  id uuid DEFAULT gen_random_uuid(),
  is_verified boolean,
  logo_url text,
  name text,
  name_en text,
  players_count integer,
  rating integer,
  region text,
  staff_count integer,
  type text,
  updated_at timestamptz,
  website text
  , PRIMARY KEY (id)
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.players (
  achievements text,
  age integer,
  appearances integer,
  assists integer,
  clean_sheets integer,
  club text,
  created_at timestamptz DEFAULT now(),
  defense integer,
  dominant_foot text,
  dribbling integer,
  fitness integer,
  goals integer,
  height_cm integer,
  id uuid DEFAULT gen_random_uuid(),
  is_verified boolean,
  jersey_number integer,
  name text,
  name_en text,
  nationality text,
  passing integer,
  position text,
  rating integer,
  saves integer,
  scouts_count integer,
  shooting integer,
  speed integer,
  sport text,
  sport_id_number text,
  stats jsonb,
  updated_at timestamptz,
  user_id uuid REFERENCES public.profiles(id),
  video_url text,
  weight_kg integer
  , PRIMARY KEY (id)
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.profiles (
  avatar_url text,
  city text,
  created_at timestamptz DEFAULT now(),
  email text,
  full_name text,
  id uuid DEFAULT gen_random_uuid(),
  is_active boolean,
  phone text,
  region text,
  role text,
  sport text,
  updated_at timestamptz,
  user_type text
  , PRIMARY KEY (id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.reports (
  content text,
  created_at timestamptz DEFAULT now(),
  id uuid DEFAULT gen_random_uuid(),
  is_public boolean,
  match_id uuid REFERENCES public.matches(id),
  player_id uuid REFERENCES public.players(id),
  rating integer,
  report_type text,
  scout_id uuid,
  title text,
  updated_at timestamptz
  , PRIMARY KEY (id)
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.video_analyses (
  analysis_data jsonb,
  created_at timestamptz DEFAULT now(),
  date date,
  duration text,
  id uuid DEFAULT gen_random_uuid(),
  match text,
  match_id uuid REFERENCES public.matches(id),
  status text,
  thumbnail_url text,
  title text,
  updated_at timestamptz,
  uploaded_by uuid REFERENCES public.profiles(id),
  video_url text
  , PRIMARY KEY (id)
);
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- FOREIGN KEY RELATIONSHIPS (from OpenAPI spec)
-- ==========================================

-- players.user_id -> profiles.id
ALTER TABLE public.players ADD CONSTRAINT players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- reports.player_id -> players.id
ALTER TABLE public.reports ADD CONSTRAINT reports_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);
-- reports.match_id -> matches.id
ALTER TABLE public.reports ADD CONSTRAINT reports_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);

-- video_analyses.match_id -> matches.id
ALTER TABLE public.video_analyses ADD CONSTRAINT video_analyses_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);
-- video_analyses.uploaded_by -> profiles.id
ALTER TABLE public.video_analyses ADD CONSTRAINT video_analyses_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

-- ==========================================
-- RLS POLICIES
-- (Standard Supabase patterns - verify against actual policies)
-- ==========================================

-- profiles: users can read all profiles, update own profile
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- players: readable by all, managed by authenticated users
CREATE POLICY "Players are viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert players" ON public.players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own players" ON public.players FOR UPDATE USING (auth.uid() = user_id);

-- organizations: readable by all
CREATE POLICY "Organizations are viewable by everyone" ON public.organizations FOR SELECT USING (true);

-- matches: readable by all
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);

-- reports: readable by all, insert/update by authenticated users
CREATE POLICY "Reports are viewable by everyone" ON public.reports FOR SELECT USING (true);

-- video_analyses: readable by all
CREATE POLICY "Video analyses are viewable by everyone" ON public.video_analyses FOR SELECT USING (true);

-- ==========================================
-- STORAGE BUCKETS
-- (None found - no buckets configured)
-- ==========================================

-- ==========================================
-- AUTH CONFIGURATION
-- ==========================================
-- Email auth: enabled (auto-confirm: true)
-- Phone auth: disabled (SMS provider: twilio)
-- External providers: none enabled
-- Signup: enabled
-- Passkeys: disabled
-- SAML: disabled