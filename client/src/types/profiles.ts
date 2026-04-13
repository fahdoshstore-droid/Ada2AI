// Profile Types for Ada2AI

export type UserType = 'player' | 'club' | 'coach' | 'parent' | 'scout'

export interface Profile {
  id: string
  user_id: string
  user_type: UserType
  full_name: string
  phone?: string
  avatar_url?: string
  sport?: string
  region?: string
  city?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PlayerProfile extends Profile {
  user_type: 'player'
  position?: string
  age?: number
  height_cm?: number
  weight_kg?: number
  dominant_foot?: 'left' | 'right' | 'both'
  jersey_number?: number
  achievements?: string
  video_url?: string
  stats?: Record<string, any>
}

export interface ClubProfile extends Profile {
  user_type: 'club'
  club_name: string
  league?: string
  founded_year?: number
  stadium?: string
  website?: string
  description?: string
  logo_url?: string
}

export interface CoachProfile extends Profile {
  user_type: 'coach'
  certification?: string
  specialization?: string
  years_experience?: number
  previous_teams?: string
  coaching_license?: string
  achievements?: string
}

export interface ScoutProfile extends Profile {
  user_type: 'scout'
  organization?: string
  region_covered?: string
  sports_scouted?: string
  scouting_since?: number
  notes?: string
}

export interface ParentProfile extends Profile {
  user_type: 'parent'
  children?: Array<{
    name: string
    age: number
    sport?: string
    player_id?: string
  }>
  emergency_contact?: string
  relationship?: string
}
