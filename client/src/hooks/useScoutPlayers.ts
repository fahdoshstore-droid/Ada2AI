/**
 * useScoutPlayers - Fetch public players for scout discovery
 * Joins players with profiles and latest evaluations for complete scouting data
 */
import { useQuery } from '@tanstack/react-query'
import { supabase, type Player, type Profile, type Evaluation } from '@/lib/supabase'

export interface ScoutPlayer extends Player {
  profile?: Profile
  latestEvaluation?: Evaluation | null
  // Computed score: (speed*0.25 + stamina*0.25 + technique*0.25 + rating*0.25)
  score?: number
  speed?: number
  stamina?: number
  technique?: number
  agility?: number
  rating?: number
  badge?: string
  badge_color?: string
  name?: string
  name_ar?: string
  region?: string  // from profiles.region or players
  academy_name?: string
  is_public?: boolean
  profile_complete?: boolean
  is_active?: boolean
  // match_stats aggregation
  totalGoals?: number
  totalAssists?: number
  totalMatchesPlayed?: number
}

/** Compute scout score from player attributes */
export function computeScore(p: { speed?: number; stamina?: number; technique?: number; rating?: number }): number {
  const speed = p.speed ?? 0
  const stamina = p.stamina ?? 0
  const technique = p.technique ?? 0
  const rating = p.rating ?? 0
  const total = speed + stamina + technique + rating
  if (total === 0) return rating
  return Math.round((speed * 0.25 + stamina * 0.25 + technique * 0.25 + rating * 0.25) * 10) / 10
}

export function useScoutPlayers() {
  const {
    data: players,
    error,
    isLoading,
    isError,
  } = useQuery<ScoutPlayer[]>({
    queryKey: ['scoutPlayers'],
    queryFn: async () => {
      // STEP 1: Fetch players with profile_complete=true, is_public=true
      const { data, error: err } = await supabase
        .from('players')
        .select('*, profile:profiles(*)')
        .eq('profile_complete', true)
        .eq('is_public', true)
        .eq('is_active', true)

      if (err) throw err

      // Fetch all recent evaluations to attach latest per player
      const { data: evals, error: evalErr } = await supabase
        .from('evaluations')
        .select('*')
        .order('evaluation_date', { ascending: false })

      if (evalErr) console.error('Failed to fetch evaluations for scout:', evalErr)

      // Build latest-eval map
      const evalMap = new Map<string, Evaluation>()
      if (evals) {
        for (const ev of evals as Evaluation[]) {
          if (!evalMap.has(ev.player_id)) {
            evalMap.set(ev.player_id, ev)
          }
        }
      }

      // Fetch match_stats aggregation for goals/assists
      const playerIds = (data || []).map((p: any) => p.id)

      let matchStatsMap = new Map<string, { goals: number; assists: number; matches: number }>()

      if (playerIds.length > 0) {
        // Fetch in batches if needed (Supabase IN limit)
        const batchedIds: string[][] = []
        for (let i = 0; i < playerIds.length; i += 100) {
          batchedIds.push(playerIds.slice(i, i + 100))
        }

        for (const batch of batchedIds) {
          const { data: ms } = await supabase
            .from('match_stats')
            .select('player_id, goals, assists, match_id')
            .in('player_id', batch)

          if (ms) {
            for (const s of ms) {
              const existing = matchStatsMap.get(s.player_id) || { goals: 0, assists: 0, matches: 0 }
              existing.goals += s.goals || 0
              existing.assists += s.assists || 0
              existing.matches += 1
              matchStatsMap.set(s.player_id, existing)
            }
          }
        }
      }

      // Map and compute score (STEP 2)
      const scored = (data || []).map((p: any) => {
        const latestEval = evalMap.get(p.id) || null
        const stats = matchStatsMap.get(p.id) || { goals: 0, assists: 0, matches: 0 }

        // Derive speed/stamina/technique from evaluation or player columns
        const speed = p.speed ?? latestEval?.physical ?? 0
        const stamina = p.stamina ?? latestEval?.physical ?? 0
        const technique = p.technique ?? latestEval?.technical ?? 0
        const rating = p.rating ?? latestEval?.overall ?? 0

        const scoutPlayer: ScoutPlayer = {
          ...p,
          name: p.profile?.full_name || p.name || '—',
          name_ar: p.name_ar || p.profile?.full_name || '',
          latestEvaluation: latestEval,
          speed,
          stamina,
          technique,
          rating,
          score: computeScore({ speed, stamina, technique, rating }),
          agility: p.agility ?? latestEval?.physical ?? 0,
          totalGoals: stats.goals,
          totalAssists: stats.assists,
          totalMatchesPlayed: stats.matches,
          region: p.profile?.region || p.region || '',
        }

        return scoutPlayer
      })

      // Sort by score DESC (STEP 3)
      scored.sort((a, b) => (b.score || 0) - (a.score || 0))

      return scored
    },
    staleTime: 2 * 60 * 1000,
  })

  return { players: players ?? [], error, isLoading, isError }
}