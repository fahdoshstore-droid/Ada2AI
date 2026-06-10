import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LoadingState } from './LoadingState'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'coach' | 'player' | 'scout')[]
}

const MAX_LOADING_MS = 8000

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { userId, loading, role } = useAuth()
  const [loadingTooLong, setLoadingTooLong] = useState(false)

  useEffect(() => {
    if (!loading) {
      setLoadingTooLong(false)
      return
    }
    const timer = setTimeout(() => setLoadingTooLong(true), MAX_LOADING_MS)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading && loadingTooLong) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f0f6ff',
        direction: 'rtl',
        fontFamily: "'Noto Kufi Arabic', system-ui, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '32px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #fde68a',
          maxWidth: '400px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1e293b' }}>تعذر التحقق من تسجيل الدخول</h3>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b' }}>
            انتهت مهلة التحقق. حاول مرة أخرى.
          </p>
          <button
            onClick={() => window.location.href = '/auth'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00C2A8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

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