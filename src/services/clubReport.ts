/**
 * What the signed-in viewer's own team actually holds, for the match report.
 *
 * The report is one dashboard for every coach and every player, so nothing
 * here names a club. The team is derived from who is looking:
 *   coach  — the players actively linked to him (coaches → football_coach_players)
 *   player — his own record, and through its `club` his team's matches
 *   scout  — no team of his own; he gets the report without a team strip
 * The club name is read off those players, never hardcoded.
 */
import { supabase, type Player, type Match, type UserType } from '../lib/supabase'

export interface TeamPlayerIdentity { player: Player; sportId: string | null }

export interface TeamReportState {
  /** null when the viewer has no team (a scout, or an account not linked yet). */
  clubName: string | null
  players: TeamPlayerIdentity[]
  matches: Match[]
  /** Team matches that have a stored video analysis. */
  analysedMatchIds: string[]
  /** Evaluations of these players that this viewer is allowed to see. */
  evaluations: number
}

const EMPTY: TeamReportState = { clubName: null, players: [], matches: [], analysedMatchIds: [], evaluations: 0 }

async function playersForCoach(profileId: string): Promise<Player[]> {
  const { data: coach } = await supabase.from('coaches').select('id').eq('user_id', profileId).maybeSingle()
  if (!coach) return []
  const { data: links, error } = await supabase
    .from('football_coach_players').select('player_id').eq('coach_id', (coach as { id: string }).id).eq('status', 'active')
  if (error) throw new Error(error.message)
  const ids = ((links ?? []) as { player_id: string }[]).map(l => l.player_id)
  if (!ids.length) return []
  const { data, error: playersError } = await supabase.from('players').select('*').in('id', ids)
  if (playersError) throw new Error(playersError.message)
  return (data as Player[]) ?? []
}

async function playersForPlayer(profileId: string): Promise<Player[]> {
  const { data, error } = await supabase.from('players').select('*').eq('user_id', profileId).limit(1)
  if (error) throw new Error(error.message)
  return (data as Player[]) ?? []
}

/** The club most of the viewer's players belong to. */
function dominantClub(players: Player[]): string | null {
  const counts = new Map<string, number>()
  for (const p of players) if (p.club) counts.set(p.club, (counts.get(p.club) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

export async function getTeamReportState(profileId: string, role: UserType): Promise<TeamReportState> {
  if (role === 'scout') return EMPTY
  const players = role === 'coach' ? await playersForCoach(profileId) : await playersForPlayer(profileId)
  if (!players.length) return EMPTY

  const clubName = dominantClub(players)
  const profileIds = players.map(p => p.user_id).filter((id): id is string => !!id)

  // Club names are stored both bare ("الروضة") and prefixed ("نادي الهلال");
  // match on the bare name so either spelling of a fixture is found.
  const bare = clubName?.replace(/^نادي\s+/, '') ?? null

  const [identities, matches, evaluations] = await Promise.all([
    profileIds.length
      ? supabase.from('sport_identities').select('profile_id,sport_id').in('profile_id', profileIds)
      : Promise.resolve({ data: [] }),
    bare
      ? supabase.from('matches').select('*').or(`home_team.ilike.%${bare}%,away_team.ilike.%${bare}%`).order('match_date', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    supabase.from('scout_reports').select('id', { count: 'exact', head: true }).in('player_id', players.map(p => p.id)),
  ])
  if (matches.error) throw new Error(matches.error.message)

  // RLS may hide identities from this viewer; that is not an error.
  const sportIdByProfile = new Map(
    ((identities.data ?? []) as { profile_id: string; sport_id: string }[]).map(r => [r.profile_id, r.sport_id]),
  )

  const teamMatches = (matches.data as Match[]) ?? []
  let analysedMatchIds: string[] = []
  if (teamMatches.length) {
    const { data } = await supabase.from('video_analyses').select('match_id').in('match_id', teamMatches.map(m => m.id))
    analysedMatchIds = [...new Set(((data ?? []) as { match_id: string | null }[]).map(r => r.match_id).filter((id): id is string => !!id))]
  }

  return {
    clubName,
    players: players.map(player => ({ player, sportId: player.user_id ? sportIdByProfile.get(player.user_id) ?? null : null })),
    matches: teamMatches,
    analysedMatchIds,
    evaluations: evaluations.count ?? 0,
  }
}
