/**
 * LoginPage - Real Supabase Authentication
 * Supports: Academy, Club, Coach, Player, Parent, Scout
 */
import React, { useState } from 'react'
import { useNavigate } from 'wouter'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase, signIn, signUp, type UserType } from '@/lib/supabase'
import { Users, Building2, UserCheck, Heart, Search, Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const userTypes = [
  { id: 'academy' as UserType, icon: <Shield size={20} />, labelAr: 'أكاديمية', labelEn: 'Academy' },
  { id: 'club' as UserType, icon: <Building2 size={20} />, labelAr: 'نادي', labelEn: 'Club' },
  { id: 'coach' as UserType, icon: <UserCheck size={20} />, labelAr: 'مدرب', labelEn: 'Coach' },
  { id: 'player' as UserType, icon: <Users size={20} />, labelAr: 'لاعب', labelEn: 'Player' },
  { id: 'parent' as UserType, icon: <Heart size={20} />, labelAr: 'ولي أمر', labelEn: 'Parent' },
  { id: 'scout' as UserType, icon: <Search size={20} />, labelAr: 'كشاف', labelEn: 'Scout' },
]

export default function LoginPage() {
  const { isRTL } = useLanguage()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [userType, setUserType] = useState<UserType>('player')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
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
        // Sign up with Supabase Auth
        const { data, error: signUpError } = await signUp(email, password, {
          full_name: fullName,
          user_type: userType
        })
        
        if (signUpError) throw signUpError
        if (!data.user) throw new Error('No user returned')

        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            user_type: userType,
            full_name: fullName,
            phone: phone || null,
            city: city || null,
            sport: 'football'
          })

        if (profileError) console.error('Profile creation error:', profileError)

        setSuccess(isRTL 
          ? '✅ تم إنشاء الحساب بنجاح!' 
          : '✅ Account created successfully!')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setMode('login')
          setSuccess(null)
        }, 2000)
      } else {
        // Sign in with Supabase Auth
        const { error: signInError } = await signIn(email, password)
        if (signInError) throw signInError
        
        // Success - redirect to dashboard
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || (isRTL ? 'حدث خطأ' : 'An error occurred'))
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'login'
    ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
    : (isRTL ? 'إنشاء حساب جديد' : 'Create New Account')

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
        maxWidth: '480px',
        backgroundColor: '#0A0E1A',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #1F2937'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            color: '#00DCC8',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '8px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            {title}
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
            {isRTL 
              ? 'مرحباً بك في Ada2AI - منصة رياضية متكاملة' 
              : 'Welcome to Ada2AI - Complete Sports Platform'}
          </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#EF4444'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(16,185,129,0.1)',
            border: '1px solid #10B981',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#10B981'
          }}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* User Type Selection (Register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#9CA3AF',
                fontSize: '13px',
                marginBottom: '8px'
              }}>
                {isRTL ? 'نوع الحساب' : 'Account Type'}
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}>
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setUserType(type.id)}
                    style={{
                      padding: '12px 8px',
                      backgroundColor: userType === type.id 
                        ? 'rgba(0,220,200,0.15)' 
                        : 'rgba(255,255,255,0.02)',
                      border: userType === type.id 
                        ? '2px solid #00DCC8' 
                        : '1px solid #374151',
                      borderRadius: '8px',
                      color: userType === type.id ? '#00DCC8' : '#9CA3AF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  >
                    {type.icon}
                    <span>{isRTL ? type.labelAr : type.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full Name (Register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#9CA3AF',
                fontSize: '13px',
                marginBottom: '6px'
              }}>
                {isRTL ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={mode === 'register'}
                placeholder={isRTL ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohammed'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#000A0F',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#EEEFEE',
                  fontSize: '14px',
                  fontFamily: "'Cairo', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#9CA3AF',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              {isRTL ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#000A0F',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#EEEFEE',
                fontSize: '14px',
                fontFamily: "'Cairo', sans-serif",
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#9CA3AF',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              {isRTL ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={isRTL ? '••••••••' : '••••••••'}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#000A0F',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#EEEFEE',
                fontSize: '14px',
                fontFamily: "'Cairo', sans-serif",
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Phone (Register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#9CA3AF',
                fontSize: '13px',
                marginBottom: '6px'
              }}>
                {isRTL ? 'رقم الجوال (اختياري)' : 'Phone Number (Optional)'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isRTL ? '0551234567' : '0551234567'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#000A0F',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#EEEFEE',
                  fontSize: '14px',
                  fontFamily: "'Cairo', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* City (Register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#9CA3AF',
                fontSize: '13px',
                marginBottom: '6px'
              }}>
                {isRTL ? 'المدينة' : 'City'}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#000A0F',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: email ? '#EEEFEE' : '#6B7280',
                  fontSize: '14px',
                  fontFamily: "'Cairo', sans-serif",
                  boxSizing: 'border-box'
                }}
              >
                <option value="">{isRTL ? 'اختر المدينة' : 'Select City'}</option>
                <option value="Riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</option>
                <option value="Jeddah">{isRTL ? 'جدة' : 'Jeddah'}</option>
                <option value="Dammam">{isRTL ? 'الدمام' : 'Dammam'}</option>
                <option value="Mecca">{isRTL ? 'مكة' : 'Mecca'}</option>
                <option value="Medina">{isRTL ? 'المدينة' : 'Medina'}</option>
                <option value="Abha">{isRTL ? 'أبها' : 'Abha'}</option>
                <option value="Other">{isRTL ? 'أخرى' : 'Other'}</option>
              </select>
            </div>
          )}

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
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Cairo', sans-serif",
              marginBottom: '16px'
            }}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading 
              ? (isRTL ? 'جاري التحميل...' : 'Loading...')
              : (mode === 'login' 
                  ? (isRTL ? 'دخول' : 'Sign In')
                  : (isRTL ? 'إنشاء حساب' : 'Create Account')
                )
            }
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{
          textAlign: 'center',
          color: '#9CA3AF',
          fontSize: '14px'
        }}>
          {mode === 'login' ? (
            <>
              {isRTL ? 'ما عندك حساب؟' : "Don't have an account?"}
              {' '}
              <button
                onClick={() => { setMode('register'); setError(null); setSuccess(null) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                {isRTL ? 'سجل هنا' : 'Register here'}
              </button>
            </>
          ) : (
            <>
              {isRTL ? 'عندك حساب؟' : 'Already have an account?'}
              {' '}
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                {isRTL ? 'سجل دخول' : 'Sign in'}
              </button>
            </>
          )}
        </div>

        {/* Demo Mode Notice */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: 'rgba(245,158,11,0.1)',
          borderRadius: '8px',
          border: '1px solid #F59E0B30',
          textAlign: 'center'
        }}>
          <p style={{ color: '#9CA3AF', fontSize: '12px' }}>
            💡 {isRTL 
              ? 'للتجربة: demo@ada2ai.com / password123'
              : 'Demo: demo@ada2ai.com / password123'}
          </p>
        </div>
      </div>
    </div>
  )
}
