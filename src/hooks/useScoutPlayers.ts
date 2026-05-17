/**
 * useScoutPlayers.ts — Ada2AI (React Query migration + Pagination)
 * 
 * Before: useEffect + select('*') with no limit
 * After:  useQuery with pagination — max 20 per page
 */
import { useQuery } from '@tanstack/react-query'
import { supabase, type Player } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

const PAGE_SIZE = 20

async function fetchScoutPlayers(
  position?: string,
  page = 0
): Promise<Player[]> {
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)  // ← pagination — never fetches all rows

  if (position) {
    query = query.eq('position', position)
  }

  const { data, error } = await query

  if (error) {
    trackEvent('loadError', { source: 'scoutPlayers', reason: error.message })
    throw new Error(error.message)
  }

  return (data as Player[]) ?? []
}

export function useScoutPlayers(filterPosition?: string, page = 0) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['scout-players', filterPosition ?? 'all', page],
    queryFn: () => fetchScoutPlayers(filterPosition, page),
  })

  return {
    players: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    pageSize: PAGE_SIZE,
  }
}
