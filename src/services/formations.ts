/**
 * formations.ts — the coach's saved team formations (public.coach_formations).
 * RLS limits every read and write to the signed-in coach's own rows.
 */
import { supabase } from '../lib/supabase'

export interface SavedFormation {
  id: string
  name: string
  formation: string
  /** players.id per position index, null = vacant */
  assignment: (string | null)[]
  /** dragged positions only: { "<index>": { x, y } } in pitch percent */
  positions: Record<string, { x: number; y: number }>
  updated_at: string
}

export interface FormationInput {
  name: string
  formation: string
  assignment: (string | null)[]
  positions: Record<string, { x: number; y: number }>
}

const COLUMNS = 'id,name,formation,assignment,positions,updated_at'

export async function listFormations(): Promise<SavedFormation[]> {
  const { data, error } = await supabase
    .from('coach_formations')
    .select(COLUMNS)
    .order('updated_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(error.message)
  return (data as SavedFormation[]) ?? []
}

export async function createFormation(input: FormationInput): Promise<SavedFormation> {
  const { data, error } = await supabase
    .from('coach_formations')
    .insert({ ...input, name: input.name.trim() })
    .select(COLUMNS)
    .single()
  if (error) throw new Error(error.message)
  return data as SavedFormation
}

export async function updateFormation(id: string, input: FormationInput): Promise<SavedFormation> {
  const { data, error } = await supabase
    .from('coach_formations')
    .update({ ...input, name: input.name.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw new Error(error.message)
  return data as SavedFormation
}

export async function deleteFormation(id: string): Promise<void> {
  const { error } = await supabase.from('coach_formations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
