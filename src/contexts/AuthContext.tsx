import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserType } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  profileError: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, metadata?: { full_name?: string; user_type?: UserType }) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    const startTime = Date.now()
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('[AUTH] fetchProfile error:', error.message, error.code, error.details)
        setProfile(null)
        setProfileError(`فشل تحميل الملف الشخصي: ${error.message}`)
        trackEvent('profileLoadError', { durationMs: Date.now() - startTime, reason: error.message })
      } else if (!data) {
        setProfile(null)
        setProfileError('لا يوجد ملف شخصي مرتبط بحسابك. تواصل مع الدعم.')
        trackEvent('profileLoadError', { durationMs: Date.now() - startTime, reason: 'no profile found' })
      } else {
        setProfile(data as Profile)
        setProfileError(null)
        trackEvent('profileLoadTime', { durationMs: Date.now() - startTime, role: data?.user_type ?? 'none' })
      }
    } catch (err) {
      console.error('[AUTH] fetchProfile exception:', err)
      setProfile(null)
      setProfileError('خطأ غير متوقع في تحميل الملف الشخصي')
      trackEvent('profileLoadError', { durationMs: Date.now() - startTime, reason: 'exception' })
    }
  }, [])

  useEffect(() => {
    // 1. Restore existing session on mount
    // onAuthStateChange with INITIAL_SESSION handles the initial load
    // No manual getSession needed — onAuthStateChange fires after getSession resolves

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {

      // Token refreshed successfully — update session state
      if (event === 'TOKEN_REFRESHED') {
        setSession(s)
        setUser(s?.user ?? null)
        return
      }

      // SIGNED_OUT — session expired or user logged out // verified: redirect to /login handled by ProtectedRoute
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setSession(null)
        setProfileError(null)
        trackEvent('auth_signed_out', { reason: 'session expired' })
        setLoading(false)
        return
      }

      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        // Keep loading=true until profile is fetched
        // This prevents ProtectedRoute from showing "profile not found"
        await fetchProfile(s.user.id)
      } else {
        setProfile(null)
        setProfileError(null)
      }

      // Only set loading=false AFTER profile fetch completes
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('[AUTH] signIn error:', error.message)
    }
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: { full_name?: string; user_type?: UserType }) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut().catch(() => null)
    setUser(null)
    setProfile(null)
    setSession(null)
    setProfileError(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, profileError, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function roleDashboard(role: UserType | null | undefined): string {
  switch (role) {
    case 'player': return '/player/dashboard'
    case 'coach':  return '/coach'
    case 'scout':  return '/scout'
    default:       return '/'
  }
}