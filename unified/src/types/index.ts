export type Role = 'admin' | 'coach' | 'player'
export type OrganizationType = 'club' | 'academy'

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  organization_id: string
  role: Role
  organizations?: Organization
}

export interface User {
  id: string
  email: string
  role?: Role
  organization?: Organization
  membership?: Membership
}

export interface Player {
  id: string
  name: string
  team?: string
  score: number
  rank?: number
  organization_id?: string
}

export interface RankingEntry {
  rank: number
  player_id: string
  player_name: string
  team: string
  score: number
  organization?: string
}
