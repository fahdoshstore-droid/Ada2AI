/**
 * useCalibration.ts — read/write the stored pitch calibration.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCalibration, saveCalibration, getTrackHistories, getPrimaryAnalysisId, getAnalysisVideoUrl, uploadMatchVideo, type SaveCalibrationInput } from '../services/calibration'
import { trackEvent } from '../lib/analytics'

export function useCalibration(analysisId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['calibration', analysisId],
    queryFn: () => getCalibration(analysisId as string),
    enabled: !!analysisId,
  })
  return { calibration: data ?? null, loading: isLoading, error: error?.message ?? null }
}

export function useTrackHistories(analysisId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['track-histories', analysisId],
    queryFn: () => getTrackHistories(analysisId as string),
    enabled: !!analysisId,
  })
  return { tracks: data ?? [], loading: isLoading, error: error?.message ?? null }
}

export function useSaveCalibration() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (input: SaveCalibrationInput) => saveCalibration(input),
    onSuccess: (saved, input) => {
      trackEvent('calibration_saved', {
        analysis_id: input.analysisId,
        points: input.correspondences.length,
        validated: saved.validated,
      })
      queryClient.invalidateQueries({ queryKey: ['calibration', input.analysisId] })
    },
  })
  return {
    save: mutation.mutateAsync,
    saving: mutation.isPending,
    error: mutation.error?.message ?? null,
  }
}

export function usePrimaryAnalysisId(matchId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['primary-analysis', matchId],
    queryFn: () => getPrimaryAnalysisId(matchId as string),
    enabled: !!matchId,
  })
  return { analysisId: data ?? null, loading: isLoading }
}

export function useAnalysisVideo(analysisId: string | null) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['analysis-video', analysisId],
    queryFn: () => getAnalysisVideoUrl(analysisId as string),
    enabled: !!analysisId,
  })
  const upload = useMutation({
    mutationFn: (file: File) => uploadMatchVideo(analysisId as string, file),
    onSuccess: () => {
      trackEvent('match_video_uploaded', { analysis_id: analysisId ?? '' })
      queryClient.invalidateQueries({ queryKey: ['analysis-video', analysisId] })
    },
  })
  return {
    videoUrl: data ?? null,
    loading: isLoading,
    upload: upload.mutateAsync,
    uploading: upload.isPending,
    uploadError: upload.error?.message ?? null,
  }
}
