import { Navigate } from 'react-router'
import { useAuth, roleDashboard } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  // Still loading auth state — show spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but profile not loaded yet — wait for it
  // (profile fetch happens after session is set, brief loading state)
  if (!profile) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Authenticated with profile — check role authorization
  if (allowedRoles && !allowedRoles.includes(profile.user_type)) {
    return <Navigate to={roleDashboard(profile.user_type)} replace />
  }

  return <>{children}</>
}