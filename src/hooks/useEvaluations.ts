/**
 * useEvaluations.ts — Ada2AI (React Query migration)
 */
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase, type Evaluation } from '../lib/supabase'
import { queryClient } from '../lib/queryClient'

async function fetchEvaluations(playerId?: string): Promise<Evaluation[]> {
  let query = supabase
    .from('evaluations')
    .select('*')
    .order('evaluation_date', { ascending: false })
    .limit(100)

  if (playerId) query = query.eq('player_id', playerId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Evaluation[]) ?? []
}

async function createEvaluation(
  payload: Omit<Evaluation, 'id' | 'created_at'>
): Promise<Evaluation> {
  const { data, error } = await supabase
    .from('evaluations')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Evaluation
}

export function useEvaluations(playerId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['evaluations', playerId ?? 'all'],
    queryFn: () => fetchEvaluations(playerId),
  })

  return {
    evaluations: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}

export function useCreateEvaluation() {
  return useMutation({
    mutationFn: createEvaluation,
    onSuccess: () => {
      // Invalidate all evaluation queries so dashboards refresh
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}
