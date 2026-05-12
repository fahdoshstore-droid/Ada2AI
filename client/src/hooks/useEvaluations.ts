/**
 * useEvaluations - Fetch evaluations from Supabase with react-query caching
 */
import { useQuery } from '@tanstack/react-query'
import { getEvaluations, type Evaluation } from '@/lib/supabase'

/** Fetch evaluations for a player */
export function useEvaluations(playerId: string | null) {
  const {
    data: evaluations,
    error,
    isLoading,
    isError,
  } = useQuery<Evaluation[]>({
    queryKey: ['evaluations', playerId],
    queryFn: async () => {
      if (!playerId) return []
      const { data, error } = await getEvaluations(playerId)
      if (error) throw error
      return data
    },
    enabled: !!playerId,
    staleTime: 2 * 60 * 1000,
  })

  return { evaluations: evaluations ?? [], error, isLoading, isError }
}