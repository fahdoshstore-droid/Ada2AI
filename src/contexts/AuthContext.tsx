import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserType } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

/** Slow-load threshold (ms). Non-destructive: flags a slow load for analytics but does NOT abort the query. */
const PROFILE_TIMEOUT_MS = 5000

/** Dead-man switch for auth restoration (ms). Only forces loading=false on a true hang. */
const AUTH_SAFETY_TIMEOUT_MS = 15000

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

  /**
   * Latest-request guard. Monotonic sequence: only the request holding the
   * highest sequence may write profile state. Incremented on every fetch AND
   * on sign-out / user-change so in-flight requests from a previous lifecycle
   * become stale and are ignored instead of overwriting current state.
   */
  const requestSeqRef = useRef(0)
  const userRef = useRef<User | null>(null)

  useEffect(() => { userRef.current = user }, [user])

  const fetchProfile = useCallback(async (userId: string) => {
    const seq = ++requestSeqRef.current
    const start = performance.now()
    let timedOut = false

    // Non-destructive slow-load flag: fires if the query outlives the threshold,
    // but leaves the query running so a late success can still recover the UI.
    const slowTimer = setTimeout(() => {
      timedOut = true
      trackEvent('profileLoadTimeout', { elapsedMs: Math.round(performance.now() - start) })
    }, PROFILE_TIMEOUT_MS)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      clearTimeout(slowTimer)

      // Stale response: a newer request started, or the user changed/signed out.
      // Ignore it — it must not overwrite newer auth state.
      if (seq !== requestSeqRef.current || userId !== userRef.current?.id) {
        trackEvent('profileStaleIgnored', { hasRow: !!data })
        return
      }

      if (error) {
        console.error('[AUTH] fetchProfile error:', error.message, error.code, error.details)
        setProfile(null)
        setProfileError(error.message || 'تعذر تحميل الملف الشخصي')
        trackEvent('profileLoadError', {
          durationMs: Math.round(performance.now() - start),
          reason: 'request_error',
          code: error.code ?? 'UNKNOWN',
        })
        return
      }

      if (!data) {
        setProfile(null)
        setProfileError('لا يوجد ملف شخصي مرتبط بحسابك. تواصل مع الدعم.')
        trackEvent('profileLoadError', {
          durationMs: Math.round(performance.now() - start),
          reason: 'no profile found',
        })
        return
      }

      // Success — including a late success that arrived after the slow flag fired.
      setProfile(data as Profile)
      setProfileError(null)
      if (timedOut) {
        trackEvent('profileLateSuccess', { durationMs: Math.round(performance.now() - start) })
      }
      trackEvent('profileLoadTime', {
        durationMs: Math.round(performance.now() - start),
        role: (data as Profile)?.user_type ?? 'none',
      })
    } catch (err) {
      clearTimeout(slowTimer)

      if (seq !== requestSeqRef.current) return

      console.error('[AUTH] fetchProfile exception:', err)
      setProfile(null)
      setProfileError('خطأ غير متوقع في تحميل الملف الشخصي')
      trackEvent('profileLoadError', {
        durationMs: Math.round(performance.now() - start),
        reason: 'exception',
      })
    }
  }, [])

  useEffect(() => {
    // 1. Restore existing session on mount
    // onAuthStateChange with INITIAL_SESSION handles the initial load
    // No manual getSession needed — onAuthStateChange fires after getSession resolves

    // Dead-man safety: if Auth restoration takes > 15s, force loading=false to
    // avoid an infinite spinner. It is intentionally longer than the profile
    // slow flag so it never races a legitimate (but slow) profile load.
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('[AUTH] Session load timeout (15s) — forcing loading=false')
          trackEvent('auth_timeout')
        }
        return false
      })
    }, AUTH_SAFETY_TIMEOUT_MS)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {

      // Token refreshed successfully — update session state
      if (event === 'TOKEN_REFRESHED') {
        setSession(s)
        setUser(s?.user ?? null)
        return
      }

      // SIGNED_OUT — session expired or user logged out
      if (event === 'SIGNED_OUT') {
        requestSeqRef.current++ // invalidate in-flight requests
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
        await fetchProfile(s.user.id)
      } else {
        requestSeqRef.current++ // invalidate in-flight requests
        setProfile(null)
        setProfileError(null)
      }

      // Only set loading=false AFTER profile fetch completes
      setLoading(false)
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
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
    try {
      await supabase.auth.signOut()
    } catch {
      // silent — session may already be invalid
    } finally {
      requestSeqRef.current++ // invalidate in-flight requests
      setUser(null)
      setProfile(null)
      setSession(null)
      setProfileError(null)
      trackEvent('auth_signed_out')
    }
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

/** Check if profile has admin privileges (coach with sport='admin') */
export function isAdmin(profile: Profile | null): boolean {
  return profile?.user_type === 'coach' && profile?.sport === 'admin'
}
