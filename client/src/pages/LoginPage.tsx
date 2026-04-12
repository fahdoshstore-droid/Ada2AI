/**
 * LoginPage - User authentication page
 */
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage('✅ Check your email for confirmation link!')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        // Redirect will happen automatically via AuthContext
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#0A0E1A',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #00DCC8'
      }}>
        <h1 style={{
          color: '#00DCC8',
          fontSize: '28px',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p style={{
          color: '#94a3b8',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {isSignUp ? 'Start your journey with Ada2AI' : 'Sign in to your account'}
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#EF4444'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10B981',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#10B981'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#EEEFEE',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#000A0F',
                border: '1px solid #007ABA',
                borderRadius: '8px',
                color: '#EEEFEE',
                fontSize: '16px'
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#EEEFEE',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#000A0F',
                border: '1px solid #007ABA',
                borderRadius: '8px',
                color: '#EEEFEE',
                fontSize: '16px'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#007ABA80' : '#00DCC8',
              color: '#000A0F',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign up
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
