import { useState, useEffect } from 'react'
import { supabase, type Player } from '../lib/supabase'

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('players')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setPlayers((data as Player[]) || [])
        setLoading(false)
      })
  }, [])

  return { players, loading, error }
}