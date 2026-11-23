/**
 * savedAnalyses.ts — completed video analyses stored in video_analyses.analysis_data.
 *
 * Read straight from Supabase so a saved analysis is visible on any link,
 * without the local video-analysis service running. Only fields the pipeline
 * actually wrote are returned; nothing is derived or estimated here.
 */
import { supabase } from '../lib/supabase'

export interface FormationPoint { x: number; y: number; track_id: number }

export interface SavedAnalysis {
  id: string
  title: string | null
  match: {
    home_team: string | null
    away_team: string | null
    match_date: string | null
    competition: string | null
    home_score: number | null
    away_score: number | null
  } | null
  source: {
    channel?: string
    source_title?: string
    source_date?: string
    youtube_video_id?: string
    segment_start_seconds?: number
    segment_duration_seconds?: number
  } | null
  method: {
    model?: string
    tracking?: string
    frame_stride?: number
    frames_processed?: number
    processing_time_seconds?: number
  } | null
  video: { width?: number; height?: number; fps?: number; duration?: number } | null
  formation: { team1: FormationPoint[]; team2: FormationPoint[] } | null
  playersTracked: number
  calibrated: boolean
  identityConfirmed: boolean
  notAvailable: string[]
}

interface Row {
  id: string
  title: string | null
  analysis_data: Record<string, unknown> | null
  matches: SavedAnalysis['match']
}

const pick = <T,>(v: unknown): T | null => (v && typeof v === 'object' ? (v as T) : null)

export async function getSavedAnalyses(): Promise<SavedAnalysis[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('id, title, analysis_data, matches(home_team, away_team, match_date, competition, home_score, away_score)')
    .eq('status', 'مكتمل')
    .not('analysis_data', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as Row[])
    .filter(r => r.analysis_data && Object.keys(r.analysis_data).length > 0)
    .map(r => {
      const d = r.analysis_data as Record<string, unknown>
      const mi = pick<Record<string, unknown>>(d.match_intelligence)
      const dq = pick<Record<string, unknown>>(mi?.data_quality)
      const prov = pick<Record<string, unknown>>(d.persistence_provenance)
      const formation = pick<{ team1?: FormationPoint[]; team2?: FormationPoint[] }>(d.formation)
      const players = pick<Record<string, unknown>>(d.players)
      return {
        id: r.id,
        title: r.title,
        match: r.matches ?? null,
        source: pick(d.acceptance_source),
        method: pick(d.analysis_info),
        video: pick(d.video_info),
        formation: formation ? { team1: formation.team1 ?? [], team2: formation.team2 ?? [] } : null,
        playersTracked: players ? Object.keys(players).length : 0,
        calibrated: Boolean(dq?.calibrated ?? prov?.calibration_validated),
        identityConfirmed: Boolean(dq?.player_identity_confirmed ?? prov?.player_identity_confirmed),
        notAvailable: Array.isArray(dq?.not_available_metrics) ? (dq!.not_available_metrics as string[]) : [],
      }
    })
}
