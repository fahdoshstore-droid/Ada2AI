/**
 * useProfile - Fetches the current user's profile from Supabase
 * Dedup: Shares a single in-flight request across all consumers.
 */
import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, type Profile, type UserType } from '@/lib/supabase'

// Map of role-based dashboard paths
export const roleDashboardPaths: Record<UserType, string> = {
  player: '/dashboard/player',
  coach: '/dashboard/coach',
  scout: '/dashboard/scout',
  academy: '/dashboard/player',
  club: '/dashboard/club',
  parent: '/dashboard/parent',
}

// ── Shared in-flight deduplication ──────────────────────────────
// If multiple useProfile() calls fire at the same time for the same userId,
// they share the same Promise instead of issuing N separate network requests.
const inflightProfiles = new Map<string, Promise<Profile | null>>()

function getSharedProfile(userId: string): Promise<Profile | null> {
  const existing = inflightProfiles.get(userId)
  if (existing) return existing

  const promise = (async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error) throw error
      return data as Profile | null
    } finally {
      inflightProfiles.delete(userId)
    }
  })()

  inflightProfiles.set(userId, promise)
  return promise
}

export function useProfile() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getSharedProfile(user.id)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Fetch profile when user becomes available (auth resolves)
  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchProfile()
    } else if (!user?.id) {
      setProfile(null)
      setError(null)
    }
  }, [user?.id, authLoading, fetchProfile])

  const role: UserType | null = profile?.user_type ?? null

  return {
    profile,
    role,
    loading,
    error,
    retry: fetchProfile,
  }
}