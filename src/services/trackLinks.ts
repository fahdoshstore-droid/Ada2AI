/**
 * Track → player identity links.
 *
 * Until a track is linked, every number the vision pipeline produces hangs on
 * a temporary `track_id`, and the engine says so itself: "track_id is NOT
 * player_id — identity not confirmed". Writing a row here is what turns a
 * moving shape into a named player, so the heat map, distance and minutes can
 * be attributed and accumulate on that player's Sport ID.
 *
 * RLS: public.video_analysis_player_links is readable and writable only by a
 * profile whose user_type is 'coach' or 'admin'.
 *
 * The reader in services/sportIdentity.ts only trusts a link that carries a
 * `source`, whose player_id matches, and whose sport_identity_id (when set)
 * belongs to that player's profile — so all three are written together here.
 */
import { supabase } from '../lib/supabase'

/** One tracked object inside analysis_data.players, keyed by track id. */
export interface AnalysisTrack {
  analysisId: string
  trackId: string
  team: number | null
  framesVisible: number | null
  averageSpeedMps: number | null
  maxSpeedMps: number | null
  totalDistanceMeters: number | null
}

export interface ExistingLink {
  id: string
  analysis_id: string
  track_id: string
  player_id: string | null
  sport_identity_id: string | null
  source: string | null
  confidence: number | null
}

interface AnalysisRow {
  id: string
  match_id: string | null
  analysis_data: {
    players?: Record<string, {
      team?: number | null
      frames_visible?: number | null
      average_speed_mps?: number | null
      max_speed_mps?: number | null
      total_distance_meters?: number | null
    }>
  } | null
}

/** Every track the pipeline produced for a match, flattened across analyses. */
export async function getTracksForMatch(matchId: string): Promise<AnalysisTrack[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('id,match_id,analysis_data')
    .eq('match_id', matchId)

  if (error) throw new Error(error.message)

  return ((data as AnalysisRow[]) ?? [])
    .filter(row => row.match_id === matchId)
    .flatMap(row =>
      Object.entries(row.analysis_data?.players ?? {}).map(([trackId, t]) => ({
        analysisId: row.id,
        trackId,
        team: t?.team ?? null,
        framesVisible: t?.frames_visible ?? null,
        averageSpeedMps: t?.average_speed_mps ?? null,
        maxSpeedMps: t?.max_speed_mps ?? null,
        totalDistanceMeters: t?.total_distance_meters ?? null,
      })),
    )
    .sort((a, b) => (b.framesVisible ?? 0) - (a.framesVisible ?? 0))
}

export async function getLinksForAnalyses(analysisIds: string[]): Promise<ExistingLink[]> {
  if (!analysisIds.length) return []
  const { data, error } = await supabase
    .from('video_analysis_player_links')
    .select('id,analysis_id,track_id,player_id,sport_identity_id,source,confidence')
    .in('analysis_id', analysisIds)

  if (error) throw new Error(error.message)
  return (data as ExistingLink[]) ?? []
}

/**
 * The player's Sport ID row, when this coach is allowed to see it. RLS may
 * hide it; that is not an error, and the link is still valid without it.
 */
async function identityIdForPlayerProfile(profileId: string | null | undefined): Promise<string | null> {
  if (!profileId) return null
  const { data, error } = await supabase
    .from('sport_identities')
    .select('id,profile_id')
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error || !data) return null
  return data.profile_id === profileId ? data.id : null
}

export interface LinkInput {
  analysisId: string
  trackId: string
  playerId: string
  /** players.user_id — used to attach the Sport ID when visible. */
  playerProfileId?: string | null
  existingLinkId?: string | null
}

export async function linkTrackToPlayer(input: LinkInput): Promise<ExistingLink> {
  const sportIdentityId = await identityIdForPlayerProfile(input.playerProfileId)

  const row = {
    analysis_id: input.analysisId,
    track_id: input.trackId,
    player_id: input.playerId,
    sport_identity_id: sportIdentityId,
    // A human decision, not a model's guess — recorded as such, with full
    // confidence, so the reader can tell it apart from an automated match.
    source: 'coach_manual',
    confidence: 1,
  }

  const query = input.existingLinkId
    ? supabase.from('video_analysis_player_links').update(row).eq('id', input.existingLinkId)
    : supabase.from('video_analysis_player_links').insert(row)

  const { data, error } = await query.select().single()
  if (error) throw new Error(error.message)
  return data as ExistingLink
}

export async function unlinkTrack(linkId: string): Promise<void> {
  const { error } = await supabase.from('video_analysis_player_links').delete().eq('id', linkId)
  if (error) throw new Error(error.message)
}

/**
 * Match ids that actually have a stored analysis. Only one of the eight
 * matches in the database has one (المحرق × الرفاع, 9 tracks), so without
 * this the coach picks a match and gets an empty panel seven times out of
 * eight — the dropdown would be promising analysis that doesn't exist.
 */
export async function getAnalysedMatchIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('match_id')
    .not('match_id', 'is', null)
  if (error) throw new Error(error.message)
  const ids = (data ?? []).map(row => (row as { match_id: string | null }).match_id).filter((id): id is string => !!id)
  return Array.from(new Set(ids))
}
