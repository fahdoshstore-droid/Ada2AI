import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserType } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'
import { captureError } from '../lib/monitoring'

const PROFILE_TIMEOUT_MS = 8000

/** Older sign-ups were stored as 'athlete'; the app's player role is 'player'. */
function normalizeProfile(p: Profile): Profile {
  return (p.user_type as string) === 'athlete' ? { ...p, user_type: 'player' } : p
}

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

  // The loaded profile, readable from callbacks without re-subscribing.
  const profileRef = useRef<Profile | null>(null)
  // One in-flight profile request per user: Supabase fires INITIAL_SESSION and
  // SIGNED_IN together on load, and SIGNED_IN again whenever the tab regains focus.
  const inflightRef = useRef<{ userId: string; promise: Promise<void> } | null>(null)

  const applyProfile = useCallback((p: Profile | null) => {
    profileRef.current = p
    setProfile(p)
  }, [])

  const fetchProfile = useCallback((userId: string): Promise<void> => {
    if (inflightRef.current?.userId === userId) return inflightRef.current.promise

    const run = async () => {
      const startTime = Date.now()
      // Two attempts: a slow mobile connection or a cold database should not
      // lock someone out of the whole site on the first hiccup.
      for (let attempt = 1; attempt <= 2; attempt++) {
        const result = await Promise.race([
          supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          new Promise<{ data: null; error: { message: string; code: string } }>(resolve =>
            setTimeout(() => resolve({ data: null, error: { message: 'انتهت مهلة الاتصال — تحقق من الإنترنت', code: 'TIMEOUT' } }), PROFILE_TIMEOUT_MS)),
        ]).catch((e: unknown) => ({ data: null, error: { message: (e as Error)?.message || 'خطأ غير متوقع', code: 'UNKNOWN' } }))

        if (!result.error && result.data) {
          applyProfile(normalizeProfile(result.data as Profile))
          setProfileError(null)
          trackEvent('profileLoadTime', { durationMs: Date.now() - startTime, role: (result.data as Profile).user_type ?? 'none' })
          return
        }
        if (!result.error && !result.data) {
          applyProfile(null)
          setProfileError('لا يوجد ملف شخصي مرتبط بحسابك. تواصل مع الدعم.')
          trackEvent('profileLoadError', { durationMs: Date.now() - startTime, reason: 'no profile found' })
          return
        }
        if (attempt === 2) {
          // Keep a profile we already have for this user (e.g. a refresh on tab
          // focus failed); only surface the error when there is nothing to show.
          if (profileRef.current?.id !== userId) {
            applyProfile(null)
            setProfileError(result.error!.message)
          }
          captureError(new Error(`profile load failed: ${result.error!.code} ${result.error!.message}`))
          trackEvent('profileLoadError', { durationMs: Date.now() - startTime, reason: result.error!.message })
        }
      }
    }

    const promise = run().finally(() => {
      if (inflightRef.current?.promise === promise) inflightRef.current = null
    })
    inflightRef.current = { userId, promise }
    return promise
  }, [applyProfile])

  useEffect(() => {
    // Safety net: if auth itself never reports, stop the global spinner.
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) trackEvent('auth_timeout')
        return false
      })
    }, 8000)

    // IMPORTANT: this callback runs while supabase-js holds its auth lock. Any
    // supabase call awaited in here (e.g. the profile query) waits for that same
    // lock and can hang every request on the page. So the callback only records
    // the session and schedules the profile load outside it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'TOKEN_REFRESHED') {
        setSession(s)
        setUser(s?.user ?? null)
        return
      }

      if (event === 'SIGNED_OUT' || !s?.user) {
        setUser(null)
        applyProfile(null)
        setSession(null)
        setProfileError(null)
        if (event === 'SIGNED_OUT') trackEvent('auth_signed_out', { reason: 'session expired' })
        setLoading(false)
        return
      }

      setSession(s)
      setUser(s.user)
      const userId = s.user.id
      // Same user and profile already loaded (focus re-check): nothing to fetch.
      if (profileRef.current?.id === userId) {
        setLoading(false)
        return
      }
      setTimeout(() => {
        void fetchProfile(userId).finally(() => setLoading(false))
      }, 0)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [fetchProfile, applyProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('[AUTH] signIn error:', error.message)
    }
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string, metadata?: { full_name?: string; user_type?: UserType }) => {
    // The confirmation link returns to /login, which routes the new account on
    // (a new player straight to Sport ID onboarding). Falls back to the project's
    // Site URL when this origin is not in Supabase's allowed redirect list.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: `${window.location.origin}/login` },
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // silent — session may already be invalid
    } finally {
      setUser(null)
      applyProfile(null)
      setSession(null)
      setProfileError(null)
      trackEvent('auth_signed_out')
    }
  }, [applyProfile])

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

/** Check if profile has admin privileges (coach with sport='admin') */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.user_type === 'coach' && profile?.sport === 'admin'
}