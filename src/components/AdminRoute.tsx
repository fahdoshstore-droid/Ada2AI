import { Navigate } from 'react-router-dom'
import { useAuth, roleDashboard, isAdmin } from '../contexts/AuthContext'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin(profile)) return <Navigate to={profile ? roleDashboard(profile.user_type) : '/login'} replace />

  return <>{children}</>
}