/**
 * Matches Service — Ada2AI
 * Abstraction layer for all match-related Supabase queries.
 * Uses supabase client (Content-Profile: public) to bypass
 * RLS issues on api schema views.
 */
import { supabase, type Match, type MatchStats } from '../lib/supabase'

/** Fetch all matches, newest first */
export async function getAllMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: false })

  if (error) throw new Error(`Failed to fetch matches: ${error.message}`)
  return (data as Match[]) ?? []
}

/** Fetch a single match by id */
export async function getMatchById(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch match ${id}: ${error.message}`)
  return data as Match | null
}

/** Fetch matches filtered by club (home or away) */
export async function getMatchesByClub(clubId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('club_id', clubId)
    .order('match_date', { ascending: false })

  if (error) throw new Error(`Failed to fetch matches for club ${clubId}: ${error.message}`)
  return (data as Match[]) ?? []
}

/** Fetch matches for a specific season */
export async function getMatchesBySeason(season: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('season', season)
    .order('match_date', { ascending: false })

  if (error) throw new Error(`Failed to fetch matches for season ${season}: ${error.message}`)
  return (data as Match[]) ?? []
}

/** Fetch completed matches only */
export async function getCompletedMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('is_completed', true)
    .order('match_date', { ascending: false })

  if (error) throw new Error(`Failed to fetch completed matches: ${error.message}`)
  return (data as Match[]) ?? []
}

/** Fetch match stats for a specific match */
export async function getMatchStats(matchId: string): Promise<MatchStats[]> {
  const { data, error } = await supabase
    .from('match_stats')
    .select('*')
    .eq('match_id', matchId)

  if (error) throw new Error(`Failed to fetch stats for match ${matchId}: ${error.message}`)
  return (data as MatchStats[]) ?? []
}

/** Fetch match stats for a specific player across all matches */
export async function getPlayerMatchStats(playerId: string): Promise<MatchStats[]> {
  const { data, error } = await supabase
    .from('match_stats')
    .select('*')
    .eq('player_id', playerId)

  if (error) throw new Error(`Failed to fetch match stats for player ${playerId}: ${error.message}`)
  return (data as MatchStats[]) ?? []
}

/** Create a new match */
export async function createMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single()

  if (error) throw new Error(`Failed to create match: ${error.message}`)
  return data as Match
}

/** Update an existing match */
export async function updateMatch(id: string, updates: Partial<Omit<Match, 'id' | 'created_at'>>): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update match ${id}: ${error.message}`)
  return data as Match
}