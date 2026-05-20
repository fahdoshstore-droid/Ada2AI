-- Migration 005: RLS Policies
-- Date: 2026-05-20
-- Purpose: Add RLS policies for profiles + reports (currently blocked = 401)
--          Other tables already have working policies

-- ============================================================
-- 1. PROFILES: Authenticated users can read all profiles (needed for AuthContext fetchProfile)
-- ============================================================

-- Allow authenticated users to read any profile (needed for navigation, player info, coach names, etc.)
CREATE POLICY "Authenticated users can read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service_role full access (already has it, but explicit)
-- Note: service_role bypasses RLS by default, no policy needed

-- ============================================================
-- 2. REPORTS: Authenticated users can read/write reports
-- ============================================================

-- Scouts can read reports they authored
CREATE POLICY "Scouts can read own reports"
ON public.reports
FOR SELECT
TO authenticated
USING (scout_id = auth.uid());

-- Coaches can read all reports
CREATE POLICY "Coaches can read reports"
ON public.reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'coach'
  )
);

-- Authenticated users can insert reports
CREATE POLICY "Authenticated users can insert reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (scout_id = auth.uid());

-- Scouts can update their own reports
CREATE POLICY "Scouts can update own reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (scout_id = auth.uid())
WITH CHECK (scout_id = auth.uid());

-- ============================================================
-- 3. API SCHEMA: Grant access for profiles + reports views
-- ============================================================

-- Profiles view: authenticated can SELECT (was missing!)
-- This is critical — the app queries via PostgREST which uses api schema
GRANT SELECT ON api.profiles TO authenticated;

-- Reports view: authenticated can SELECT (was missing!)
GRANT SELECT ON api.reports TO authenticated;

-- Add INSERT/UPDATE grants for api.profiles to authenticated
GRANT UPDATE ON api.profiles TO authenticated;

-- Add INSERT/UPDATE grants for api.reports to authenticated
GRANT INSERT, UPDATE ON api.reports TO authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';