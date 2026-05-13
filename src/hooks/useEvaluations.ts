import { useState, useEffect } from 'react'
import { supabase, type Evaluation } from '../lib/supabase'

export function useEvaluations(playerId?: string) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase.from('evaluations').select('*').order('evaluation_date', { ascending: false })
    if (playerId) query = query.eq('player_id', playerId)

    query.then(({ data, error: err }) => {
      if (err) setError(err.message)
      else setEvaluations((data as Evaluation[]) || [])
      setLoading(false)
    })
  }, [playerId])

  return { evaluations, loading, error }
}