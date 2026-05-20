/**
 * useAnalysis — Ada2AI
 *
 * React Query hooks for video_analyses operations.
 * hook → service → supabase (always)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlayerAnalyses,
  getPendingAnalyses,
  getCompletedAnalyses,
  updateAnalysisStatus,
  saveAnalysisResults,
  type AnalysisResults,
  type AnalysisStatus,
} from '../services/analysis'

/** Player's own analyses */
export function usePlayerAnalyses(uploadedBy: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyses', uploadedBy],
    queryFn: () => getPlayerAnalyses(uploadedBy),
    enabled: !!uploadedBy,
  })
  return { analyses: data ?? [], loading: isLoading, error: error?.message }
}

/** Coach: pending analyses (queued or processing) */
export function usePendingAnalyses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyses', 'pending'],
    queryFn: getPendingAnalyses,
    // Refresh every 60s to catch status changes
    refetchInterval: 60_000,
  })
  return { analyses: data ?? [], loading: isLoading, error: error?.message }
}

/** Coach: completed analyses for history view */
export function useCompletedAnalyses(limit = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analyses', 'completed', limit],
    queryFn: () => getCompletedAnalyses(limit),
  })
  return { analyses: data ?? [], loading: isLoading, error: error?.message }
}

/** Coach: change status (queued → processing, processing → failed) */
export function useUpdateAnalysisStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AnalysisStatus }) =>
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