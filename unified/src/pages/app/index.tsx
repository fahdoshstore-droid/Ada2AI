import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'

export function AppIndex() {
  const { loading, role } = useAuth()

  if (loading) return <LoadingState />

  if (!role) return <Navigate to="/app" replace />

  const routes: Record<string, string> = {
    admin: '/app/admin',
    coach: '/app/coach',
    player: '/app/player',
  }

  return <Navigate to={routes[role] || '/auth'} replace />
}
