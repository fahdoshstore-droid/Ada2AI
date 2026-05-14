/**
 * Supabase Client — Ada2AI (OKComputer Frontend)
 * Direct connection, no API middle layer
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase configuration missing — check .env')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/**
 * NOTE: Content-Profile: public header removed — RLS now enforced via
 * security_barrier views in api schema. Use `supabase` for all queries.
 * Public data (players, matches, organizations) is accessible via RLS policies.
 * Private data (profiles, reports) requires authenticated user.
 */

// Types
export type UserType = 'player' | 'coach' | 'scout'

export interface Profile {
  id: string
  user_id?: string
  user_type: UserType
  full_name?: string
  phone?: string
  avatar_url?: string
  sport?: string
  region?: string
  city?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Player {
  id: string
  user_id?: string
  name?: string
  name_en?: string
  sport?: string
  rating?: number
  position?: string
  age?: number
  height_cm?: number
  weight_kg?: number
  dominant_foot?: 'left' | 'right' | 'both'
  jersey_number?: number
  achievements?: string
  photo_url?: string
  video_url?: string
  nationality?: string
  club?: string
  club_id?: string
  goals?: number
  assists?: number
  appearances?: number
  speed?: number
  passing?: number
  shooting?: number
  fitness?: number
  dribbling?: number
  defense?: number
  goalkeeping?: number
  clean_sheets?: number
  saves?: number
  scouts_count?: number
  matches_analyzed?: number
  is_verified?: boolean
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface Evaluation {
  id: string
  player_id: string
  coach_id?: string
  technical: number
  tactical: number
  physical: number
  mental: number
  overall: number
  notes?: string
  evaluation_date?: string
  created_at?: string
}

export interface Match {
  id: string
  home_team?: string
  away_team?: string
  home_score?: number
  away_score?: number
  score?: string
  result?: string
  competition?: string
  match_date?: string
  season?: string
  venue?: string
  is_completed?: boolean
  created_at?: string
}

export interface MatchStats {
  id: string
  match_id: string
  player_id: string
  minutes_played?: number
  goals?: number
  assists?: number
  shots?: number
  shots_on_target?: number
  passes?: number
  pass_accuracy?: number
  tackles?: number
  interceptions?: number
  duels_won?: number
  duels_lost?: number
  rating?: number
  created_at?: string
}

export default supabase