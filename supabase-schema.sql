-- Ada2AI Supabase Schema (Production-Hardened)
-- ═══════════════════════════════════════════════════════════
-- This is the CANONICAL schema. Migrations should extend, not replace.
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════
-- PROFILES TABLE (extends auth.users — SINGLE SOURCE OF TRUTH)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('player', 'club', 'coach', 'parent', 'scout', 'academy')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  sport TEXT,
  region TEXT,
  city TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- PLAYERS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  position TEXT,
  age INT,
  height_cm INT,
  weight_kg INT,
  dominant_foot TEXT CHECK (dominant_foot IN ('left', 'right', 'both')),
  jersey_number INT,
  achievements TEXT,
  video_url TEXT,
  stats JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- ACADEMIES TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.academies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  sport VARCHAR(100) NOT NULL DEFAULT 'Football',
  region VARCHAR(100),
  city VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  logo_url TEXT,
  cover_url TEXT,
  website_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  player_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- SCOUTS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.scouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  organization VARCHAR(255),
  organization_ar VARCHAR(255),
  sport VARCHAR(100) NOT NULL DEFAULT 'Football',
  region VARCHAR(100),
  speciality VARCHAR(100),
  experience_years INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reports_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  bio TEXT,
  bio_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- CLUBS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  club_name TEXT NOT NULL,
  league TEXT,
  founded_year INT,
  stadium TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- COACHES TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certification TEXT,
  specialization TEXT,
  years_experience INT,
  previous_teams TEXT,
  coaching_license TEXT,
  achievements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- PARENTS TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  children JSONB DEFAULT '[]',
  emergency_contact TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- WAITLIST TABLE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('athlete', 'scout', 'coach', 'academy', 'federation', 'other')),
  sport VARCHAR(100),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read/update their own profile; service_role has full access
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');

-- PLAYERS: Public read; owners can manage; service_role full access
CREATE POLICY "players_select_public" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "players_insert_own" ON public.players
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "players_update_own" ON public.players
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "players_delete_own" ON public.players
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "players_service_role" ON public.players
  FOR ALL USING (auth.role() = 'service_role');

-- ACADEMIES: Public read; owners can manage; service_role full access
CREATE POLICY "academies_select_public" ON public.academies
  FOR SELECT USING (true);

CREATE POLICY "academies_insert_own" ON public.academies
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "academies_update_own" ON public.academies
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "academies_delete_own" ON public.academies
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "academies_service_role" ON public.academies
  FOR ALL USING (auth.role() = 'service_role');

-- SCOUTS: Public read; owners can manage; service_role full access
CREATE POLICY "scouts_select_public" ON public.scouts
  FOR SELECT USING (true);

CREATE POLICY "scouts_insert_own" ON public.scouts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "scouts_update_own" ON public.scouts
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "scouts_delete_own" ON public.scouts
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "scouts_service_role" ON public.scouts
  FOR ALL USING (auth.role() = 'service_role');

-- Waitlist: Anyone can join; service_role can manage
CREATE POLICY "waitlist_insert_public" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "waitlist_service_role" ON public.waitlist
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════
-- Functions & Triggers
-- ═══════════════════════════════════════════════════════════

-- Auto-create profile on user signup
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_sport ON public.profiles(sport);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_profile_id ON public.players(profile_id);
CREATE INDEX IF NOT EXISTS idx_players_position ON public.players(position);
CREATE INDEX IF NOT EXISTS idx_players_sport_region ON public.players(position, is_active);
CREATE INDEX IF NOT EXISTS idx_players_rating ON public.players(rating DESC);

CREATE INDEX IF NOT EXISTS idx_clubs_profile_id ON public.clubs(profile_id);

CREATE INDEX IF NOT EXISTS idx_coaches_profile_id ON public.coaches(profile_id);

CREATE INDEX IF NOT EXISTS idx_scouts_user_id ON public.scouts(user_id);
CREATE INDEX IF NOT EXISTS idx_scouts_sport_region ON public.scouts(sport, region);
CREATE INDEX IF NOT EXISTS idx_scouts_verified ON public.scouts(verified) WHERE verified = true;

CREATE INDEX IF NOT EXISTS idx_academies_user_id ON public.academies(user_id);
CREATE INDEX IF NOT EXISTS idx_academies_sport_region ON public.academies(sport, region);
CREATE INDEX IF NOT EXISTS idx_academies_verified_active ON public.academies(verified, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_parents_profile_id ON public.parents(profile_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);