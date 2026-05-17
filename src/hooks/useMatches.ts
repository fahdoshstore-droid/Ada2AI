/**
 * useMatches.ts — Ada2AI (React Query migration)
 */
import { useQuery } from '@tanstack/react-query'
import { supabase, type Match } from '../lib/supabase'

async function fetchMatches(clubId?: string): Promise<Match[]> {
  let query = supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: false })
    .limit(50)

  if (clubId) query = query.eq('club_id', clubId)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as Match[]) ?? []
}

export function useMatches(clubId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', clubId ?? 'all'],
    queryFn: () => fetchMatches(clubId),
  })

  return {
    matches: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
