import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Evaluation {
  id: string
  player_id: string
  overall?: number
  physical?: number
  technical?: number
  tactical?: number
  mental?: number
  evaluation_date?: string
  evaluator_id?: string
  notes?: string
  player?: {
    name?: string
    name_ar?: string
    position?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export function useAllEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('evaluations')
          .select('*, player:players(name, name_ar, position)')
          .order('evaluation_date', { ascending: false })

        if (err) throw err
        setEvaluations((data || []) as Evaluation[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch evaluations')
      } finally {
        setLoading(false)
      }
    }

    fetchEvaluations()
  }, [])

  return { evaluations, loading, error }
}