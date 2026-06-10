import { supabase } from './supabase'

/**
 * Admin service — secure player creation via Edge Function + club player management
 * Uses actual Supabase schema columns: name, club, position, age, dominant_foot, jersey_number, is_verified
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface ClubPlayer {
  id: string
  name: string
  position?: string | null
  age?: number | null
  club?: string | null
  rating?: number | null
  is_verified?: boolean | null
  created_at?: string | null
}

export interface CreatePlayerResult {
  userId: string
  email: string
  tempPassword: string
}

/** Fetch players for a club (default: الروضة) */
export async function getClubPlayers(clubName = 'الروضة'): Promise<ClubPlayer[]> {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, position, age, club, rating, is_verified, created_at')
    .eq('club', clubName)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/** Create player account via Supabase Edge Function (admin-only) */
export async function createPlayerViaEdgeFunction(input: {
  firstName: string
  email: string
  position?: string
  age?: string
  dominantFoot?: string
  jerseyNumber?: string
}): Promise<CreatePlayerResult> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('غير مسجل الدخول')

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/create-player`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(input),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || result.message || 'فشل إنشاء الحساب')
  }

  return {
    userId: result.userId,
    email: result.email,
    tempPassword: result.tempPassword,
  }
}

/** Get total player count */
export async function getPlayerCount(): Promise<number> {
  const { count, error } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count ?? 0
}

/** Get total coach count */
export async function getCoachCount(): Promise<number> {
  const { count, error } = await supabase
    .from('coaches')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count ?? 0
}