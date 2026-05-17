/**
 * useCoachPlayers.ts — Ada2AI (React Query migration)
 */
import { useQuery } from '@tanstack/react-query'
import { supabase, type Player } from '../lib/supabase'

async function fetchCoachPlayers(clubName?: string): Promise<Player[]> {
  let query = supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50) // coach shouldn't see all players, just their club

  if (clubName) {
    query = query.eq('club', clubName)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Player[]) ?? []
}

export function useCoachPlayers(clubName?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['coach-players', clubName ?? 'all'],
    queryFn: () => fetchCoachPlayers(clubName),
  })

  return {
    players: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
