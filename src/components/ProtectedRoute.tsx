import { Navigate } from 'react-router'
import { useEffect, useState } from 'react'
import { useAuth, roleDashboard } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

/** Maximum time to wait for profile before redirecting — prevents infinite spinner */
const PROFILE_TIMEOUT_MS = 8000

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const [profileTimedOut, setProfileTimedOut] = useState(false)

  // If user is authenticated but profile is null, start a timeout
  // to prevent infinite spinner when profile fetch fails (e.g. RLS blocks, network error)
  useEffect(() => {
    if (!loading && user && !profile) {
      const timer = setTimeout(() => setProfileTimedOut(true), PROFILE_TIMEOUT_MS)
      return () => clearTimeout(timer)
    }
    setProfileTimedOut(false)
  }, [loading, user, profile])

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

  // Profile fetch timed out or failed — redirect to login with error state
  if (profileTimedOut && !profile) {
    return <Navigate to="/login" replace state={{ error: 'profile_timeout' }} />
  }

  // Authenticated but profile not loaded yet — brief loading spinner
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