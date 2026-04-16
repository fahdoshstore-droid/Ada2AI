/**
 * Shared types for Coach Dashboard components
 */

// Re-export GuideSession from VisualGuide for convenience
export type { GuideSession } from '@/components/VisualGuide'

export interface Player {
  id: string
  name: string
  name_ar: string
  sport: string
  position: string
  age: number
  rating: number
  academy_name: string
  performance: number
  attendance: number
  goals: number
  assists: number
  number: string
  status: string
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