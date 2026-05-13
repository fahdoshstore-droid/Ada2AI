import { useState, useEffect } from 'react'
import { supabase, type Player } from '../lib/supabase'

export function useCoachPlayers(coachId?: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase
      .from('players')
      .select('*, profile:profiles(*)')

    if (coachId) {
      // Filter players assigned to this coach's club/academy
      query = query.eq('club_id', coachId)
    }

    query
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setPlayers((data as Player[]) || [])
        setLoading(false)
      })
  }, [coachId])

  return { players, loading, error }
}