import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserType } from '../lib/supabase'
import { Letterbox } from '../components/cinema/Cinema'
import keeperRain from '../assets/cinema/keeper-rain.jpg'

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

  // Redirect authenticated users to their dashboard
  // Handles both: session restore on mount + post-login redirect
  useEffect(() => {
    if (!authLoading && user) {
      if (profile?.user_type) {
        const target = '/welcome'
        navigate(target, { replace: true })
      } else if (profileError) {
        // Profile fetch failed — still redirect, ProtectedRoute will show error
        // Fallback: use user_metadata if available
        const metaType = user.user_metadata?.user_type as UserType | undefined
        if (metaType) {
          navigate('/welcome', { replace: true })
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
      /* Sentry will capture this */
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#000A0F] lg:grid-cols-2" dir="rtl">
      {/* Form side */}
      <div className="relative flex items-center justify-center px-4 pb-16 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_70%_10%,rgba(0,220,200,0.12),transparent_70%)]" aria-hidden="true" />
        <div className="grain-overlay" />
      <div className="relative w-full max-w-md">
        <div className="border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-prime to-scout-blue rounded-xl flex items-center justify-center rotate-45 scale-75">
              <svg className="w-6 h-6 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gradient-teal">Ada2AI</span>
          </div>

          <h1 className="tracking-tightest text-2xl font-black text-ice-white text-center mb-2 arabic-text">
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

            {isSignUp && (
              <p className="text-xs text-ice-muted arabic-text text-center mt-3">
                بالتسجيل أنت توافق على{' '}
                <Link to="/privacy" className="text-teal-prime hover:underline">سياسة الخصوصية</Link>
              </p>
            )}
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
              onClick={() => navigate('/#footage-intel')}
              className="w-full py-2.5 rounded-lg text-sm font-medium border border-teal-prime/30 text-teal-prime hover:bg-teal-prime/10 transition-colors arabic-text"
            >
              عرض تجريبي
            </button>
            <p className="text-ice-muted text-xs mt-2 arabic-text">
              شاهد جولة المنصة وتجربة التحليل بدون تسجيل دخول
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Image side — cinematic frame, desktop only */}
      <aside className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        <img src={keeperRain} alt="" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[68%_50%]" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#000A0F] via-[#000A0F]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F]/90 via-transparent to-[#000A0F]/40" />
        <div className="grain-overlay" />
        <Letterbox height="4svh" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-12">
          <div className="mb-4 flex items-center gap-3 text-sm font-semibold text-teal-prime">
            <span className="h-px w-10 bg-teal-prime" />
            <span className="arabic-text">أدائي</span>
          </div>
          <p className="max-w-md text-4xl font-black leading-[1.3] tracking-tightest text-ice-white arabic-text">
            كل لاعب له قصة.
            <span className="block text-teal-prime">نحن نقيسها.</span>
          </p>
        </div>
      </aside>
    </div>
  )
}