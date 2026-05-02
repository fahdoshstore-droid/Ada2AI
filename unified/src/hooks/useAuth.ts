import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Role, Organization } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  role: Role | null
  organization: Organization | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    role: null,
    organization: null,
  })

  const fetchRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*, organizations(*)')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching role:', error)
      return null
    }
    return data
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        setState({ user: null, loading: false, role: null, organization: null })
        return
      }

      const membership = await fetchRole(authUser.id)

      const user: User = {
        id: authUser.id,
        email: authUser.email || '',
        membership: membership || undefined,
        role: membership?.role || undefined,
        organization: membership?.organizations || undefined,
      }

      setState({
        user,
        loading: false,
        role: membership?.role || null,
        organization: membership?.organizations || null,
      })
    } catch (err) {
      console.error('Auth check failed:', err)
      setState({ user: null, loading: false, role: null, organization: null })
    }
  }, [fetchRole])

  useEffect(() => {
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const membership = await fetchRole(session.user.id)
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          membership: membership || undefined,
          role: membership?.role || undefined,
          organization: membership?.organizations || undefined,
        }
        setState({
          user,
          loading: false,
          role: membership?.role || null,
          organization: membership?.organizations || null,
        })
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, loading: false, role: null, organization: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchRole])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ user: null, loading: false, role: null, organization: null })
  }, [])

  const refreshRole = useCallback(() => {
    checkAuth()
  }, [checkAuth])

  return { ...state, signOut, refreshRole }
}
