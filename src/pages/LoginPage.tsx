import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth, roleDashboard } from '../contexts/AuthContext'
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

  // Redirect authenticated users to their dashboard via useEffect (not during render)
  useEffect(() => {
    if (!authLoading && user && profile?.user_type) {
      console.log('[LOGIN] Redirecting to:', roleDashboard(profile.user_type))
      navigate(roleDashboard(profile.user_type), { replace: true })
    }
  }, [user, profile, authLoading, navigate])

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
    setLoading(false)
  }

  // Show spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
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
        </div>
      </div>
    </div>
  )
}