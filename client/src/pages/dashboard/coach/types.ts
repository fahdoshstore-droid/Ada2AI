/**
 * Shared types for Coach Dashboard components
 * Aligned with Supabase schema: profiles, players, evaluations, matches, match_stats
 */

// Re-export GuideSession from VisualGuide for convenience
export type { GuideSession } from '@/components/VisualGuide'

/**
 * Player type matching the Supabase `players` + `profiles` join.
 * UI components reference fields like `name`, `age`, `position`, `rating`, etc.
 * These are mapped from the Supabase Player + Profile in useCoachDashboard.
 */
export interface Player {
  id: string
  profile_id?: string
  name: string          // from profile.full_name
  name_ar?: string      // from profile.full_name (Arabic)
  sport?: string        // from profile.sport
  position?: string     // from players.position
  age?: number          // from players.age
  rating: number        // from evaluations.overall (latest) or 0
  academy_name?: string // from linked academy/club
  performance: number   // derived from evaluation
  attendance: number    // derived from session records (0-100)
  goals: number         // from match_stats sum
  assists: number       // from match_stats sum
  number: string        // from players.jersey_number
  status: string        // 'active' | 'inactive' | etc.
  region?: string       // from profiles.region
  photo_url?: string    // from players.photo_url
  video_url?: string    // from players.video_url
  height_cm?: number    // from players.height_cm
  weight_kg?: number    // from players.weight_kg
  dominant_foot?: string // from players.dominant_foot
  // Evaluation breakdown (latest)
  technical?: number
  tactical?: number
  physical?: number
  mental?: number
}

export interface Training {
  id: number
  title: string
  titleEn: string
  date: string
  time: string
  attendance: (string | number)[]
  maxAttendance: number
}

export interface AttendanceRecord {
  playerId: number
  present: number
  absent: number
  rate: number
}

export interface Evaluation {
  playerId: string | null
  technical: number
  tactical: number
  physical: number
  mental: number
  notes: string
}

export interface NewTraining {
  title: string
  titleEn: string
  date: string
  time: string
}

export type ActiveTab = 'players' | 'training' | 'stats' | 'attendance'