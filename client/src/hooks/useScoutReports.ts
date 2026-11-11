/**
 * useScoutReports - the signed-in scout's evaluation reports (scout_reports table).
 * RLS limits every query to the scout's own rows; total_score is computed by the database.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { sanitizeRatings, type ScoutReport, type ScoutReportDraft } from '@/lib/scoutReport'

const TABLE = 'scout_reports'

function fromRow(row: any): ScoutReport {
  return {
    id: row.id,
    scout_id: row.scout_id,
    player_id: row.player_id ?? null,
    player_name: row.player_name ?? '',
    birth_year: row.birth_year ?? null,
    club: row.club ?? '',
    position: row.position ?? '',
    pitch_positions: Array.isArray(row.pitch_positions) ? row.pitch_positions : [],
    target_category: row.target_category ?? '',
    discovery_date: row.discovery_date ?? '',
    match: row.match ?? '',
    ratings: sanitizeRatings(row.ratings),
    notes: {
      technical: row.notes?.technical ?? '',
      tactical: row.notes?.tactical ?? '',
      physical: row.notes?.physical ?? '',
      mental: row.notes?.mental ?? '',
    },
    scout_opinion: row.scout_opinion ?? '',
    scout_name: row.scout_name ?? '',
    total_score: row.total_score ?? 0,
    created_at: row.created_at ?? '',
    updated_at: row.updated_at ?? '',
  }
}

function toRow(d: ScoutReportDraft) {
  return {
    player_id: d.player_id,
    player_name: d.player_name.trim(),
    birth_year: d.birth_year,
    club: d.club.trim(),
    position: d.position.trim(),
    pitch_positions: d.pitch_positions,
    target_category: d.target_category.trim(),
    discovery_date: d.discovery_date,
    match: d.match.trim(),
    ratings: sanitizeRatings(d.ratings),
    notes: d.notes,
    scout_opinion: d.scout_opinion.trim(),
    scout_name: d.scout_name.trim(),
  }
}

export function useScoutReports() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const queryKey = ['scoutReports', user?.id]

  const list = useQuery<ScoutReport[]>({
    queryKey,
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('scout_id', user!.id)
        .order('discovery_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(fromRow)
    },
    staleTime: 60 * 1000,
  })

  const save = useMutation({
    mutationFn: async ({ id, draft }: { id?: string; draft: ScoutReportDraft }) => {
      if (!user?.id) throw new Error('not-authenticated')
      const query = id
        ? supabase.from(TABLE).update(toRow(draft)).eq('id', id)
        : supabase.from(TABLE).insert({ ...toRow(draft), scout_id: user.id })
      const { data, error } = await query.select().single()
      if (error) throw error
      return fromRow(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })

  return {
    reports: list.data ?? [],
    isLoading: list.isLoading,
    isError: list.isError,
    error: list.error,
    save,
    remove,
  }
}
