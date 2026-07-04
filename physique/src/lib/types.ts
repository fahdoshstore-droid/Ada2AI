/**
 * TypeScript domain models for Ada2Physique.
 * Mirrors supabase/migrations/006_ada2physique_phase1.sql (physique_* tables)
 * and backend/physique/schemas.py (AI API contracts). No fake data — these are
 * the shapes of real Supabase rows and real backend responses.
 */

// ── Roles / enums ─────────────────────────────────────────────────────
export type Role = "athlete" | "coach" | "admin";

export type Sex = "male" | "female";

export type CompetitionCategory =
  | "none"
  | "classic_physique"
  | "mens_open"
  | "mens_physique"
  | "212"
  | "bikini"
  | "figure"
  | "womens_physique"
  | "wellness";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "competitor";

export type Goal = "bulk" | "cut" | "recomp" | "maintain" | "prep" | "offseason";

export type ProgramFocus =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full_body"
  | "rest"
  | "cardio"
  | "custom";

export type AssignmentType = "program" | "nutrition";

export type ReportKind =
  | "check_in"
  | "exercise"
  | "physique"
  | "progress"
  | "recovery"
  | "nutrition";

export type SenderType = "athlete" | "coach" | "ai";

export type CheckInStatus = "draft" | "submitted" | "reviewed";

// ── Row types (Supabase) ──────────────────────────────────────────────
export interface Athlete {
  athlete_id: string;
  coach_id: string | null;
  display_name: string | null;
  date_of_birth: string | null;
  sex: Sex | null;
  height_cm: number | null;
  competition_category: CompetitionCategory | null;
  experience_level: ExperienceLevel | null;
  goal: Goal | null;
  equipment: string[];
  training_frequency: number | null;
  weak_body_parts: string[];
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  coach_id: string;
  display_name: string | null;
  bio: string | null;
  specialties: string[];
  years_experience: number | null;
  competition_background: string | null;
  avatar_url: string | null;
  is_accepting_athletes: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoachAthlete {
  id: string;
  coach_id: string;
  athlete_id: string;
  status: "active" | "paused" | "ended";
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  name_ar: string | null;
  category: "compound" | "isolation" | "accessory" | "mobility" | "cardio" | null;
  muscle_groups: string[];
  movement_rule_key: string | null;
  equipment: string | null;
  video_demo_url: string | null;
  instructions: string | null;
  is_cv_supported: boolean;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  created_by: string | null;
  athlete_id: string | null;
  name: string;
  description: string | null;
  goal: string | null;
  duration_weeks: number | null;
  days_per_week: number | null;
  is_template: boolean;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ProgramDay {
  id: string;
  program_id: string;
  day_number: number;
  name: string | null;
  focus: ProgramFocus | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramBlock {
  id: string;
  day_id: string;
  exercise_id: string | null;
  exercise_name: string;
  order_index: number;
  sets: number | null;
  reps: string | null;
  rpe: number | null;
  rest_seconds: number | null;
  tempo: string | null;
  technique_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionPlan {
  id: string;
  created_by: string | null;
  athlete_id: string | null;
  name: string;
  goal: Goal | null;
  protein_ratio_pct: number | null;
  carb_ratio_pct: number | null;
  fat_ratio_pct: number | null;
  meal_timing_notes: string | null;
  is_template: boolean;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  coach_id: string | null;
  athlete_id: string;
  assignment_type: AssignmentType;
  program_id: string | null;
  nutrition_plan_id: string | null;
  starts_on: string;
  ends_on: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  athlete_id: string;
  coach_id: string | null;
  check_in_date: string;
  week_number: number | null;
  bodyweight_kg: number | null;
  bodyfat_pct: number | null;
  measurements: Record<string, number> | null;
  photo_urls: string[];
  energy_level: number | null;
  hunger_level: number | null;
  sleep_hours: number | null;
  athlete_notes: string | null;
  coach_notes: string | null;
  ai_report_id: string | null;
  status: CheckInStatus;
  created_at: string;
  updated_at: string;
}

export interface Measurement {
  id: string;
  athlete_id: string;
  measured_on: string;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  calf_cm: number | null;
  neck_cm: number | null;
  forearm_cm: number | null;
  shoulder_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bodyweight {
  id: string;
  athlete_id: string;
  weighed_at: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutLog {
  id: string;
  athlete_id: string;
  program_id: string | null;
  day_id: string | null;
  exercise_id: string | null;
  exercise_name: string;
  logged_at: string;
  set_number: number | null;
  weight_kg: number | null;
  reps: number | null;
  rpe: number | null;
  is_pr: boolean;
  duration_seconds: number | null;
  video_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SleepLog {
  id: string;
  athlete_id: string;
  slept_on: string;
  duration_hours: number | null;
  quality_score: number | null;
  deep_sleep_hours: number | null;
  rem_sleep_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HydrationLog {
  id: string;
  athlete_id: string;
  logged_on: string;
  water_ml: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  athlete_id: string;
  coach_id: string | null;
  sender_type: SenderType;
  sender_id: string | null;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AiReport {
  id: string;
  athlete_id: string;
  report_kind: ReportKind;
  source_ref: string | null;
  title: string | null;
  summary: string | null;
  details: Record<string, unknown>;
  coach_reviewed: boolean;
  coach_feedback: string | null;
  model_used: string | null;
  tokens_used: number | null;
  created_at: string;
  updated_at: string;
}

// ── Backend API contracts (mirror backend/physique/schemas.py) ────────
export interface MeResponse {
  uid: string;
  email: string | null;
  user_type: string | null;
  role: Role | null;
  onboarded: boolean;
  profile: Record<string, unknown> | null;
}

export interface CoachChatResponse {
  reply: string;
  suggestions: string[];
  report_id: string | null;
  model: string;
}

export interface NutritionTargets {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
  meal_timing_notes: string;
}

export interface NutritionPlanResponse {
  targets: NutritionTargets;
  rationale: string;
  model: string;
}

export interface GeneratedBlock {
  exercise_name: string;
  sets: number;
  reps: string;
  rpe: number;
  rest_seconds: number;
  tempo: string;
  technique_notes: string;
}

export interface GeneratedDay {
  day_number: number;
  name: string;
  focus: string;
  blocks: GeneratedBlock[];
}

export interface ProgramGenerateResponse {
  name: string;
  goal: string;
  duration_weeks: number;
  days: GeneratedDay[];
  rationale: string;
  model: string;
}

export interface AdminStatsResponse {
  athletes: number;
  coaches: number;
  active_assignments: number;
  programs: number;
  nutrition_plans: number;
  check_ins_30d: number;
  ai_reports_30d: number;
}

export interface SignUploadRequest {
  bucket: string;
  content_type?: string;
  ext: string;
  label?: string;
}

export interface SignUploadResponse {
  path: string;
  signed_url: string;
  expires_in: number;
}

export interface SignedUrlRequest {
  bucket: string;
  path: string;
}

export interface SignedUrlResponse {
  signed_url: string;
  expires_in: number;
}


/** Parse the photo label (front|side|back) from a stored object path
 *  laid out as "<uid>/<label>-<uuid>.<ext>". Falls back to "photo". */
export function photoLabelFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  const prefix = base.split("-")[0] ?? "";
  return prefix || "photo";
}
