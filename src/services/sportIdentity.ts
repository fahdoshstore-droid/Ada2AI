import { supabase } from '../lib/supabase'

export interface SportIdentity { id: string; profile_id: string; sport_id: string }
export interface FootballPlayerIdentity { id: string; user_id: string | null }

/** Read existing identities only. A hidden row is unavailable, not proof of absence. */
export async function getSportIdentityForProfile(profileId: string): Promise<SportIdentity | null> {
  const { data, error } = await supabase.from('sport_identities')
    .select('id,profile_id,sport_id').eq('profile_id', profileId).maybeSingle()
  if (error) throw error
  if (data && data.profile_id !== profileId) throw new Error('Sport identity/profile mismatch')
  return data
}

/** No name/email lookup, auto-registration, or first-row selection for ambiguous accounts. */
export async function resolveFootballSportIdentity(sportId: string) {
  const { data: identity, error } = await supabase.from('sport_identities')
    .select('id,profile_id,sport_id').eq('sport_id', sportId).maybeSingle()
  if (error) throw error
  if (!identity) return null
  if (identity.sport_id !== sportId) throw new Error('Sport ID mismatch')
  const { data, error: playerError } = await supabase.from('players')
    .select('id,user_id').eq('user_id', identity.profile_id).limit(2)
  if (playerError) throw playerError
  const players = (data || []) as FootballPlayerIdentity[]
  if (players.some(player => player.user_id !== identity.profile_id)) throw new Error('Player/profile mismatch')
  if (players.length > 1) throw new Error('Ambiguous football player/profile mapping')
  return { identity: identity as SportIdentity, player: players[0] ?? null }
}

interface FootballAnalysis { id: string; match_id: string; analysis_data: { players?: Record<string, { track_id?: number | string }> } | null }
interface TrackLink {
  id: string; analysis_id: string; track_id: string; player_id: string | null;
  sport_identity_id: string | null; confidence: number | null; source: string | null;
  player: FootballPlayerIdentity | null; identity: SportIdentity | null;
}

/** Football tables only. Mapping is scoped to an analysis, never a global track ID. */
export async function getFootballTrackIdentities(matchId: string) {
  const { data, error } = await supabase.from('video_analyses')
    .select('id,match_id,analysis_data').eq('match_id', matchId)
  if (error) throw error
  const analyses = (data || []) as FootballAnalysis[]
  if (analyses.some(analysis => analysis.match_id !== matchId)) throw new Error('Analysis/match mismatch')
  if (!analyses.length) return []
  const { data: links, error: linkError } = await supabase.from('video_analysis_player_links')
    .select('id,analysis_id,track_id,player_id,sport_identity_id,confidence,source,player:players(id,user_id),identity:sport_identities(id,profile_id,sport_id)')
    .in('analysis_id', analyses.map(analysis => analysis.id)).returns<TrackLink[]>()
  if (linkError) throw linkError
  return analyses.flatMap(analysis => Object.values(analysis.analysis_data?.players || {}).flatMap(track => {
    if (track.track_id == null) return []
    const trackId = String(track.track_id)
    const matches = (links || []).filter(link => link.analysis_id === analysis.id && String(link.track_id) === trackId)
    const link = matches.length === 1 ? matches[0] : null
    const player = link?.player
    const identity = link?.identity
    const validPlayer = !!link?.source && !!player && link.player_id === player.id &&
      (!link.sport_identity_id || (!!identity && identity.id === link.sport_identity_id && player.user_id === identity.profile_id))
    return [{ analysisId: analysis.id, trackId, player: validPlayer ? player : null,
      identity: validPlayer && link?.sport_identity_id ? identity : null, source: validPlayer ? link?.source : null }]
  }))
}
