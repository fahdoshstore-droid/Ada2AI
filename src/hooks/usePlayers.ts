/**
 * usePlayers.ts — Ada2AI (React Query migration)
 * 
 * Before: useState + useEffect hitting Supabase directly
 * After:  useQuery → services/players.ts → Supabase
 * 
 * Benefits:
 * - Automatic caching (5 min stale time)
 * - Deduplication of identical requests
 * - Background refetch
 * - Consistent loading/error states
 */
import { useQuery } from '@tanstack/react-query'
import { getAllPlayers, getPlayersByPosition } from '../services/players'

export function usePlayers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['players'],
    queryFn: getAllPlayers,
  })

  return {
    players: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}

export function usePlayersByPosition(position?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['players', 'position', position],
    queryFn: () => position ? getPlayersByPosition(position) : getAllPlayers(),
    // Re-run query when position changes
    enabled: true,
  })

  return {
    players: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
