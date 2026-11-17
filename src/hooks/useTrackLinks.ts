/** Track → player links for one match, and the coach's write actions. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAnalysedMatchIds,
  getTracksForMatch, getLinksForAnalyses, linkTrackToPlayer, unlinkTrack,
  type LinkInput,
} from '../services/trackLinks'
import { trackEvent } from '../lib/analytics'

export function useMatchTracks(matchId: string | null) {
  const tracks = useQuery({
    queryKey: ['match-tracks', matchId],
    queryFn: () => getTracksForMatch(matchId!),
    enabled: !!matchId,
  })

  const analysisIds = [...new Set((tracks.data ?? []).map(t => t.analysisId))]

  const links = useQuery({
    queryKey: ['track-links', matchId, analysisIds.join(',')],
    queryFn: () => getLinksForAnalyses(analysisIds),
    enabled: analysisIds.length > 0,
  })

  return {
    tracks: tracks.data ?? [],
    links: links.data ?? [],
    loading: tracks.isPending || links.isPending,
    error: (tracks.error ?? links.error)?.message ?? null,
  }
}

export function useLinkTrack(matchId: string | null) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['track-links', matchId] })
    queryClient.invalidateQueries({ queryKey: ['football-track-identities'] })
  }

  const link = useMutation({
    mutationFn: (input: LinkInput) => linkTrackToPlayer(input),
    onSuccess: (_row, input) => {
      invalidate()
      trackEvent('track_linked', { trackId: input.trackId, playerId: input.playerId })
    },
  })

  const unlink = useMutation({
    mutationFn: (linkId: string) => unlinkTrack(linkId),
    onSuccess: invalidate,
  })

  return { link, unlink }
}

export function useAnalysedMatchIds() {
  const { data, isLoading } = useQuery({
    queryKey: ['analysed-match-ids'],
    queryFn: getAnalysedMatchIds,
    staleTime: 60_000,
  })
  return { analysedMatchIds: data ?? [], loading: isLoading }
}
