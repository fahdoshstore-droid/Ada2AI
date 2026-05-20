/**
 * Analysis Service — Ada2AI
 *
 * Service layer for video_analyses table operations.
 * hook → service → supabase (always)
 *
 * CRITICAL: DB CHECK constraint `video_analyses_status_check`
 * only allows Arabic values: 'قيد المعالجة', 'مكتمل', 'فشل'
 * We map between English StatusKey (UI) ↔ Arabic values (DB).
 *
 * CRITICAL: `title` and `date` columns are NOT NULL.
 * `analysis_data` is the jsonb column (NOT `results`).
 */
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'
import type { StatusKey } from '../lib/tokens'

// ── Arabic ↔ English Status Mapper ──────────────────────────────
// DB stores Arabic; UI code uses English StatusKey for StatusBadge

// pending is only a UI state (same as queued in DB); excluded from DB_MAP
// but Record<StatusKey, string> requires it. Map to the same Arabic as 'queued'.
const DB_STATUS_MAP: Record<StatusKey, string> = {
  queued: 'قيد المعالجة',
  processing: 'قيد المعالجة',
  completed: 'مكتمل',
  failed: 'فشل',
  pending: 'قيد المعالجة',
}

const DB_TO_UI: Record<string, StatusKey> = {
  'قيد المعالجة': 'processing',   // same UI for both queued+processing
  'مكتمل': 'completed',
  'فشل': 'failed',
}

/** Convert English StatusKey → Arabic DB value */
export function toDbStatus(key: StatusKey): string {
  return DB_STATUS_MAP[key]
}

/** Convert Arabic DB value → English UI StatusKey */
export function toUiStatus(dbVal: string | null): StatusKey {
  if (!dbVal) return 'queued'
  return DB_TO_UI[dbVal] ?? 'queued'
}

// ── Types ──────────────────────────────────────────────────

export interface AnalysisResults {
  touches_estimate?: number
  speed_estimate_kmh?: number
  movement_zones?: {
    zone: string
    percentage: number
  }[]
  activity_score?: number
  possession_involvement?: number
  notes?: string
  // YOLO backend fields (v1)
  heatmap?: number[][]
  total_detections?: number
  duration_seconds?: number
  version?: string
  error?: string
}

export interface VideoAnalysis {
  id: string
  uploaded_by: string
  video_url: string | null
  status: string | null       // Arabic DB value — use toUiStatus() for UI
  analysis_data: AnalysisResults | null
  title: string | null
  match: string | null
  match_id: string | null
  date: string | null
  duration: string | null
  thumbnail_url: string | null
  created_at: string | null
  updated_at: string | null
}

// ── Queries ─────────────────────────────────────────────────

/** Fetch all analyses for a specific player (by their profile id) */
export async function getPlayerAnalyses(
  uploadedBy: string
): Promise<VideoAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('*')
    .eq('uploaded_by', uploadedBy)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(error.message)
  return (data as VideoAnalysis[]) ?? []
}

/**
 * Create a new analysis record when a video is uploaded.
 * NOTE: title & date are NOT NULL in DB — must always provide them.
 * Initial status is 'قيد المعالجة' (DB Arabic for "in progress").
 */
export async function createAnalysisRecord(
  uploadedBy: string,
  videoUrl: string,
  overrides?: { title?: string; date?: string }
): Promise<VideoAnalysis> {
  const { data, error } = await supabase
    .from('video_analyses')
    .insert({
      uploaded_by: uploadedBy,
      video_url: videoUrl,
      status: 'قيد المعالجة',
      title: overrides?.title ?? 'تحليل فيديو',
      date: overrides?.date ?? new Date().toISOString().slice(0, 10),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  trackEvent('analysis_queued', { uploadedBy })
  return data as VideoAnalysis
}

/** Update analysis status (for coach actions) — accepts English StatusKey */
export async function updateAnalysisStatus(
  id: string,
  status: StatusKey
): Promise<void> {
  const dbStatus = toDbStatus(status)
  const { error } = await supabase
    .from('video_analyses')
    .update({ status: dbStatus })
    .eq('id', id)

  if (error) throw new Error(error.message)
  trackEvent('analysis_status_updated', { id, status: dbStatus })
}

/** Save analysis results + mark as completed */
export async function saveAnalysisResults(
  id: string,
  results: AnalysisResults
): Promise<void> {
  const { error } = await supabase
    .from('video_analyses')
    .update({ status: 'مكتمل', analysis_data: results })
    .eq('id', id)

  if (error) throw new Error(error.message)
  trackEvent('analysis_completed', { id })
}

/** Fetch all pending/processing analyses (for coach workspace) */
export async function getPendingAnalyses(): Promise<VideoAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('*')
    .in('status', ['قيد المعالجة'])
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data as VideoAnalysis[]) ?? []
}

/** Fetch completed analyses (for history view) */
export async function getCompletedAnalyses(
  limit = 10
): Promise<VideoAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('*')
    .eq('status', 'مكتمل')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data as VideoAnalysis[]) ?? []
}

/** Fetch failed analyses */
export async function getFailedAnalyses(): Promise<VideoAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('*')
    .eq('status', 'فشل')
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(error.message)
  return (data as VideoAnalysis[]) ?? []
}