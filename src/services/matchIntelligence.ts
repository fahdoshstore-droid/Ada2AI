/**
 * matchIntelligence.ts — saved match-analysis reports from the vision API.
 *
 * Endpoints (existing, read-only):
 *   GET /matches                    → { matches: MatchSummary[] }
 *   GET /intelligence/match/{id}    → MatchReport ({ status, match_id, … })
 *
 * A match is eligible only when its report call returns HTTP 200 with
 * status "success" AND the report's match_id equals the requested id.
 * Nothing here triggers an analysis.
 */
import { yoloEndpoint, yoloFetch } from '../lib/yoloApi'

export interface MatchSummary {
  id: string
  home_team?: string | null
  away_team?: string | null
  match_date?: string | null
  venue?: string | null
  competition?: string | null
  season?: string | null
  is_completed?: boolean
  has_replay?: boolean
}

export interface Measured { value?: number | string | null; provenance?: string; confidence?: number; evidence?: string; name?: string; unit?: string }

export interface ReportPlayer {
  track_id?: number
  team?: number | null
  confidence?: number
  match_impact?: string
  physical?: Record<string, Measured>
  ' weaknesses'?: string[]
  weaknesses?: string[]
}

export interface ExternalGoal { team?: string; minute?: string | number; player?: string; provenance?: string }

export interface MatchReport {
  status: string
  match_id?: string
  run_id?: string | null
  calibration?: { label?: string; calibrated?: boolean }
  data_quality?: {
    calibrated?: boolean
    player_identity_confirmed?: boolean
    not_available_metrics?: string[]
    tracking_quality?: { provenance?: string; person_tracks?: number; mean_detection_confidence?: number }
    positioning_evidence?: { note?: string; status?: string }
  }
  event_provenance?: { total_events?: number; provenance_counts?: Record<string, number> }
  coach?: { tactical_shape?: string; starting_formation?: string; confidence?: number; provenance?: string }
  teams?: Record<string, { team_label?: string; player_count?: number; total_events?: number }>
  players?: Record<string, ReportPlayer>
  external_match_data?: {
    goals?: { first_half?: ExternalGoal[]; second_half?: ExternalGoal[] }
    formations?: Record<string, string>
    sources?: { url: string; name?: string }[]
    provenance?: string
  }
}

export class ApiAuthError extends Error {}
export class ApiBackendError extends Error {}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<{ status: number; body: T | null }> {
  let response: Response
  try {
    response = await yoloFetch(yoloEndpoint(path), { signal })
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err
    throw new ApiBackendError('network')
  }
  let body: T | null = null
  try { body = (await response.json()) as T } catch { body = null }
  if (response.status === 401 || response.status === 403) throw new ApiAuthError(String(response.status))
  return { status: response.status, body }
}

export async function listMatches(signal?: AbortSignal): Promise<MatchSummary[]> {
  const { status, body } = await getJson<{ matches?: MatchSummary[] }>('/matches', signal)
  if (status !== 200 || !body) throw new ApiBackendError(String(status))
  return Array.isArray(body.matches) ? body.matches.filter(m => !!m?.id) : []
}

export type ReportResult =
  | { kind: 'ok'; report: MatchReport }
  | { kind: 'unavailable' }          // 404 or status no_data / not_available
  | { kind: 'incomplete' }           // a status other than success / no_data
  | { kind: 'mismatch' }             // report belongs to another match

export async function getMatchReport(matchId: string, signal?: AbortSignal): Promise<ReportResult> {
  const { status, body } = await getJson<MatchReport>(`/intelligence/match/${encodeURIComponent(matchId)}`, signal)
  if (status === 404) return { kind: 'unavailable' }
  if (status !== 200 || !body) throw new ApiBackendError(String(status))
  if (body.status === 'success') {
    return body.match_id === matchId ? { kind: 'ok', report: body } : { kind: 'mismatch' }
  }
  if (body.status === 'no_data' || body.status === 'not_available') return { kind: 'unavailable' }
  return { kind: 'incomplete' }
}

export interface EligibleReport { match: MatchSummary; report: MatchReport }

/** Matches whose saved report loads successfully. Per-match failures other
 *  than auth/backend are simply not eligible; an auth or backend failure on
 *  every call is surfaced so the UI can tell it apart from "no reports". */
export async function listEligibleReports(signal?: AbortSignal): Promise<EligibleReport[]> {
  const matches = await listMatches(signal)
  const settled = await Promise.allSettled(matches.map(m => getMatchReport(m.id, signal)))
  const authFailures = settled.filter(s => s.status === 'rejected' && s.reason instanceof ApiAuthError).length
  const backendFailures = settled.filter(s => s.status === 'rejected' && !(s.reason instanceof ApiAuthError)).length
  if (matches.length > 0 && authFailures === matches.length) throw new ApiAuthError('all')
  if (matches.length > 0 && backendFailures === matches.length) throw new ApiBackendError('all')
  const out: EligibleReport[] = []
  settled.forEach((s, i) => {
    if (s.status === 'fulfilled' && s.value.kind === 'ok') out.push({ match: matches[i], report: s.value.report })
  })
  return out
}
