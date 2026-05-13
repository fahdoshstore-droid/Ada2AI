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

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

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
  profile_id: string
  academy_id?: string
  club_id?: string
  position?: string
  age?: number
  height_cm?: number
  weight_kg?: number
  dominant_foot?: 'left' | 'right' | 'both'
  jersey_number?: number
  achievements?: string
  photo_url?: string
  video_url?: string
  created_at?: string
  updated_at?: string
  profile?: Profile
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
  club_id?: string
  opponent?: string
  match_date?: string
  venue?: string
  score_home?: number
  score_away?: number
  competition?: string
  status?: string
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