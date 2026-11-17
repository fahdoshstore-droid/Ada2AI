/**
 * useCreateScoutReport — writes the unified report to `scout_reports`.
 * The score comes back from the database, which computes it.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createScoutReport, type ScoutReportInput } from '../services/scoutReports'
import { trackEvent } from '../lib/analytics'

export function useCreateScoutReport() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: ScoutReportInput) => createScoutReport(input),
    onSuccess: (row, input) => {
      queryClient.invalidateQueries({ queryKey: ['scout-reports', input.playerId] })
      trackEvent('scout_report_saved', {
        playerId: input.playerId ?? 'unlinked',
        totalScore: row.total_score ?? -1,
      })
    },
  })

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    savedScore: mutation.data?.total_score ?? null,
  }
}
