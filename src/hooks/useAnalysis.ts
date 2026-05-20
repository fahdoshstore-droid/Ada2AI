/**
 * useAnalysis — Ada2AI
 *
 * React Query hooks for video_analyses operations.
 * hook → service → supabase (always)
 *
 * Status mapping: DB stores Arabic ('قيد المعالجة','مكتمل','فشل')
 * UI uses English StatusKey ('queued','processing','completed','failed')
 * toUiStatus() converts DB→UI when needed for StatusBadge.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlayerAnalyses,
  getPendingAnalyses,
  getCompletedAnalyses,
  updateAnalysisStatus,
  saveAnalysisResults,
  type AnalysisResults,
} from '../services/analysis'
import type { StatusKey } from '../lib/tokens'

/** Player's own analyses */
export function usePlayerAnalyses(uploadedBy: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyses', uploadedBy],
    queryFn: () => getPlayerAnalyses(uploadedBy),
    enabled: !!uploadedBy,
  })
  return { analyses: data ?? [], loading: isLoading, error: error?.message }
}

/** Coach: pending analyses (قيد المعالجة in DB) */
export function usePendingAnalyses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyses', 'pending'],
    queryFn: getPendingAnalyses,
    // Refresh every 60s to catch status changes
    refetchInterval: 60_000,
  })
  return { analyses: data ?? [], loading: isLoading, error: error?.message }
}

/** Coach: completed analyses (مكتمل in DB) for history view */
export function useCompletedAnalyses(limit = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyses', 'completed', limit],
    queryFn: () => getCompletedAnalyses(limit),
  })
  return { analyses: data ?? [], loading: isLoading, error: error?.message }
}

/** Coach: change status — pass English StatusKey, service maps to Arabic DB value */
export function useUpdateAnalysisStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusKey }) =>
      updateAnalysisStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    },
  })
}

/** Coach: save results and mark completed */
export function useSaveAnalysisResults() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, results }: { id: string; results: AnalysisResults }) =>
      saveAnalysisResults(id, results),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    },
  })
}