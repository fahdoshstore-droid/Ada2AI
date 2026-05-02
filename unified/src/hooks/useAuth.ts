import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

type Role = 'admin' | 'coach' | 'player' | 'scout'

interface AuthState {
  userId: string | null
  email: string | null
  loading: boolean
  role: Role | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    userId: null,
    email: null,
    loading: true,
    role: null,
  })

  const fetchRole = useCallback(async (userId: string): Promise<Role | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching role:', error)
      return null
    }
    return (data?.user_type as Role) ?? null
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        setState({ userId: null, email: null, loading: false, role: null })
        return
      }

      const role = await fetchRole(authUser.id)

      setState({
        userId: authUser.id,
        email: authUser.email || null,
        loading: false,
        role,
      })
    } catch (err) {
      console.error('Auth check failed:', err)
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