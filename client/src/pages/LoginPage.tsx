/**
 * LoginPage - User authentication page with user type selection
 */
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Link, useLocation } from 'wouter'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { Users, Building2, UserCheck, Heart, Search, ChevronRight } from 'lucide-react'

type UserType = 'player' | 'club' | 'coach' | 'parent' | 'scout'

const userTypes = [
  { id: 'player' as UserType, icon: <Users size={20} />, labelAr: 'لاعب', labelEn: 'Player' },
  { id: 'club' as UserType, icon: <Building2 size={20} />, labelAr: 'نادي', labelEn: 'Club' },
  { id: 'coach' as UserType, icon: <UserCheck size={20} />, labelAr: 'مدرب', labelEn: 'Coach' },
  { id: 'parent' as UserType, icon: <Heart size={20} />, labelAr: 'ولي أمر', labelEn: 'Parent' },
  { id: 'scout' as UserType, icon: <Search size={20} />, labelAr: 'كشاف', labelEn: 'Scout' },
]

export default function LoginPage() {
  const { t, isRTL } = useLanguage()
  const { signIn, signUp } = useAuth()
  const [, navigate] = useLocation()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [userType, setUserType] = useState<UserType>('player')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        const { data, error } = await signUp(email, password)
        if (error) throw error
        // Save user_type to profiles table
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            user_type: userType,
            full_name: name || null,
          })
        }
        setSuccess(isRTL ? '✅ تم إنشاء الحساب! تحقق من بريدك الإلكتروني.' : '✅ Account created! Check your email.')
        setTimeout(() => navigate('/login'), 3000)
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || (isRTL ? 'فشل التسجيل' : 'Authentication failed'))
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'login'
    ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
    : (isRTL ? 'إنشاء حساب' : 'Create Account')

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
        maxWidth: '500px',
        backgroundColor: '#0A0E1A',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #00DCC8'
      }}>
        {/* Header */}
        <h1 style={{
          color: '#00DCC8',
          fontSize: '28px',
          marginBottom: '8px',
          textAlign: 'center',
          fontFamily: "'Cairo', sans-serif"
        }}>
          {title}
        </h1>
        <p style={{
          color: '#94a3b8',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          {isRTL ? 'اختر نوع الحساب وأدخل بياناتك' : 'Choose account type and enter your details'}
        </p>

        {/* User Type Tabs */}
        {(
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {userTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setUserType(type.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: userType === type.id ? '2px solid #00DCC8' : '1px solid #374151',
                  background: userType === type.id ? 'rgba(0,220,200,0.1)' : 'transparent',
                  color: userType === type.id ? '#00DCC8' : '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.2s'
                }}
              >
                {type.icon}
                <span>{isRTL ? type.labelAr : type.labelEn}</span>
              </button>
            ))}
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#EF4444',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10B981',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#10B981',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name (Register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#EEEFEE',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                {isRTL ? 'الاسم' : 'Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#EEEFEE',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
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

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#EEEFEE',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              {isRTL ? 'كلمة المرور' : 'Password'}
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

          {/* Submit Button */}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Cairo', sans-serif"
            }}
          >
            {loading
              ? (isRTL ? 'جاري المعالجة...' : 'Processing...')
              : (mode === 'login'
                  ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
                  : (isRTL ? 'إنشاء حساب' : 'Create Account'))
            }
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          {mode === 'login' ? (
            <>
              {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isRTL ? 'سجل الآن' : 'Sign up'}
              </button>
            </>
          ) : (
            <>
              {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {isRTL ? 'سجل دخولك' : 'Sign in'}
              </button>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}>
            ← {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  )
}
