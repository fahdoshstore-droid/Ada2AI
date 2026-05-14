/**
 * Players Service — Ada2AI
 * Abstraction layer for all player-related Supabase queries.
 * Uses supabase client (Content-Profile: public) to bypass
 * RLS issues on api schema views.
 */
import { supabase, type Player } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

/** Fetch all players, newest first */
export async function getAllPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    trackEvent('loadError', { source: 'players', reason: error.message })
    throw new Error(`Failed to fetch players: ${error.message}`)
  }
  return (data as Player[]) ?? []
}

/** Fetch a single player by id */
export async function getPlayerById(id: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch player ${id}: ${error.message}`)
  return data as Player | null
}

/** Fetch players filtered by club */
export async function getPlayersByClub(club: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('club', club)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch players for club ${club}: ${error.message}`)
  return (data as Player[]) ?? []
}

/** Fetch players filtered by position */
export async function getPlayersByPosition(position: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('position', position)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch players for position ${position}: ${error.message}`)
  return (data as Player[]) ?? []
}

/** Search players by name (case-insensitive partial match) */
export async function searchPlayers(query: string): Promise<Player[]> {
  trackEvent('searchPlayers', { query })
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    trackEvent('loadError', { source: 'players', reason: error.message })
    throw new Error(`Failed to search players: ${error.message}`)
  }
  return (data as Player[]) ?? []
}

/** Create a new player */
export async function createPlayer(player: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert(player)
    .select()
    .single()

  if (error) throw new Error(`Failed to create player: ${error.message}`)
  return data as Player
}

/** Update an existing player */
export async function updatePlayer(id: string, updates: Partial<Omit<Player, 'id' | 'created_at'>>): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update player ${id}: ${error.message}`)
  return data as Player
}

/** Delete a player */
export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Failed to delete player ${id}: ${error.message}`)
}