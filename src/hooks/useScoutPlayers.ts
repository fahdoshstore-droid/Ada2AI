import { useState, useEffect } from 'react'
import { supabase, type Player } from '../lib/supabase'

export function useScoutPlayers(filterPosition?: string) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase
      .from('players')
      .select('*')

    if (filterPosition) {
      query = query.eq('position', filterPosition)
    }

    query
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setPlayers((data as Player[]) || [])
        setLoading(false)
      })
  }, [filterPosition])

  return { players, loading, error }
}