/**
 * useDemoMode — Ada2AI
 * Detects ?demo=true query param, returns demo state.
 * When demo is active: bypasses Supabase, uses local mock data.
 */
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

export function useDemoMode() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  const enableDemo = () => {
    setSearchParams({ demo: 'true' })
  }

  const disableDemo = () => {
    setSearchParams({})
  }

  return useMemo(
    () => ({ isDemo, enableDemo, disableDemo }),
    [isDemo]
  )
}
