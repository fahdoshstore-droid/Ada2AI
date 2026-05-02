import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingState } from './LoadingState'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'coach' | 'player' | 'scout')[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { userId, loading, role } = useAuth()

  if (loading) {
    return <LoadingState />
  }

  if (!userId) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}