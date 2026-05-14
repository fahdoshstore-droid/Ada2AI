import { useState, useEffect } from 'react'
import { supabase, type Player } from '../lib/supabase'

export function useCoachPlayers(clubName?: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })

    if (clubName) {
      query = query.eq('club', clubName)
    }

    query
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setPlayers((data as Player[]) || [])
        setLoading(false)
      })
  }, [clubName])

  return { players, loading, error }
}