/**
 * playerMovement.ts — where a squad player actually moved in an analysed match.
 *
 * Chain (all real data, nothing estimated):
 *   video_analysis_player_links (coach linked track → player)
 *   → match_calibrations (homography + reprojection error for that analysis)
 *   → analysis_data.graph.players[track].positional_history (camera-frame samples)
 *   → projectHistory() → pitch metres.
 *
 * Every break in that chain is returned as a status, so the UI can say why
 * there is no map instead of drawing a plausible-looking one.
 */
import { supabase } from '../lib/supabase'
import {
  getCalibration, getTrackHistories, projectHistory,
  MAX_HEATMAP_ERROR_METERS, type ProjectedPoint,
} from './calibration'

export type MovementStatus =
  | 'not_linked'        // the coach has not linked this player to any track
  | 'no_calibration'    // the match was never calibrated
  | 'error_too_high'    // calibration exists but misplaces points by > 3 m (or unknown)
  | 'no_positions'      // calibrated, but the track has no stored positions
  | 'ok'

export interface PlayerMovement {
  status: MovementStatus
  analysisId: string | null
  trackId: string | null
  errorMeters: number | null
  validated: boolean
  /** Pitch metres from the centre spot, in time order. */
  points: ProjectedPoint[]
  dropped: number
}

const EMPTY: Omit<PlayerMovement, 'status'> = {
  analysisId: null, trackId: null, errorMeters: null, validated: false, points: [], dropped: 0,
}

export async function getPlayerMovement(playerId: string): Promise<PlayerMovement> {
  const { data: link, error } = await supabase
    .from('video_analysis_player_links')
    .select('analysis_id, track_id, created_at')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!link) return { status: 'not_linked', ...EMPTY }

  const analysisId = link.analysis_id as string
  const trackId = String(link.track_id)
  const base = { ...EMPTY, analysisId, trackId }

  const calibration = await getCalibration(analysisId)
  if (!calibration) return { status: 'no_calibration', ...base }

  const errorMeters = calibration.reprojection_error_meters
  const withCal = { ...base, errorMeters, validated: calibration.validated }
  if (errorMeters == null || !Number.isFinite(errorMeters) || errorMeters > MAX_HEATMAP_ERROR_METERS) {
    return { status: 'error_too_high', ...withCal }
  }

  const histories = await getTrackHistories(analysisId)
  const track = histories.find(t => String(t.trackId) === trackId)
  if (!track || track.history.length === 0) return { status: 'no_positions', ...withCal }

  const ordered = [...track.history].sort((a, b) => a.frame - b.frame)
  const { points, dropped } = projectHistory(ordered, calibration.homography)
  if (points.length === 0) return { status: 'no_positions', ...withCal, dropped }
  return { status: 'ok', ...withCal, points, dropped }
}
