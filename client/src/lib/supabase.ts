/**
 * Supabase Client - Ada2AI
 * Schema: profiles, players, evaluations, matches, match_stats
 */
import { createClient } from '@supabase/supabase-js'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase configuration missing')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// ============================================================
// TYPES
// ============================================================

export type UserType = 'academy' | 'club' | 'coach' | 'parent' | 'scout' | 'player'

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
  // Joined
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

// ============================================================
// AUTH
// ============================================================

export const signUp = async (email: string, password: string, metadata?: { full_name?: string; user_type?: UserType }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = () => supabase.auth.getUser()

// ============================================================
// PROFILES
// ============================================================

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

export const createProfile = async (profile: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  return { data, error }
}

// ============================================================
// PLAYERS
// ============================================================

export const getPlayers = async (filters?: { academy_id?: string; club_id?: string }) => {
  let query = supabase.from('players').select('*, profile:profiles(*)')
  if (filters?.academy_id) query = query.eq('academy_id', filters.academy_id)
  if (filters?.club_id) query = query.eq('club_id', filters.club_id)
  const { data, error } = await query
  return { data: data as Player[] || [], error }
}

export const getPlayer = async (playerId: string) => {
  const { data, error } = await supabase
    .from('players')
    .select('*, profile:profiles(*)')
    .eq('id', playerId)
    .single()
  return { data: data as Player, error }
}

export const createPlayer = async (player: Partial<Player>) => {
  const { data, error } = await supabase
    .from('players')
    .insert(player)
    .select()
    .single()
  return { data: data as Player, error }
}

export const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single()
  return { data: data as Player, error }
}

// ============================================================
// EVALUATIONS
// ============================================================

export const getEvaluations = async (playerId: string) => {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('player_id', playerId)
    .order('evaluation_date', { ascending: false })
  return { data: data as Evaluation[] || [], error }
}

export const createEvaluation = async (evaluation: Partial<Evaluation>) => {
  // Calculate overall
  const overall = Math.round((evaluation.technical! + evaluation.tactical! + evaluation.physical! + evaluation.mental!) / 4)
  const { data, error } = await supabase
    .from('evaluations')
    .insert({ ...evaluation, overall })
    .select()
    .single()
  return { data: data as Evaluation, error }
}

// ============================================================
// MATCHES
// ============================================================

export const getMatches = async (clubId?: string) => {
  let query = supabase.from('matches').select('*').order('match_date', { ascending: false })
  if (clubId) query = query.eq('club_id', clubId)
  const { data, error } = await query
  return { data: data as Match[] || [], error }
}

export const createMatch = async (match: Partial<Match>) => {
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single()
  return { data: data as Match, error }
}

// ============================================================
// MATCH STATS
// ============================================================

export const getMatchStats = async (matchId: string) => {
  const { data, error } = await supabase
    .from('match_stats')
    .select('*, player:players(*)')
    .eq('match_id', matchId)
  return { data: data as MatchStats[] || [], error }
}

export const createMatchStats = async (stats: Partial<MatchStats>) => {
  const { data, error } = await supabase
    .from('match_stats')
    .insert(stats)
    .select()
    .single()
  return { data: data as MatchStats, error }
}

export default supabase
