/**
 * ProtectedRoute - Auth guard + optional role-based access control
 * - Unauthenticated users → /login
 * - Role mismatch → redirect to user's own dashboard
 */
import React from 'react'
import { Redirect } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile, roleDashboardPaths } from '@/hooks/useProfile'
import type { UserType } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** If provided, only these roles may access; others are redirected to their own dashboard */
  allowedRoles?: UserType[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { role, loading: profileLoading } = useProfile()

  // Still resolving auth state
  if (authLoading || profileLoading) {
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

  // Role guard
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const destination = roleDashboardPaths[role] || '/dashboard'
    return <Redirect to={destination} />
  }

  return <>{children}</>
}