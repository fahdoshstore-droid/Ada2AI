import { useState, useEffect } from 'react'
import { supabase, type Match } from '../lib/supabase'

export function useMatches(clubId?: string) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase.from('matches').select('*').order('match_date', { ascending: false })
    if (clubId) query = query.eq('club_id', clubId)

    query.then(({ data, error: err }) => {
      if (err) setError(err.message)
      else setMatches((data as Match[]) || [])
      setLoading(false)
    })
  }, [clubId])

  return { matches, loading, error }
}