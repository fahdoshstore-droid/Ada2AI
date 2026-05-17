/**
 * useCreateEvaluation — Ada2AI
 *
 * React Query mutation for creating coach evaluations.
 * hook → service → supabase
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvaluation } from '../services/rankings'
import type { Evaluation } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

export function useCreateEvaluation() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (payload: Omit<Evaluation, 'id' | 'created_at'>) => {
      return createEvaluation(payload)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      trackEvent('evaluation_saved', { playerId: variables.player_id })
    },
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  }
}