import { useQuery } from '@tanstack/react-query'
import { getTeamReportState } from '../services/clubReport'
import { useAuth } from '../contexts/AuthContext'

/** The signed-in viewer's own team, whoever he is. */
export function useTeamReport() {
  const { profile } = useAuth()
  const { data, isLoading, error } = useQuery({
    queryKey: ['team-report-state', profile?.id, profile?.user_type],
    queryFn: () => getTeamReportState(profile!.id, profile!.user_type),
    enabled: !!profile,
  })
  return { state: data ?? null, loading: isLoading, error: error?.message ?? null }
}
