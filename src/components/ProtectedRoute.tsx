import { Navigate } from 'react-router'
import { useAuth, roleDashboard } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && profile?.user_type && !allowedRoles.includes(profile.user_type)) {
    return <Navigate to={roleDashboard(profile.user_type)} replace />
  }

  return <>{children}</>
}