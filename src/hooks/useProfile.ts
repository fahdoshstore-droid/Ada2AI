import { useAuth } from '../contexts/AuthContext'
import type { Profile } from '../lib/supabase'

export function useProfile() {
  const { profile, loading, refreshProfile } = useAuth()
  return { profile: profile as Profile | null, loading, refreshProfile }
}