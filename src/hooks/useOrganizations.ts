import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Organization {
  id: string
  name: string
  name_en?: string
  type?: string
  city?: string
  region?: string
  players_count?: number
  staff_count?: number
  rating?: number
  is_verified?: boolean
  logo_url?: string
  website?: string
  created_at?: string
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrganizations() {
      const { data, error: err } = await supabase
        .from('organizations')
        .select('*')
        .order('name', { ascending: true })

      if (err) {
        setError(err.message)
        setOrganizations([])
      } else {
        setOrganizations((data as Organization[]) || [])
      }
      setLoading(false)
    }
    fetchOrganizations()
  }, [])

  return { organizations, loading, error }
}