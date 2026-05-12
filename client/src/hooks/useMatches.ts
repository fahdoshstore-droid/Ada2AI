/**
 * useMatches - Fetch matches and match stats from Supabase with react-query caching
 */
import { useQuery } from '@tanstack/react-query'
import { getMatches, getMatchStats, type Match, type MatchStats } from '@/lib/supabase'

/** Fetch matches (optionally filtered by club) */
export function useMatches(clubId?: string) {
  const {
    data: matches,
    error,
    isLoading,
    isError,
  } = useQuery<Match[]>({
    queryKey: ['matches', clubId],
    queryFn: async () => {
      const { data, error } = await getMatches(clubId)
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })

  return { matches: matches ?? [], error, isLoading, isError }
}

/** Fetch match stats for a specific match */
export function useMatchStats(matchId: string | null) {
  const {
    data: matchStats,
    error,
    isLoading,
    isError,
  } = useQuery<MatchStats[]>({
    queryKey: ['matchStats', matchId],
    queryFn: async () => {
      if (!matchId) return []
      const { data, error } = await getMatchStats(matchId)
      if (error) throw error
      return data
    },
    enabled: !!matchId,
    staleTime: 5 * 60 * 1000,
  })

  return { matchStats: matchStats ?? [], error, isLoading, isError }
}