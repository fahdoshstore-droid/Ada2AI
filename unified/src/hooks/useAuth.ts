import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

type Role = 'admin' | 'coach' | 'player' | 'scout'

interface AuthState {
  userId: string | null
  email: string | null
  loading: boolean
  role: Role | null
}

const AUTH_TIMEOUT_MS = 5000
const ROLE_TIMEOUT_MS = 5000

// Wrap any promise with a hard timeout — returns null on timeout/error
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), ms)
    promise
      .then((val) => { clearTimeout(timer); resolve(val) })
      .catch(() => { clearTimeout(timer); resolve(null) })
  })
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    userId: null,
    email: null,
    loading: true,
    role: null,
  })

  const fetchRole = useCallback(async (userId: string): Promise<Role | null> => {
    try {
      const result = await withTimeout(
        supabase
          .from('profiles')
          .select('user_type')
          .eq('id', userId)
          .maybeSingle() as any as Promise<any>,
        ROLE_TIMEOUT_MS
      )
      if (!result || result.error || !result.data) return null
      return (result.data.user_type as Role) ?? null
    } catch {
      return null
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      // getUser() with 5s hard timeout
      const authResult = await withTimeout(
        supabase.auth.getUser() as any as Promise<any>,
        AUTH_TIMEOUT_MS
      )

      if (!authResult || authResult.error || !authResult.data?.user) {
        setState({ userId: null, email: null, loading: false, role: null })
        return
      }

      const authUser = authResult.data.user
      const role = await fetchRole(authUser.id)

      setState({
        userId: authUser.id,
        email: authUser.email || null,
        loading: false,
        role,
      })
    } catch (err) {
      setState({ userId: null, email: null, loading: false, role: null })
    }
  }, [fetchRole])

  useEffect(() => {
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const role = await fetchRole(session.user.id)
        setState({
          userId: session.user.id,
          email: session.user.email || null,
          loading: false,
          role,
        })
      } else if (event === 'SIGNED_OUT') {
        setState({ userId: null, email: null, loading: false, role: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchRole])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ userId: null, email: null, loading: false, role: null })
  }, [])

  const refreshRole = useCallback(() => {
    checkAuth()
  }, [checkAuth])

  return { ...state, signOut, refreshRole }
}