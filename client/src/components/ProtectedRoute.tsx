/**
 * ProtectedRoute - Auth guard (simplified, no profile blocking)
 * - Unauthenticated users → /login
 * - Role check only active after profile loads (non-blocking)
 */
import React, { useState } from 'react'
import { Redirect } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile, roleDashboardPaths } from '@/hooks/useProfile'
import type { UserType } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserType[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { role, error: profileError, retry } = useProfile()
  const [dismissed, setDismissed] = useState(false)

  // Only block on auth — never on profile
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9CA3AF',
        fontFamily: "'Cairo', sans-serif",
      }}>
        Loading...
      </div>
    )
  }

  // Not logged in → login
  if (!user) {
    return <Redirect to="/login" />
  }

  // Profile failed to load — show simple error with actions
  if (profileError && !dismissed) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '420px',
          backgroundColor: '#0A0E1A',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #1F2937',
          textAlign: 'center',
        }}>
          <p style={{ color: '#F59E0B', fontSize: '16px', fontFamily: "'Cairo', sans-serif", marginBottom: '12px' }}>
            ⚠️ تعذر تحميل الملف الشخصي
          </p>
          <p style={{ color: '#9CA3AF', fontSize: '14px', fontFamily: "'Cairo', sans-serif", marginBottom: '24px' }}>
            قد يكون الخادم غير متصل. حاول مرة أخرى.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => { setDismissed(true) }}
              style={{
                padding: '10px 24px',
                backgroundColor: '#00DCC8',
                color: '#000A0F',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              متابعة
            </button>
            <button
              onClick={() => { retry(); setDismissed(false) }}
              style={{
                padding: '10px 24px',
                backgroundColor: '#374151',
                color: '#EEEFEE',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Role guard — only apply if profile has loaded (role is known)
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const destination = roleDashboardPaths[role] || '/dashboard/player'
    return <Redirect to={destination} />
  }

  return <>{children}</>
}
