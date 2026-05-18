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
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllPlayers, getPlayersByPosition } from '../services/players'

export function usePlayers({ pageSize = 20 }: { pageSize?: number } = {}) {
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['players', page, pageSize],
    queryFn: () => getAllPlayers(page, pageSize),
  })

  return {
    players: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    page,
    setPage,
    pageSize,
    hasMore: (data ?? []).length === pageSize,
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