/**
 * useAllEvaluations - Fetch ALL evaluations (optionally filtered by club) for team-wide views
 * Unlike useEvaluations(playerId), this fetches every evaluation row
 */
import { useQuery } from '@tanstack/react-query'
import { getAllEvaluations, type Evaluation, type Player } from '@/lib/supabase'

export type EvaluationWithPlayer = Evaluation & { player?: Player }

export function useAllEvaluations(clubId?: string) {
  const {
    data: evaluations,
    error,
    isLoading,
    isError,
  } = useQuery<EvaluationWithPlayer[]>({
    queryKey: ['allEvaluations', clubId],
    queryFn: async () => {
      const { data, error } = await getAllEvaluations(clubId)
      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000,
  })

  return { evaluations: evaluations ?? [], error, isLoading, isError }
}