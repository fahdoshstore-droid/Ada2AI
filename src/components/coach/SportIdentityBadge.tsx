import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getSportIdentityForProfile } from '../../services/sportIdentity'

export default function SportIdentityBadge({ profileId }: { profileId?: string }) {
  const { user } = useAuth()
  const identity = useQuery({
    queryKey: ['football-sport-identity', user?.id, profileId],
    enabled: !!user && !!profileId,
    staleTime: 0,
    gcTime: 0,
    queryFn: () => getSportIdentityForProfile(profileId!),
  })
  if (!identity.data || !user || identity.isError) return null
  return <p className="text-xs text-teal-prime mt-2" dir="ltr">Sport ID: {identity.data.sport_id}</p>
}
