import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth, roleDashboard } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

/** Maximum time to wait for profile before showing error — prevents infinite spinner */
const PROFILE_TIMEOUT_MS = 5000

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, profileError, refreshProfile, signOut } = useAuth()
  const [profileTimedOut, setProfileTimedOut] = useState(false)

  // If user is authenticated but profile is null, start a timeout
  useEffect(() => {
    if (!loading && user && !profile) {
      const timer = setTimeout(() => setProfileTimedOut(true), PROFILE_TIMEOUT_MS)
      return () => clearTimeout(timer)
    }
    setProfileTimedOut(false)
  }, [loading, user, profile])

  // 1. Still loading auth state — show spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // 2. Not authenticated — redirect to login // verified
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 3. Profile fetch failed or timed out — show error with retry
  if (profileTimedOut && !profile) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ice-white arabic-text mb-2">فشل تحميل الملف الشخصي</h2>
          <p className="text-ice-muted arabic-text text-sm mb-4">
            {profileError || 'تعذر تحميل بيانات الملف الشخصي. يرجى المحاولة مرة أخرى.'}
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => { setProfileTimedOut(false); refreshProfile() }}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-semibold arabic-text hover:shadow-lg hover:shadow-teal-prime/25 transition-all"
            >
              إعادة المحاولة
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 rounded-lg border border-ice-muted/20 text-ice-muted text-sm arabic-text hover:bg-white/5 transition-colors"
              >
                العودة للرئيسية
              </button>
              <button
                onClick={() => { signOut(); window.location.href = '/login' }}
                className="flex-1 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm arabic-text hover:bg-red-500/10 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 4. Authenticated but profile not loaded yet — brief loading spinner // verified
  if (!profile) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ice-muted arabic-text text-sm">جاري تحميل الملف الشخصي...</p>
        </div>
      </div>
    )
  }

  // 5. Authenticated with profile — check role authorization // verified
  if (allowedRoles && !allowedRoles.includes(profile.user_type)) {
    return <Navigate to={roleDashboard(profile.user_type)} replace />
  }

  return <>{children}</>
}