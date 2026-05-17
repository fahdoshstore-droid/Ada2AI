/**
 * useOrganizations.ts — Ada2AI (React Query migration)
 */
import { useQuery } from '@tanstack/react-query'
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

async function fetchOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name', { ascending: true })
    .limit(100)

  if (error) throw new Error(error.message)
  return (data as Organization[]) ?? []
}

export function useOrganizations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    // Organizations are fairly static — cache for 15 minutes
    staleTime: 1000 * 60 * 15,
  })

  return {
    organizations: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  }
}
