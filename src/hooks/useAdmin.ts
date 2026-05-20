import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import {
  getClubPlayers, searchClubPlayers,
  updateClubPlayer, getClubAnalyses, retryFailedAnalysis,
  getClubStats,
} from '../services/admin'

export function useClubPlayers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'players'],
    queryFn: getClubPlayers,
  })
  return { players: data ?? [], loading: isLoading, error: error?.message }
}

export function useSearchClubPlayers(query: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'players', 'search', query],
    queryFn: () => searchClubPlayers(query),
    enabled: query.length > 1,
  })
  return { results: data ?? [], loading: isLoading }
}

export function useUpdateClubPlayer() {
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateClubPlayer>[1] }) =>
      updateClubPlayer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'players'] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

export function useClubAnalyses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'analyses'],
    queryFn: getClubAnalyses,
    refetchInterval: 60 * 1000,
  })
  return { analyses: data ?? [], loading: isLoading, error: error?.message }
}

export function useRetryAnalysis() {
  return useMutation({
    mutationFn: retryFailedAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'analyses'] })
    },
  })
}

export function useClubStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getClubStats,
  })
  return { stats: data ?? { playersCount: 0, videosCount: 0, completedCount: 0, failedCount: 0, ratingsCount: 0 }, loading: isLoading, error: error?.message }
}