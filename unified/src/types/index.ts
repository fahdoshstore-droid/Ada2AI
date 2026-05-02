export type UserType = 'admin' | 'coach' | 'player' | 'scout'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  user_type: UserType | null
}

export interface Player {
  id: string
  name: string
  team?: string
  score: number
  rank?: number
}

export interface RankingEntry {
  rank: number
  player_id: string
  player_name: string
  team: string
  score: number
}