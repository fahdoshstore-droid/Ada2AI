-- ════════════════════════════════════════════════════════════════════
-- Migration 006: Ada2Physique — Phase 1 Coaching Platform
-- Architecture ref: docs/ADA2PHYSIQUE_ARCHITECTURE.md (v1.0)
-- Supabase project: ujjjhqpyehymaavkawiv (SHARED with Ada2AI)
-- Date: 26 June 2026
--
-- Principles:
--   * Reuse Ada2AI infra — same project, auth.users + profiles
--   * Isolate bodybuilding logic — namespaced physique_* tables, own RLS
--   * Non-breaking to Ada2AI — only additive change to shared infra is
--     extending profiles.user_type CHECK with 'athlete' and 'admin'
--   * Idempotent — safe to re-run
--
-- Structure (two-phase to avoid forward-reference errors):
--   0. Additive profiles.user_type CHECK extension
--   A. ALL physique_* tables created (FK dependency order) + indexes + RLS enable + updated_at triggers
--   B. RLS helper functions (SECURITY DEFINER) — after coach_athletes table exists
--   C. ALL RLS policies — after all tables + helpers exist
--   D. Storage buckets + storage policies
--   E. Seed exercise library (15 CV-supported movements)
--
-- Reused objects (created by earlier Ada2AI migrations, NOT recreated):
--   * public.update_updated_at()  trigger function  (migration 001)
--   * public.profiles             table              (migration 20260101)
--   * public.handle_new_user()    signup trigger fn  (migration 004)
-- ════════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────────
-- 0. Additive extension of shared profiles.user_type
--    Current CHECK: ('player','club','coach','parent','scout','academy')
--    New CHECK adds: 'athlete' + 'admin'. Superset — non-breaking.
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check
  CHECK (user_type IN (
    'player', 'club', 'coach', 'parent', 'scout', 'academy',  -- Ada2AI
    'athlete', 'admin'                                          -- Ada2Physique
  ));

-- ════════════════════════════════════════════════════════════════════
-- SECTION A — ALL TABLES (FK dependency order) + indexes + RLS + triggers
-- ════════════════════════════════════════════════════════════════════

