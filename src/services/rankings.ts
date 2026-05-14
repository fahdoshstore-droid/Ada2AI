/**
 * Rankings Service — Ada2AI
 * Abstraction layer for ranking/evaluation-related Supabase queries.
 * Uses supabase client (Content-Profile: public) to bypass
 * RLS issues on api schema views.
 */
import { supabase, type Player, type Evaluation } from '../lib/supabase'

/** Fetch all evaluations, newest first */
export async function getAllEvaluations(): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .order('evaluation_date', { ascending: false })

  if (error) throw new Error(`Failed to fetch evaluations: ${error.message}`)
  return (data as Evaluation[]) ?? []
}

/** Fetch evaluations for a specific player */
export async function getEvaluationsByPlayer(playerId: string): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('player_id', playerId)
    .order('evaluation_date', { ascending: false })

  if (error) throw new Error(`Failed to fetch evaluations for player ${playerId}: ${error.message}`)
  return (data as Evaluation[]) ?? []
}

/** Fetch the latest evaluation for a player */
export async function getLatestEvaluation(playerId: string): Promise<Evaluation | null> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('player_id', playerId)
    .order('evaluation_date', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // PGRST116 = no rows returned, which is fine here
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch latest evaluation for player ${playerId}: ${error.message}`)
  }
  return data as Evaluation | null
}

/** Create a new evaluation */
export async function createEvaluation(
  evaluation: Omit<Evaluation, 'id' | 'created_at'>
): Promise<Evaluation> {
  const { data, error } = await supabase
    .from('evaluations')
    .insert(evaluation)
    .select()
    .single()

  if (error) throw new Error(`Failed to create evaluation: ${error.message}`)
  return data as Evaluation
}

/** Update an existing evaluation */
export async function updateEvaluation(
  id: string,
  updates: Partial<Omit<Evaluation, 'id' | 'created_at'>>
): Promise<Evaluation> {
  const { data, error } = await supabase
    .from('evaluations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update evaluation ${id}: ${error.message}`)
  return data as Evaluation
}

/** Ranked player entry combining player info with their rating */
export interface RankedPlayer {
  id: string
  name: string
  club: string
  position: string
  rating: number
  rank: number
}

/** Get ranked players — combines player data with their best evaluation rating */
export async function getRankedPlayers(filterPosition?: string): Promise<RankedPlayer[]> {
  // Fetch all players (optionally filtered by position)
  let playerQuery = supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false })

  if (filterPosition) {
    playerQuery = playerQuery.eq('position', filterPosition)
  }

  const { data: players, error: pErr } = await playerQuery
  if (pErr) throw new Error(`Failed to fetch players for rankings: ${pErr.message}`)

  // Fetch all evaluations to compute best rating per player
  const { data: evaluations, error: eErr } = await supabase
    .from('evaluations')
    .select('player_id, overall')

  if (eErr) throw new Error(`Failed to fetch evaluations for rankings: ${eErr.message}`)

  // Build a map of player_id → best overall rating
  const ratingMap = new Map<string, number>()
  for (const ev of (evaluations as Pick<Evaluation, 'player_id' | 'overall'>[]) ?? []) {
    const current = ratingMap.get(ev.player_id)
    if (current === undefined || ev.overall > current) {
      ratingMap.set(ev.player_id, ev.overall)
    }
  }

  // Merge and sort
  const ranked: RankedPlayer[] = ((players as Player[]) ?? [])
    .map((p) => ({
      id: p.id,
      name: p.name || 'لاعب',
      club: p.club || '—',
      position: p.position || '—',
      rating: ratingMap.get(p.id) ?? 0,
      rank: 0,
    }))
    .sort((a, b) => b.rating - a.rating)
    .map((p, i) => ({ ...p, rank: i + 1 }))

  return ranked
}