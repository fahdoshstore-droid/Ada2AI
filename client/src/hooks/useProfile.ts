/**
 * useProfile - Fetches the current user's profile from Supabase
 * Uses @tanstack/react-query for caching
 */
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, type Profile, type UserType } from '@/lib/supabase'

// Map of role-based dashboard paths
export const roleDashboardPaths: Record<UserType, string> = {
  player: '/dashboard/player',
  coach: '/dashboard/coach',
  scout: '/dashboard/scout',
  academy: '/dashboard',
  club: '/dashboard/club',
  parent: '/dashboard/parent',
}

export function useProfile() {
  const { user, loading: authLoading } = useAuth()

  const {
    data: profile,
    error,
    isLoading: profileLoading,
  } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('[useProfile] Failed to fetch profile:', error)
        return null
      }
      return data as Profile
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 min cache
  })

  const role: UserType | null = profile?.user_type ?? null

  return {
    profile: profile ?? null,
    role,
    loading: authLoading || profileLoading,
    error,
  }
}