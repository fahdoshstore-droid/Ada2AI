/**
 * Analysis Service — Ada2AI
 *
 * Service layer for video_analyses table operations.
 * hook → service → supabase (always)
 *
 * Schema note: the jsonb column is called `analysis_data` (not `results`).
 */
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

// ── Types ──────────────────────────────────────────────────

export type AnalysisStatus = 'queued' | 'processing' | 'completed' | 'failed'

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
}

export interface VideoAnalysis {
  id: string
  uploaded_by: string
  video_url: string | null
  status: string | null
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

/** Create a new analysis record when a video is uploaded */
export async function createAnalysisRecord(
  uploadedBy: string,
  videoUrl: string
): Promise<VideoAnalysis> {
  const { data, error } = await supabase
    .from('video_analyses')
    .insert({ uploaded_by: uploadedBy, video_url: videoUrl, status: 'queued' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  trackEvent('analysis_queued', { uploadedBy })
  return data as VideoAnalysis
}

/** Update analysis status (for coach actions) */
export async function updateAnalysisStatus(
  id: string,
  status: AnalysisStatus
): Promise<void> {
  const { error } = await supabase
    .from('video_analyses')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  trackEvent('analysis_status_updated', { id, status })
}

/** Save analysis results + mark as completed */
export async function saveAnalysisResults(
  id: string,
  results: AnalysisResults
): Promise<void> {
  const { error } = await supabase
    .from('video_analyses')
    .update({ status: 'completed', analysis_data: results })
    .eq('id', id)

  if (error) throw new Error(error.message)
  trackEvent('analysis_completed', { id })
}

/** Fetch all pending analyses (for coach workspace) */
export async function getPendingAnalyses(): Promise<VideoAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('*')
    .in('status', ['queued', 'processing'])
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
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data as VideoAnalysis[]) ?? []
}