-- A1. physique_coaches — 1:1 with profiles.id (coach profile, marketplace-ready)
CREATE TABLE IF NOT EXISTS public.physique_coaches (
  coach_id               uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name           text,
  bio                    text,
  specialties            text[] DEFAULT '{}',
  years_experience       int,
  competition_background text,
  avatar_url             text,
  is_accepting_athletes  boolean NOT NULL DEFAULT true,
  is_verified            boolean NOT NULL DEFAULT false,
  stripe_account_id      text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_coaches ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_coaches_verified ON public.physique_coaches(is_verified, is_accepting_athletes);
DROP TRIGGER IF EXISTS trg_physique_coaches_updated_at ON public.physique_coaches;
CREATE TRIGGER trg_physique_coaches_updated_at BEFORE UPDATE ON public.physique_coaches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A2. physique_athletes — 1:1 with profiles.id (athlete profile)
CREATE TABLE IF NOT EXISTS public.physique_athletes (
  athlete_id           uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id             uuid REFERENCES public.physique_coaches(coach_id) ON DELETE SET NULL,
  display_name         text,
  date_of_birth        date,
  sex                  text CHECK (sex IN ('male','female')),
  height_cm            numeric,
  competition_category text CHECK (competition_category IN
    ('none','classic_physique','mens_open','mens_physique','212','bikini','figure','womens_physique','wellness')),
  experience_level     text CHECK (experience_level IN ('beginner','intermediate','advanced','competitor')),
  goal                 text CHECK (goal IN ('bulk','cut','recomp','maintain','prep','offseason')),
  equipment            text[] DEFAULT '{"gym"}',
  training_frequency   int CHECK (training_frequency BETWEEN 1 AND 7),
  weak_body_parts      text[] DEFAULT '{}',
  avatar_url           text,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_athletes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_athletes_coach ON public.physique_athletes(coach_id);
CREATE INDEX IF NOT EXISTS idx_physique_athletes_category ON public.physique_athletes(competition_category);
DROP TRIGGER IF EXISTS trg_physique_athletes_updated_at ON public.physique_athletes;
CREATE TRIGGER trg_physique_athletes_updated_at BEFORE UPDATE ON public.physique_athletes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A3. physique_coach_athletes — N:M assignment with status
CREATE TABLE IF NOT EXISTS public.physique_coach_athletes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    uuid NOT NULL REFERENCES public.physique_coaches(coach_id) ON DELETE CASCADE,
  athlete_id  uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','ended')),
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coach_id, athlete_id)
);
ALTER TABLE public.physique_coach_athletes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_coach_athletes_coach ON public.physique_coach_athletes(coach_id, status);
CREATE INDEX IF NOT EXISTS idx_physique_coach_athletes_athlete ON public.physique_coach_athletes(athlete_id, status);
DROP TRIGGER IF EXISTS trg_physique_coach_athletes_updated_at ON public.physique_coach_athletes;
CREATE TRIGGER trg_physique_coach_athletes_updated_at BEFORE UPDATE ON public.physique_coach_athletes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A4. physique_exercise_library — canonical exercises (admin-curated)
CREATE TABLE IF NOT EXISTS public.physique_exercise_library (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  name_ar           text,
  category          text CHECK (category IN ('compound','isolation','accessory','mobility','cardio')),
  muscle_groups     text[] DEFAULT '{}',
  movement_rule_key text,  -- maps to backend/physique/biomechanics rule (Phase 2)
  equipment         text,
  video_demo_url    text,
  instructions      text,
  is_cv_supported   boolean NOT NULL DEFAULT false,  -- Phase 2 video analysis support
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_exercise_library ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_exercise_library_rule ON public.physique_exercise_library(movement_rule_key);
DROP TRIGGER IF EXISTS trg_physique_exercise_library_updated_at ON public.physique_exercise_library;
CREATE TRIGGER trg_physique_exercise_library_updated_at BEFORE UPDATE ON public.physique_exercise_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A5. physique_programs + days + blocks
CREATE TABLE IF NOT EXISTS public.physique_programs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  athlete_id     uuid REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,  -- null = template
  name           text NOT NULL,
  description    text,
  goal           text,
  duration_weeks int,
  days_per_week  int,
  is_template    boolean NOT NULL DEFAULT false,
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_programs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_programs_created_by ON public.physique_programs(created_by);
CREATE INDEX IF NOT EXISTS idx_physique_programs_athlete ON public.physique_programs(athlete_id);
DROP TRIGGER IF EXISTS trg_physique_programs_updated_at ON public.physique_programs;
CREATE TRIGGER trg_physique_programs_updated_at BEFORE UPDATE ON public.physique_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.physique_program_days (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES public.physique_programs(id) ON DELETE CASCADE,
  day_number  int NOT NULL,
  name        text,
  focus       text CHECK (focus IN ('push','pull','legs','upper','lower','full_body','rest','cardio','custom')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, day_number)
);
ALTER TABLE public.physique_program_days ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_program_days_program ON public.physique_program_days(program_id);
DROP TRIGGER IF EXISTS trg_physique_program_days_updated_at ON public.physique_program_days;
CREATE TRIGGER trg_physique_program_days_updated_at BEFORE UPDATE ON public.physique_program_days
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.physique_program_blocks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id          uuid NOT NULL REFERENCES public.physique_program_days(id) ON DELETE CASCADE,
  exercise_id     uuid REFERENCES public.physique_exercise_library(id) ON DELETE SET NULL,
  exercise_name   text NOT NULL,  -- denormalized for resilience
  order_index     int NOT NULL DEFAULT 0,
  sets            int,
  reps            text,           -- "8-12" or "AMRAP"
  rpe             numeric CHECK (rpe BETWEEN 0 AND 10),
  rest_seconds    int,
  tempo           text,           -- "3-1-1-0" (eccentric-pause-concentric-pause)
  technique_notes text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day_id, order_index)
);
ALTER TABLE public.physique_program_blocks ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_program_blocks_day ON public.physique_program_blocks(day_id);
DROP TRIGGER IF EXISTS trg_physique_program_blocks_updated_at ON public.physique_program_blocks;
CREATE TRIGGER trg_physique_program_blocks_updated_at BEFORE UPDATE ON public.physique_program_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A6. physique_nutrition_plans + targets
CREATE TABLE IF NOT EXISTS public.physique_nutrition_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  athlete_id        uuid REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  name              text NOT NULL,
  goal              text CHECK (goal IN ('bulk','cut','recomp','prep','maintain')),
  protein_ratio_pct int CHECK (protein_ratio_pct BETWEEN 0 AND 100),
  carb_ratio_pct    int CHECK (carb_ratio_pct BETWEEN 0 AND 100),
  fat_ratio_pct     int CHECK (fat_ratio_pct BETWEEN 0 AND 100),
  meal_timing_notes text,
  is_template       boolean NOT NULL DEFAULT false,
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_nutrition_plans ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_nutrition_plans_athlete ON public.physique_nutrition_plans(athlete_id);
DROP TRIGGER IF EXISTS trg_physique_nutrition_plans_updated_at ON public.physique_nutrition_plans;
CREATE TRIGGER trg_physique_nutrition_plans_updated_at BEFORE UPDATE ON public.physique_nutrition_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.physique_nutrition_targets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       uuid NOT NULL REFERENCES public.physique_nutrition_plans(id) ON DELETE CASCADE,
  target_date   date NOT NULL,
  calories_kcal int,
  protein_g     numeric,
  carbs_g       numeric,
  fat_g         numeric,
  water_ml      int,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, target_date)
);
ALTER TABLE public.physique_nutrition_targets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_nutrition_targets_plan_date ON public.physique_nutrition_targets(plan_id, target_date);
DROP TRIGGER IF EXISTS trg_physique_nutrition_targets_updated_at ON public.physique_nutrition_targets;
CREATE TRIGGER trg_physique_nutrition_targets_updated_at BEFORE UPDATE ON public.physique_nutrition_targets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A7. physique_assignments — assign program OR nutrition plan to athlete
CREATE TABLE IF NOT EXISTS public.physique_assignments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id          uuid REFERENCES public.physique_coaches(coach_id) ON DELETE CASCADE,
  athlete_id        uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  assignment_type   text NOT NULL CHECK (assignment_type IN ('program','nutrition')),
  program_id        uuid REFERENCES public.physique_programs(id) ON DELETE CASCADE,
  nutrition_plan_id uuid REFERENCES public.physique_nutrition_plans(id) ON DELETE CASCADE,
  starts_on         date NOT NULL DEFAULT CURRENT_DATE,
  ends_on           date,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (assignment_type = 'program' AND program_id IS NOT NULL)
    OR (assignment_type = 'nutrition' AND nutrition_plan_id IS NOT NULL)
  )
);
ALTER TABLE public.physique_assignments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_assignments_athlete_active ON public.physique_assignments(athlete_id, assignment_type, is_active);
DROP TRIGGER IF EXISTS trg_physique_assignments_updated_at ON public.physique_assignments;
CREATE TRIGGER trg_physique_assignments_updated_at BEFORE UPDATE ON public.physique_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A8. physique_ai_reports — typed AI outputs (defined before check_ins soft-ref)
CREATE TABLE IF NOT EXISTS public.physique_ai_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  report_kind     text NOT NULL CHECK (report_kind IN ('check_in','exercise','physique','progress','recovery','nutrition')),
  source_ref      uuid,  -- soft ref to source (check_in/video/...) — no FK to avoid cycles
  title           text,
  summary         text,
  details         jsonb NOT NULL DEFAULT '{}',
  coach_reviewed  boolean NOT NULL DEFAULT false,
  coach_feedback  text,
  model_used      text,
  tokens_used     int,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_ai_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_ai_reports_athlete_kind ON public.physique_ai_reports(athlete_id, report_kind, created_at DESC);
