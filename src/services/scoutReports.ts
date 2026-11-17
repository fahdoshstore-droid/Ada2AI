/**
 * Scout reports — the real storage for the unified evaluation report.
 *
 * `public.scout_reports` was built for exactly this form. Two things are
 * enforced server-side and must NOT be duplicated here:
 *   • trg_scout_reports_before_write validates `ratings`: the four pillars,
 *     at most 8 criteria each, every value an integer 1-5.
 *   • The same trigger computes `total_score` (sum / 160 * 100). We never
 *     send it — the database is the single source of truth for the score.
 *
 * RLS: insert requires auth.uid() = scout_id AND the profile's user_type to
 * be 'scout'; select/update/delete are limited to the report's own author.
 */
import { supabase } from '../lib/supabase'
import { AXES } from '../components/evaluation/axes'

export interface ScoutReportInput {
  scoutId: string
  playerId: string | null
  playerName: string
  birthYear?: number | null
  club?: string | null
  position?: string | null
  pitchPositions: string[]
  targetCategory?: string | null
  discoveryDate: string
  match?: string | null
  /** scores[axisIndex][itemIndex], 1-5, in AXES order. */
  scores: number[][]
  axisNotes: string[]
  opinion?: string | null
  scoutName?: string | null
}

export interface ScoutReportRow {
  id: string
  scout_id: string
  player_id: string | null
  player_name: string
  total_score: number | null
  ratings: Record<string, Record<string, number>> | null
  notes: Record<string, string> | null
  scout_opinion: string | null
  discovery_date: string | null
  created_at: string | null
}

/** Shape the grid into the exact jsonb the write trigger validates. */
export function toRatings(scores: number[][]): Record<string, Record<string, number>> {
  return Object.fromEntries(
    AXES.map((axis, ai) => [
      axis.key,
      Object.fromEntries(axis.items.map((item, ii) => [item, scores[ai][ii]])),
    ]),
  )
}

export function toNotes(axisNotes: string[]): Record<string, string> {
  return Object.fromEntries(
    AXES.map((axis, ai) => [axis.key, axisNotes[ai]?.trim() ?? ''])
      .filter(([, note]) => note),
  ) as Record<string, string>
}

export async function createScoutReport(input: ScoutReportInput): Promise<ScoutReportRow> {
  const { data, error } = await supabase
    .from('scout_reports')
    .insert({
      scout_id: input.scoutId,
      player_id: input.playerId,
      player_name: input.playerName,
      birth_year: input.birthYear ?? null,
      club: input.club ?? null,
      position: input.position ?? null,
      pitch_positions: input.pitchPositions,
      target_category: input.targetCategory || null,
      discovery_date: input.discoveryDate,
      match: input.match || null,
      ratings: toRatings(input.scores),
      notes: toNotes(input.axisNotes),
      scout_opinion: input.opinion || null,
      scout_name: input.scoutName || null,
      // total_score is computed by trg_scout_reports_before_write.
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ScoutReportRow
}

/** The author's own reports for one player (RLS limits this to their own). */
export async function getScoutReportsForPlayer(playerId: string): Promise<ScoutReportRow[]> {
  const { data, error } = await supabase
    .from('scout_reports')
    .select('*')
    .eq('player_id', playerId)
    .order('discovery_date', { ascending: false, nullsFirst: false })
    .limit(20)

  if (error) throw new Error(error.message)
  return (data as ScoutReportRow[]) ?? []
}
