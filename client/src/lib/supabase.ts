/**
 * Supabase Auth Configuration
 * Connected to: https://ujjmhqpyehymaavkawiv.supabase.co
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase configuration missing')
}

// Create client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Types
export interface User {
  id: string
  email: string
  full_name?: string
  role: 'user' | 'admin' | 'scout' | 'coach' | 'academy'
  sport?: string
  created_at: string
  updated_at: string
}

// Auth helpers
export const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => supabase.auth.getUser()

// Database helpers (NEW!)
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export default supabase
