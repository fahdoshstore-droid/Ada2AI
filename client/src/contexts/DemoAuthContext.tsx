/**
 * DemoAuthContext - Demo mode authentication (no login required)
 * Anyone can browse the app without authentication
 */
import React, { createContext, useContext, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'

// Demo user for testing
const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@ada2ai.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { name: 'Demo User', user_type: 'player' }
} as User

const DEMO_SESSION: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: DEMO_USER
}

interface DemoAuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isDemo: boolean
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  setUserType: (type: 'player' | 'club' | 'coach' | 'parent' | 'scout') => void
  userType: string
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined)

export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User | null>(DEMO_USER)
  const [session] = useState<Session | null>(DEMO_SESSION)
  const [loading] = useState(false)
  const [userType, setUserType] = useState<string>('player')

  const signUp = async (_email: string, _password: string) => {
    // Demo mode - no actual signup
    return { error: null }
  }

  const signIn = async (_email: string, _password: string) => {
    // Demo mode - always succeeds
    return { error: null }
  }

  const signOut = async () => {
    // Demo mode - no actual logout
    return { error: null }
  }

  return (
    <DemoAuthContext.Provider value={{
      user,
      session,
      loading,
      isDemo: true,
      signUp,
      signIn,
      signOut,
      setUserType,
      userType
    }}>
      {children}
    </DemoAuthContext.Provider>
  )
}

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext)
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider')
  }
  return context
}