DROP TRIGGER IF EXISTS trg_physique_ai_reports_updated_at ON public.physique_ai_reports;
CREATE TRIGGER trg_physique_ai_reports_updated_at BEFORE UPDATE ON public.physique_ai_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A9. physique_check_ins — weekly check-in records
CREATE TABLE IF NOT EXISTS public.physique_check_ins (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id     uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  coach_id       uuid REFERENCES public.physique_coaches(coach_id) ON DELETE SET NULL,
  check_in_date  date NOT NULL DEFAULT CURRENT_DATE,
  week_number    int,
  bodyweight_kg  numeric,
  bodyfat_pct    numeric,
  measurements   jsonb,        -- {chest, waist, arm, ...}
  photo_urls     text[] DEFAULT '{}',
  energy_level   int CHECK (energy_level BETWEEN 1 AND 10),
  hunger_level   int CHECK (hunger_level BETWEEN 1 AND 10),
  sleep_hours    numeric,
  athlete_notes  text,
  coach_notes    text,
  ai_report_id   uuid,  -- soft ref to physique_ai_reports(id); no FK to avoid cycles
  status         text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewed')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_check_ins ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_check_ins_athlete_date ON public.physique_check_ins(athlete_id, check_in_date DESC);
DROP TRIGGER IF EXISTS trg_physique_check_ins_updated_at ON public.physique_check_ins;
CREATE TRIGGER trg_physique_check_ins_updated_at BEFORE UPDATE ON public.physique_check_ins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A10. Progress logs — measurements, bodyweight, workout, sleep, hydration
CREATE TABLE IF NOT EXISTS public.physique_measurements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id   uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  measured_on  date NOT NULL DEFAULT CURRENT_DATE,
  chest_cm     numeric, waist_cm numeric, hip_cm numeric, arm_cm numeric,
  thigh_cm     numeric, calf_cm numeric, neck_cm numeric, forearm_cm numeric, shoulder_cm numeric,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_measurements ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_measurements_athlete ON public.physique_measurements(athlete_id, measured_on DESC);
DROP TRIGGER IF EXISTS trg_physique_measurements_updated_at ON public.physique_measurements;
CREATE TRIGGER trg_physique_measurements_updated_at BEFORE UPDATE ON public.physique_measurements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.physique_bodyweight (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  weighed_at  timestamptz NOT NULL DEFAULT now(),
  weight_kg   numeric NOT NULL,
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_bodyweight ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_bodyweight_athlete ON public.physique_bodyweight(athlete_id, weighed_at DESC);
DROP TRIGGER IF EXISTS trg_physique_bodyweight_updated_at ON public.physique_bodyweight;
CREATE TRIGGER trg_physique_bodyweight_updated_at BEFORE UPDATE ON public.physique_bodyweight
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.physique_workout_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id       uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  program_id       uuid REFERENCES public.physique_programs(id) ON DELETE SET NULL,
  day_id           uuid REFERENCES public.physique_program_days(id) ON DELETE SET NULL,
  exercise_id      uuid REFERENCES public.physique_exercise_library(id) ON DELETE SET NULL,
  exercise_name    text NOT NULL,
  logged_at        timestamptz NOT NULL DEFAULT now(),
  set_number       int,
  weight_kg        numeric,
  reps             int,
  rpe              numeric CHECK (rpe BETWEEN 0 AND 10),
  is_pr            boolean NOT NULL DEFAULT false,
  duration_seconds int,
  video_url        text,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_workout_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_workout_logs_athlete ON public.physique_workout_logs(athlete_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_physique_workout_logs_exercise ON public.physique_workout_logs(athlete_id, exercise_id, logged_at DESC);
DROP TRIGGER IF EXISTS trg_physique_workout_logs_updated_at ON public.physique_workout_logs;
CREATE TRIGGER trg_physique_workout_logs_updated_at BEFORE UPDATE ON public.physique_workout_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.physique_sleep_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id        uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  slept_on          date NOT NULL DEFAULT CURRENT_DATE,
  duration_hours    numeric,
  quality_score     int CHECK (quality_score BETWEEN 1 AND 10),
  deep_sleep_hours  numeric,
  rem_sleep_hours   numeric,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_sleep_logs_athlete ON public.physique_sleep_logs(athlete_id, slept_on DESC);
DROP TRIGGER IF EXISTS trg_physique_sleep_logs_updated_at ON public.physique_sleep_logs;
CREATE TRIGGER trg_physique_sleep_logs_updated_at BEFORE UPDATE ON public.physique_sleep_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.physique_hydration_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  logged_on   date NOT NULL DEFAULT CURRENT_DATE,
  water_ml    int NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_hydration_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_hydration_logs_athlete ON public.physique_hydration_logs(athlete_id, logged_on DESC);
DROP TRIGGER IF EXISTS trg_physique_hydration_logs_updated_at ON public.physique_hydration_logs;
CREATE TRIGGER trg_physique_hydration_logs_updated_at BEFORE UPDATE ON public.physique_hydration_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- A11. physique_messages — athlete/coach/AI chat thread
CREATE TABLE IF NOT EXISTS public.physique_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id   uuid NOT NULL REFERENCES public.physique_athletes(athlete_id) ON DELETE CASCADE,
  coach_id     uuid REFERENCES public.physique_coaches(coach_id) ON DELETE CASCADE,
  sender_type  text NOT NULL CHECK (sender_type IN ('athlete','coach','ai')),
  sender_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- null for ai
  content      text NOT NULL,
  metadata     jsonb DEFAULT '{}',  -- AI suggestions, referenced entities
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_messages_thread ON public.physique_messages(athlete_id, coach_id, created_at DESC);

-- A12. physique_audit_log — append-only audit trail
CREATE TABLE IF NOT EXISTS public.physique_audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     uuid,
  action       text NOT NULL,
  entity_type  text,
  entity_id    uuid,
  details      jsonb DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.physique_audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_physique_audit_log_actor ON public.physique_audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_physique_audit_log_entity ON public.physique_audit_log(entity_type, entity_id);

-- ════════════════════════════════════════════════════════════════════
-- SECTION B — RLS helper functions (SECURITY DEFINER, bypass RLS → no recursion)
-- Defined AFTER physique_coach_athletes (A3) exists.
-- ════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.physique_is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.physique_is_assigned_coach(_athlete_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.physique_coach_athletes
    WHERE athlete_id = _athlete_id
      AND coach_id = auth.uid()
      AND status = 'active'
  );
$$;

-- ════════════════════════════════════════════════════════════════════
-- SECTION C — ALL RLS POLICIES (all tables + helpers now exist)
-- ════════════════════════════════════════════════════════════════════

-- ── physique_coaches ──
DROP POLICY IF EXISTS "physique_coaches_select" ON public.physique_coaches;
CREATE POLICY "physique_coaches_select" ON public.physique_coaches
  FOR SELECT USING (
    auth.uid() = coach_id
    OR public.physique_is_admin()
    OR auth.role() = 'service_role'
    OR EXISTS (  -- an athlete sees their own assigned coach
      SELECT 1 FROM public.physique_coach_athletes ca
      WHERE ca.coach_id = physique_coaches.coach_id
        AND ca.athlete_id = auth.uid()
        AND ca.status = 'active'
    )
  );
DROP POLICY IF EXISTS "physique_coaches_insert_own" ON public.physique_coaches;
CREATE POLICY "physique_coaches_insert_own" ON public.physique_coaches
  FOR INSERT WITH CHECK (auth.uid() = coach_id);
DROP POLICY IF EXISTS "physique_coaches_update_own" ON public.physique_coaches;
CREATE POLICY "physique_coaches_update_own" ON public.physique_coaches
  FOR UPDATE USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
DROP POLICY IF EXISTS "physique_coaches_delete_own" ON public.physique_coaches;
CREATE POLICY "physique_coaches_delete_own" ON public.physique_coaches
  FOR DELETE USING (auth.uid() = coach_id OR public.physique_is_admin());

-- ── physique_athletes ──
DROP POLICY IF EXISTS "physique_athletes_select" ON public.physique_athletes;
CREATE POLICY "physique_athletes_select" ON public.physique_athletes
  FOR SELECT USING (
    auth.uid() = athlete_id
    OR public.physique_is_assigned_coach(athlete_id)
    OR public.physique_is_admin()
    OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_athletes_insert_own" ON public.physique_athletes;
CREATE POLICY "physique_athletes_insert_own" ON public.physique_athletes
  FOR INSERT WITH CHECK (auth.uid() = athlete_id);
DROP POLICY IF EXISTS "physique_athletes_update_own" ON public.physique_athletes;
CREATE POLICY "physique_athletes_update_own" ON public.physique_athletes
  FOR UPDATE USING (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin())
  WITH CHECK (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin());
DROP POLICY IF EXISTS "physique_athletes_delete" ON public.physique_athletes;
CREATE POLICY "physique_athletes_delete" ON public.physique_athletes
  FOR DELETE USING (auth.uid() = athlete_id OR public.physique_is_admin());

-- ── physique_coach_athletes ──
DROP POLICY IF EXISTS "physique_coach_athletes_select" ON public.physique_coach_athletes;
CREATE POLICY "physique_coach_athletes_select" ON public.physique_coach_athletes
  FOR SELECT USING (
    auth.uid() = coach_id OR auth.uid() = athlete_id
    OR public.physique_is_admin() OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_coach_athletes_insert_coach" ON public.physique_coach_athletes;
CREATE POLICY "physique_coach_athletes_insert_coach" ON public.physique_coach_athletes
  FOR INSERT WITH CHECK (auth.uid() = coach_id OR public.physique_is_admin());
DROP POLICY IF EXISTS "physique_coach_athletes_update_coach" ON public.physique_coach_athletes;
CREATE POLICY "physique_coach_athletes_update_coach" ON public.physique_coach_athletes
  FOR UPDATE USING (auth.uid() = coach_id OR public.physique_is_admin())
  WITH CHECK (auth.uid() = coach_id OR public.physique_is_admin());
DROP POLICY IF EXISTS "physique_coach_athletes_delete_coach" ON public.physique_coach_athletes;
CREATE POLICY "physique_coach_athletes_delete_coach" ON public.physique_coach_athletes
  FOR DELETE USING (auth.uid() = coach_id OR public.physique_is_admin());

-- ── physique_exercise_library ──
DROP POLICY IF EXISTS "physique_exercise_library_select_public" ON public.physique_exercise_library;
CREATE POLICY "physique_exercise_library_select_public" ON public.physique_exercise_library
  FOR SELECT USING (true);  -- canonical reference data is public read
DROP POLICY IF EXISTS "physique_exercise_library_write_admin" ON public.physique_exercise_library;
CREATE POLICY "physique_exercise_library_write_admin" ON public.physique_exercise_library
  FOR ALL USING (public.physique_is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.physique_is_admin() OR auth.role() = 'service_role');

-- ── physique_programs ──
DROP POLICY IF EXISTS "physique_programs_select" ON public.physique_programs;
CREATE POLICY "physique_programs_select" ON public.physique_programs
  FOR SELECT USING (
    auth.uid() = created_by
    OR (athlete_id IS NOT NULL AND auth.uid() = athlete_id)
    OR (athlete_id IS NOT NULL AND public.physique_is_assigned_coach(athlete_id))
    OR public.physique_is_admin() OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_programs_insert" ON public.physique_programs;
CREATE POLICY "physique_programs_insert" ON public.physique_programs
  FOR INSERT WITH CHECK (auth.uid() = created_by OR public.physique_is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_programs_update" ON public.physique_programs;
CREATE POLICY "physique_programs_update" ON public.physique_programs
  FOR UPDATE USING (auth.uid() = created_by OR public.physique_is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = created_by OR public.physique_is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_programs_delete" ON public.physique_programs;
CREATE POLICY "physique_programs_delete" ON public.physique_programs
  FOR DELETE USING (auth.uid() = created_by OR public.physique_is_admin() OR auth.role() = 'service_role');

-- ── physique_program_days ──
DROP POLICY IF EXISTS "physique_program_days_select" ON public.physique_program_days;
CREATE POLICY "physique_program_days_select" ON public.physique_program_days
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.physique_programs p WHERE p.id = program_id
            AND (auth.uid() = p.created_by
                 OR (p.athlete_id IS NOT NULL AND auth.uid() = p.athlete_id)
                 OR (p.athlete_id IS NOT NULL AND public.physique_is_assigned_coach(p.athlete_id))
                 OR public.physique_is_admin() OR auth.role() = 'service_role'))
  );
DROP POLICY IF EXISTS "physique_program_days_write" ON public.physique_program_days;
CREATE POLICY "physique_program_days_write" ON public.physique_program_days
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.physique_programs p WHERE p.id = program_id
            AND (auth.uid() = p.created_by OR public.physique_is_admin() OR auth.role() = 'service_role'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.physique_programs p WHERE p.id = program_id
            AND (auth.uid() = p.created_by OR public.physique_is_admin() OR auth.role() = 'service_role'))
  );

-- ── physique_program_blocks ──
DROP POLICY IF EXISTS "physique_program_blocks_select" ON public.physique_program_blocks;
CREATE POLICY "physique_program_blocks_select" ON public.physique_program_blocks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.physique_program_days d
            JOIN public.physique_programs p ON p.id = d.program_id
            WHERE d.id = day_id
            AND (auth.uid() = p.created_by
                 OR (p.athlete_id IS NOT NULL AND auth.uid() = p.athlete_id)
                 OR (p.athlete_id IS NOT NULL AND public.physique_is_assigned_coach(p.athlete_id))
                 OR public.physique_is_admin() OR auth.role() = 'service_role'))
  );
DROP POLICY IF EXISTS "physique_program_blocks_write" ON public.physique_program_blocks;
CREATE POLICY "physique_program_blocks_write" ON public.physique_program_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.physique_program_days d
            JOIN public.physique_programs p ON p.id = d.program_id
            WHERE d.id = day_id
            AND (auth.uid() = p.created_by OR public.physique_is_admin() OR auth.role() = 'service_role'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.physique_program_days d
            JOIN public.physique_programs p ON p.id = d.program_id
            WHERE d.id = day_id
            AND (auth.uid() = p.created_by OR public.physique_is_admin() OR auth.role() = 'service_role'))
  );

-- ── physique_nutrition_plans ──
DROP POLICY IF EXISTS "physique_nutrition_plans_select" ON public.physique_nutrition_plans;
CREATE POLICY "physique_nutrition_plans_select" ON public.physique_nutrition_plans
  FOR SELECT USING (
    auth.uid() = created_by
    OR (athlete_id IS NOT NULL AND auth.uid() = athlete_id)
    OR (athlete_id IS NOT NULL AND public.physique_is_assigned_coach(athlete_id))
    OR public.physique_is_admin() OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_nutrition_plans_write" ON public.physique_nutrition_plans;
CREATE POLICY "physique_nutrition_plans_write" ON public.physique_nutrition_plans
  FOR ALL USING (auth.uid() = created_by OR public.physique_is_admin() OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = created_by OR public.physique_is_admin() OR auth.role() = 'service_role');

-- ── physique_nutrition_targets ──
DROP POLICY IF EXISTS "physique_nutrition_targets_select" ON public.physique_nutrition_targets;
CREATE POLICY "physique_nutrition_targets_select" ON public.physique_nutrition_targets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.physique_nutrition_plans p WHERE p.id = plan_id
            AND (auth.uid() = p.created_by
                 OR (p.athlete_id IS NOT NULL AND auth.uid() = p.athlete_id)
                 OR (p.athlete_id IS NOT NULL AND public.physique_is_assigned_coach(p.athlete_id))
                 OR public.physique_is_admin() OR auth.role() = 'service_role'))
  );
DROP POLICY IF EXISTS "physique_nutrition_targets_write" ON public.physique_nutrition_targets;
CREATE POLICY "physique_nutrition_targets_write" ON public.physique_nutrition_targets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.physique_nutrition_plans p WHERE p.id = plan_id
            AND (auth.uid() = p.created_by OR public.physique_is_admin() OR auth.role() = 'service_role'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.physique_nutrition_plans p WHERE p.id = plan_id
            AND (auth.uid() = p.created_by OR public.physique_is_admin() OR auth.role() = 'service_role'))
  );

