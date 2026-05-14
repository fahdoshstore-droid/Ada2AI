/**
 * Auth Service — Ada2AI
 * Abstraction layer for authentication & profile-related Supabase queries.
 *
 * Auth operations (signIn/signUp/signOut/session) use the default `supabase`
 * client because they go through Supabase Auth, not through table views.
 * Profile queries use `supabase` — RLS enforced via security_barrier views.
 */
import { supabase, type Profile, type UserType } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'
import type { User, Session } from '@supabase/supabase-js'

/** Get the current session */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** Get the current user */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** Fetch a user's profile by user id (uses public schema) */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error(`Failed to fetch profile for ${userId}: ${error.message}`)
  return data as Profile | null
}

/** Sign in with email and password */
export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  trackEvent('login', { method: 'email' })
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    trackEvent('loginError', { reason: error.message })
  } else {
    trackEvent('loginSuccess')
  }
  return { error: error?.message ?? null }
}

/** Sign up with email, password, and optional metadata */
export async function signUp(
  email: string,
  password: string,
  metadata?: { full_name?: string; user_type?: UserType }
): Promise<{ error: string | null }> {
  trackEvent('signup', { method: 'email', userType: metadata?.user_type ?? 'unknown' })
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (error) {
    trackEvent('signupError', { reason: error.message })
  } else {
    trackEvent('signupSuccess', { userType: metadata?.user_type ?? 'unknown' })
  }
  return { error: error?.message ?? null }
}

/** Sign out */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/** Update a user's profile (uses public schema) */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update profile ${userId}: ${error.message}`)
  return data as Profile
}

/** Subscribe to auth state changes */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session)
  )
  return subscription
}