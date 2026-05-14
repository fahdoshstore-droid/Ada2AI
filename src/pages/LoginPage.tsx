import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, roleDashboard } from '../contexts/AuthContext'
import { useDemoMode } from '../hooks/useDemoMode'
import type { UserType } from '../lib/supabase'

export default function LoginPage() {
  const { signIn, signUp, user, profile, profileError, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [userType, setUserType] = useState<UserType>('player')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { enableDemo } = useDemoMode()

  // Redirect authenticated users to their dashboard
  // Handles both: session restore on mount + post-login redirect
  useEffect(() => {
    if (!authLoading && user) {
      if (profile?.user_type) {
        const target = roleDashboard(profile.user_type)
        console.log('[LOGIN] Redirecting to:', target)
        navigate(target, { replace: true })
      } else if (profileError) {
        // Profile fetch failed — still redirect, ProtectedRoute will show error
        console.warn('[LOGIN] Profile error, redirecting based on user metadata')
        // Fallback: use user_metadata if available
        const metaType = user.user_metadata?.user_type as UserType | undefined
        if (metaType) {
          navigate(roleDashboard(metaType), { replace: true })
        }
      }
      // If profile is still loading (null, no error), wait — onAuthStateChange will re-trigger this effect
    }
  }, [user, profile, profileError, authLoading, navigate])

  // Show profile error if auth succeeded but profile failed
  useEffect(() => {
    if (profileError && user) {
      setError(profileError)
    }
  }, [profileError, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password, {
          full_name: name,
          user_type: userType,
        })
        if (err) setError(err)
        else setError('تحقق من بريدك الإلكتروني لتفعيل الحساب')
      } else {
        const { error: err } = await signIn(email, password)
        if (err) setError(err)
        // onSuccess: onAuthStateChange will trigger → profile loads → useEffect redirects
      }
    } catch (err) {
      console.error('[LOGIN] handleSubmit exception:', err)
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-prime/10 rounded-full blur-[128px]" />

      <div className="relative w-full max-w-md mx-4">
        <div className="glass-card rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-prime to-scout-blue rounded-xl flex items-center justify-center rotate-45 scale-75">
              <svg className="w-6 h-6 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gradient-teal">Ada2AI</span>
          </div>

          <h1 className="text-2xl font-bold text-ice-white text-center mb-2 arabic-text">
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h1>
          <p className="text-ice-muted text-center text-sm mb-6 arabic-text">
            {isSignUp ? 'انضم لاكتشاف المواهب الرياضية' : 'أدخل بياناتك للوصول لحسابك'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm arabic-text text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-ice-muted text-sm mb-1 arabic-text">الاسم الكامل</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-navy-light border border-white/10 text-ice-white focus:border-teal-prime focus:outline-none transition-colors arabic-text"
                    placeholder="محمد العلي"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-ice-muted text-sm mb-1 arabic-text">نوع الحساب</label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className="w-full px-4 py-3 rounded-lg bg-navy-light border border-white/10 text-ice-white focus:border-teal-prime focus:outline-none transition-colors arabic-text"
                    dir="rtl"
                  >
                    <option value="player">لاعب</option>
                    <option value="coach">مدرب</option>
                    <option value="scout">كشاف</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-ice-muted text-sm mb-1 arabic-text">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-navy-light border border-white/10 text-ice-white focus:border-teal-prime focus:outline-none transition-colors"
                placeholder="player@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-ice-muted text-sm mb-1 arabic-text">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-navy-light border border-white/10 text-ice-white focus:border-teal-prime focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark hover:shadow-lg hover:shadow-teal-prime/25 transition-all duration-300 disabled:opacity-50 arabic-text"
            >
              {loading ? 'جاري التحميل...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
              className="text-sm text-teal-prime hover:text-teal-light transition-colors arabic-text"
            >
              {isSignUp ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حسابًا'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <button
              onClick={() => { enableDemo(); navigate('/sport-id', { replace: true }) }}
              className="w-full py-2.5 rounded-lg text-sm font-medium border border-teal-prime/30 text-teal-prime hover:bg-teal-prime/10 transition-colors arabic-text"
            >
              🎬 عرض تجريبي
            </button>
            <p className="text-ice-muted text-xs mt-2 arabic-text">
              استعرض المنصة بدون تسجيل دخول
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}