-- ── physique_assignments ──
DROP POLICY IF EXISTS "physique_assignments_select" ON public.physique_assignments;
CREATE POLICY "physique_assignments_select" ON public.physique_assignments
  FOR SELECT USING (
    auth.uid() = athlete_id OR (coach_id IS NOT NULL AND auth.uid() = coach_id)
    OR public.physique_is_assigned_coach(athlete_id)
    OR public.physique_is_admin() OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_assignments_write" ON public.physique_assignments;
CREATE POLICY "physique_assignments_write" ON public.physique_assignments
  FOR ALL USING (
    (coach_id IS NOT NULL AND auth.uid() = coach_id) OR public.physique_is_admin() OR auth.role() = 'service_role'
  ) WITH CHECK (
    (coach_id IS NOT NULL AND auth.uid() = coach_id) OR public.physique_is_admin() OR auth.role() = 'service_role'
  );

-- ── physique_check_ins ──
DROP POLICY IF EXISTS "physique_check_ins_select" ON public.physique_check_ins;
CREATE POLICY "physique_check_ins_select" ON public.physique_check_ins
  FOR SELECT USING (
    auth.uid() = athlete_id
    OR public.physique_is_assigned_coach(athlete_id)
    OR public.physique_is_admin() OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_check_ins_insert_own" ON public.physique_check_ins;
CREATE POLICY "physique_check_ins_insert_own" ON public.physique_check_ins
  FOR INSERT WITH CHECK (auth.uid() = athlete_id);
DROP POLICY IF EXISTS "physique_check_ins_update" ON public.physique_check_ins;
CREATE POLICY "physique_check_ins_update" ON public.physique_check_ins
  FOR UPDATE USING (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin())
  WITH CHECK (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin());
DROP POLICY IF EXISTS "physique_check_ins_delete" ON public.physique_check_ins;
CREATE POLICY "physique_check_ins_delete" ON public.physique_check_ins
  FOR DELETE USING (auth.uid() = athlete_id OR public.physique_is_admin());

-- ── physique_measurements / bodyweight / workout_logs / sleep_logs / hydration_logs ──
-- (athlete owns writes; athlete + assigned coach + admin + service read)
DROP POLICY IF EXISTS "physique_measurements_select" ON public.physique_measurements;
CREATE POLICY "physique_measurements_select" ON public.physique_measurements
  FOR SELECT USING (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_measurements_write" ON public.physique_measurements;
CREATE POLICY "physique_measurements_write" ON public.physique_measurements
  FOR ALL USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "physique_bodyweight_select" ON public.physique_bodyweight;
CREATE POLICY "physique_bodyweight_select" ON public.physique_bodyweight
  FOR SELECT USING (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_bodyweight_write" ON public.physique_bodyweight;
CREATE POLICY "physique_bodyweight_write" ON public.physique_bodyweight
  FOR ALL USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "physique_workout_logs_select" ON public.physique_workout_logs;
CREATE POLICY "physique_workout_logs_select" ON public.physique_workout_logs
  FOR SELECT USING (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_workout_logs_write" ON public.physique_workout_logs;
CREATE POLICY "physique_workout_logs_write" ON public.physique_workout_logs
  FOR ALL USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "physique_sleep_logs_select" ON public.physique_sleep_logs;
CREATE POLICY "physique_sleep_logs_select" ON public.physique_sleep_logs
  FOR SELECT USING (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_sleep_logs_write" ON public.physique_sleep_logs;
CREATE POLICY "physique_sleep_logs_write" ON public.physique_sleep_logs
  FOR ALL USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "physique_hydration_logs_select" ON public.physique_hydration_logs;
CREATE POLICY "physique_hydration_logs_select" ON public.physique_hydration_logs
  FOR SELECT USING (auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin() OR auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_hydration_logs_write" ON public.physique_hydration_logs;
CREATE POLICY "physique_hydration_logs_write" ON public.physique_hydration_logs
  FOR ALL USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

-- ── physique_messages ──
DROP POLICY IF EXISTS "physique_messages_select" ON public.physique_messages;
CREATE POLICY "physique_messages_select" ON public.physique_messages
  FOR SELECT USING (
    auth.uid() = athlete_id OR (coach_id IS NOT NULL AND auth.uid() = coach_id)
    OR public.physique_is_admin() OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_messages_insert" ON public.physique_messages;
CREATE POLICY "physique_messages_insert" ON public.physique_messages
  FOR INSERT WITH CHECK (
    auth.uid() = athlete_id OR (coach_id IS NOT NULL AND auth.uid() = coach_id)
    OR auth.role() = 'service_role'  -- AI messages inserted by backend service_role
  );

-- ── physique_ai_reports ──
DROP POLICY IF EXISTS "physique_ai_reports_select" ON public.physique_ai_reports;
CREATE POLICY "physique_ai_reports_select" ON public.physique_ai_reports
  FOR SELECT USING (
    auth.uid() = athlete_id OR public.physique_is_assigned_coach(athlete_id)
    OR public.physique_is_admin() OR auth.role() = 'service_role'
  );
DROP POLICY IF EXISTS "physique_ai_reports_insert" ON public.physique_ai_reports;
CREATE POLICY "physique_ai_reports_insert" ON public.physique_ai_reports
  FOR INSERT WITH CHECK (auth.role() = 'service_role');  -- AI reports created server-side only
DROP POLICY IF EXISTS "physique_ai_reports_update" ON public.physique_ai_reports;
CREATE POLICY "physique_ai_reports_update" ON public.physique_ai_reports
  FOR UPDATE USING (public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin() OR auth.role() = 'service_role')
  WITH CHECK (public.physique_is_assigned_coach(athlete_id) OR public.physique_is_admin() OR auth.role() = 'service_role');

-- ── physique_audit_log (append-only: service_role insert; admin/service read; no update/delete) ──
DROP POLICY IF EXISTS "physique_audit_log_insert" ON public.physique_audit_log;
CREATE POLICY "physique_audit_log_insert" ON public.physique_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "physique_audit_log_select" ON public.physique_audit_log;
CREATE POLICY "physique_audit_log_select" ON public.physique_audit_log
  FOR SELECT USING (public.physique_is_admin() OR auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════════════
-- SECTION D — Storage buckets (private, signed-URL access only)
-- ════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('physique-videos', 'physique-videos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('physique-photos', 'physique-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies scoped to physique buckets only (additive, safe for Ada2AI).
-- A user may manage objects whose path begins with their own uid folder.
DROP POLICY IF EXISTS "physique_videos_owner_all" ON storage.objects;
CREATE POLICY "physique_videos_owner_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'physique-videos'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  ) WITH CHECK (
    bucket_id = 'physique-videos'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

DROP POLICY IF EXISTS "physique_photos_owner_all" ON storage.objects;
CREATE POLICY "physique_photos_owner_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'physique-photos'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  ) WITH CHECK (
    bucket_id = 'physique-photos'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

-- ════════════════════════════════════════════════════════════════════
-- SECTION E — Seed exercise library with the 15 CV-supported movements
--     Canonical reference data (movement_rule_key wires Phase 2 biomechanics)
-- ════════════════════════════════════════════════════════════════════
INSERT INTO public.physique_exercise_library (name, category, muscle_groups, movement_rule_key, is_cv_supported) VALUES
  ('Barbell Squat',          'compound',  ARRAY['quads','glutes','hamstrings'],          'squat',            true),
  ('Bench Press',            'compound',  ARRAY['chest','triceps','front_delts'],        'bench_press',      true),
  ('Deadlift',               'compound',  ARRAY['hamstrings','glutes','back','traps'],   'deadlift',         true),
  ('Shoulder Press',         'compound',  ARRAY['delts','triceps','upper_chest'],        'shoulder_press',   true),
  ('Pull-up',                'compound',  ARRAY['lats','biceps','upper_back'],           'pull_up',          true),
  ('Lat Pulldown',           'compound',  ARRAY['lats','biceps'],                        'lat_pulldown',     true),
  ('Cable Row',              'compound',  ARRAY['lats','rhomboids','biceps'],            'cable_row',        true),
  ('Biceps Curl',            'isolation', ARRAY['biceps'],                               'biceps_curl',      true),
  ('Triceps Pushdown',       'isolation', ARRAY['triceps'],                              'triceps_pushdown', true),
  ('Leg Press',              'compound',  ARRAY['quads','glutes','hamstrings'],          'leg_press',        true),
  ('Hack Squat',             'compound',  ARRAY['quads','glutes'],                       'hack_squat',       true),
  ('Lateral Raise',          'isolation', ARRAY['lateral_delts'],                        'lateral_raise',    true),
  ('Romanian Deadlift',      'compound',  ARRAY['hamstrings','glutes','lower_back'],     'romanian_deadlift',true),
  ('Hip Thrust',             'compound',  ARRAY['glutes','hamstrings'],                  'hip_thrust',       true),
  ('Walking Lunges',         'compound',  ARRAY['quads','glutes'],                       'walking_lunges',   true)
ON CONFLICT DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════════════
-- VERIFICATION CHECKLIST
--   [ ] profiles.user_type accepts 'athlete' and 'admin'
--   [ ] physique_is_admin() / physique_is_assigned_coach() functions exist
--   [ ] All 19 physique_* tables exist with RLS enabled
--   [ ] Athlete cannot read another athlete's bodyweight/measurements
--   [ ] Assigned coach can read their athlete's check-ins/logs
--   [ ] Non-assigned coach cannot read another coach's athlete data
--   [ ] physique_ai_reports insert blocked for anon/authenticated (service_role only)
--   [ ] physique_audit_log is append-only (no update/delete via RLS)
--   [ ] storage buckets physique-videos/physique-photos are private
--   [ ] 15 CV-supported exercises seeded with movement_rule_key
-- ════════════════════════════════════════════════════════════════════
