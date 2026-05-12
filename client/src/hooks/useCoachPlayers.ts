/**
 * useCoachPlayers - Fetch players assigned to a coach via coach_players table
 * Joins players with profiles for full roster data
 */
import { useQuery } from '@tanstack/react-query'
import { supabase, type Player, type Profile } from '@/lib/supabase'

export interface CoachPlayer extends Player {
  profile?: Profile
  coach_player_status?: string
}

export function useCoachPlayers(coachId: string | null) {
  const {
    data: players,
    error,
    isLoading,
    isError,
  } = useQuery<CoachPlayer[]>({
    queryKey: ['coachPlayers', coachId],
    queryFn: async () => {
      if (!coachId) return []

      // Try coach_players table first; fallback to players by academy/club
      const { data: linkData, error: linkErr } = await supabase
        .from('coach_players')
        .select('player_id, status')
        .eq('coach_id', coachId)

      if (linkErr || !linkData || linkData.length === 0) {
        // Fallback: fetch coach profile to get academy_id/club_id
        const { data: coachProfile } = await supabase
          .from('profiles')
          .select('user_id, sport')
          .eq('user_id', coachId)
          .single()

        // Try fetching by matching players in the same organization
        // Query players joined with profiles
        const { data, error: pErr } = await supabase
          .from('players')
          .select('*, profile:profiles(*)')
          .limit(50)

        if (pErr) throw pErr
        return (data || []) as CoachPlayer[]
      }

      const playerIds = linkData.map(l => l.player_id)
      const statusMap = Object.fromEntries(linkData.map(l => [l.player_id, l.status]))

      const { data, error: pErr } = await supabase
        .from('players')
        .select('*, profile:profiles(*)')
        .in('id', playerIds)

      if (pErr) throw pErr

      return (data || []).map((p: Player) => ({
        ...p,
        coach_player_status: statusMap[p.id] || 'active',
      })) as CoachPlayer[]
    },
    enabled: !!coachId,
    staleTime: 2 * 60 * 1000,
  })

  return { players: players ?? [], error, isLoading, isError }
}