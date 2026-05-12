/**
 * usePlayers - Fetch players from Supabase with react-query caching
 * Replaces all hardcoded mock player data across the app
 */
import { useQuery } from '@tanstack/react-query'
import { getPlayers, getPlayer, type Player } from '@/lib/supabase'

/** Fetch all players (with optional filters) */
export function usePlayers(filters?: { academy_id?: string; club_id?: string }) {
  const {
    data: players,
    error,
    isLoading,
    isError,
  } = useQuery<Player[]>({
    queryKey: ['players', filters],
    queryFn: async () => {
      const { data, error } = await getPlayers(filters)
      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 min cache
  })

  return { players: players ?? [], error, isLoading, isError }
}

/** Fetch a single player by ID */
export function usePlayer(playerId: string | null) {
  const {
    data: player,
    error,
    isLoading,
    isError,
  } = useQuery<Player | null>({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return null
      const { data, error } = await getPlayer(playerId)
      if (error) throw error
      return data
    },
    enabled: !!playerId,
    staleTime: 2 * 60 * 1000,
  })

  return { player: player ?? null, error, isLoading, isError }
}