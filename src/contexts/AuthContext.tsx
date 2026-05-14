import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserType } from '../lib/supabase'

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
    console.log('[AUTH] fetchProfile called for:', userId)
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
      } else if (!data) {
        console.warn('[AUTH] fetchProfile: no profile found for user:', userId)
        setProfile(null)
        setProfileError('لا يوجد ملف شخصي مرتبط بحسابك. تواصل مع الدعم.')
      } else {
        console.log('[AUTH] fetchProfile success:', data?.full_name, data?.user_type)
        setProfile(data as Profile)
        setProfileError(null)
      }
    } catch (err) {
      console.error('[AUTH] fetchProfile exception:', err)
      setProfile(null)
      setProfileError('خطأ غير متوقع في تحميل الملف الشخصي')
    }
  }, [])

  useEffect(() => {
    // 1. Restore existing session on mount
    console.log('[AUTH] Mount — checking session...')
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      console.log('[AUTH] getSession result:', s ? `user=${s.user.id}` : 'no session')
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        await fetchProfile(s.user.id)
      }
      setLoading(false)
      console.log('[AUTH] Initial load complete, loading=false')
    })

    // 2. Listen for auth state changes (login, logout, token refresh)
    //    Skip INITIAL_SESSION to avoid double-fetch with getSession above
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      console.log('[AUTH] onAuthStateChange:', event, s ? `user=${s.user.id}` : 'no session')
      if (event === 'INITIAL_SESSION') return

      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        await fetchProfile(s.user.id)
      } else {
        setProfile(null)
        setProfileError(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[AUTH] signIn called for:', email)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('[AUTH] signIn error:', error.message)
    } else {
      console.log('[AUTH] signIn success — onAuthStateChange will handle redirect')
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
    case 'player': return '/sport-id'
    case 'coach': return '/coach'
    case 'scout': return '/scout'
    default: return '/'
  }
}