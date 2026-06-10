import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LoadingState } from '../components/LoadingState'

type AuthMode = 'login' | 'register'

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .maybeSingle()

          if (profile?.user_type) {
            navigate(`/app/${profile.user_type}`, { replace: true })
          } else {
            navigate('/app', { replace: true })
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          setMessage('تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.')
          setMode('login')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !error && !message) {
    return <LoadingState />
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000A0F',
      fontFamily: "'Cairo', sans-serif",
      direction: 'rtl',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        backgroundColor: '#0D1E35',
        borderRadius: '16px',
        border: '1px solid rgba(0, 220, 200, 0.15)',
        boxShadow: '0 0 30px rgba(0, 220, 200, 0.08)',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#00DCC8', letterSpacing: '-0.01em' }}>
          {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </h2>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#FF4444',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#6B8099' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid rgba(0, 220, 200, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                direction: 'ltr',
                textAlign: 'right',
                backgroundColor: '#0A1628',
                color: '#EEEFEE',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#6B8099' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid rgba(0, 220, 200, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                direction: 'ltr',
                textAlign: 'right',
                backgroundColor: '#0A1628',
                color: '#EEEFEE',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: loading ? 'rgba(0, 220, 200, 0.3)' : 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)',
              color: loading ? '#6B8099' : '#000A0F',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? 'جاري التحميل...' : mode === 'login' ? 'دخول' : 'إنشاء حساب'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
              setMessage(null)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00DCC8',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {mode === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخول'}
          </button>
        </div>
      </div>
    </div>
  )
}
