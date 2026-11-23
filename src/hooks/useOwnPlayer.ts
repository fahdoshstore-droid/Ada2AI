import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { getOwnPlayer } from '../services/players'

/** The signed-in player's own record. Disabled for non-player accounts. */
export function useOwnPlayer() {
  const { user, profile } = useAuth()
  const isPlayer = profile?.user_type === 'player'
  return useQuery({
    queryKey: ['own-player', user?.id],
    enabled: !!user && isPlayer,
    queryFn: () => getOwnPlayer(user!.id),
    staleTime: 30_000,
  })
}
