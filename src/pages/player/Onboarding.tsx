/**
 * Player Onboarding — Ada2AI
 * 
 * The FIRST real operational flow:
 * player signs up → completes this form → appears in scout dashboard
 * 
 * Writes to: public.players (existing table, no schema changes)
 * RLS check: auth.uid() = user_id (policy already exists in schema)
 */
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import { queryClient } from '../../lib/queryClient'
import {
  User,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────

type Foot = 'right' | 'left' | 'both'

interface Step1 {
  sport: string
  position: string
  birth_year: number
}

interface Step2 {
  height_cm: number | ''
  weight_kg: number | ''
  dominant_foot: Foot
  club: string
  region: string
}

// ── Constants ─────────────────────────────────────────────────

const SPORTS = ['كرة القدم', 'كرة السلة', 'كرة الطائرة', 'سباحة', 'ألعاب القوى', 'أخرى']

const POSITIONS: Record<string, string[]> = {
  'كرة القدم': ['مهاجم', 'وسط', 'مدافع', 'حارس مرمى', 'جناح أيمن', 'جناح أيسر'],
  'كرة السلة': ['مركز', 'جناح', 'جناح مهاجم', 'حارس', 'صانع اللعب'],
  'كرة الطائرة': ['ضارب', 'مستقبل', 'موزع', 'قاطع'],
}

const REGIONS = [
  'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'القصيم', 'المنطقة الشرقية',
  'عسير', 'تبوك', 'حائل', 'نجران', 'جازان', 'الباحة', 'الجوف', 'الحدود الشمالية'
]

const CURRENT_YEAR = new Date().getFullYear()
const BIRTH_YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - 13 - i)

// ── Component ─────────────────────────────────────────────────

export default function PlayerOnboarding() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const completedRef = useRef(false)

  const [step1, setStep1] = useState<Step1>({
    sport: '',
    position: '',
    birth_year: 2000,
  })

  const [step2, setStep2] = useState<Step2>({
    height_cm: '',
    weight_kg: '',
    dominant_foot: 'right',
    club: '',
    region: '',
  })

  // Track abandonment only if user leaves the page without completing
  useEffect(() => {
    return () => {
      if (!completedRef.current) {
        trackEvent('onboarding_abandoned', { step })
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validation ────────────────────────────────────────────

  const sportHasPositions = step1.sport && POSITIONS[step1.sport]
  const step1Valid = step1.sport && step1.birth_year && (sportHasPositions ? step1.position : true)

  const step2Valid =
    step2.dominant_foot &&
    step2.region

  // ── Submit ────────────────────────────────────────────────

  async function handleSubmit() {
    if (!user || !profile) return
    setSubmitting(true)
    setError(null)

    const age = CURRENT_YEAR - step1.birth_year

    const payload = {
      user_id: user.id,
      name: profile.full_name ?? '',
      sport: step1.sport,
      position: step1.position,
      age,
      dominant_foot: step2.dominant_foot,
      height_cm: step2.height_cm !== '' ? Number(step2.height_cm) : null,
      weight_kg: step2.weight_kg !== '' ? Number(step2.weight_kg) : null,
      club: step2.club || null,
      nationality: 'سعودي',
      is_verified: false,
    }

    const { error: insertError } = await supabase
      .from('players')
      .insert(payload)

    if (insertError) {
      setError('فشل حفظ البيانات. حاول مرة أخرى.')
      setSubmitting(false)
      trackEvent('onboarding_failed', { reason: insertError.message })
      return
    }

    // Invalidate players cache so scout dashboard refreshes
    queryClient.invalidateQueries({ queryKey: ['players'] })
    queryClient.invalidateQueries({ queryKey: ['scout-players'] })

    trackEvent('playerOnboardingComplete', { sport: step1.sport, position: step1.position })
    trackEvent('onboarding_completed', { sport: step1.sport, position: step1.position })
    completedRef.current = true
    navigate('/player/dashboard', { replace: true })
  }

  // ── UI ────────────────────────────────────────────────────

  return (
    <div dir="rtl" className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden bg-navy-light/50 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-ice-white arabic-text mb-1">
            مرحباً {profile?.full_name?.split(' ')[0] ?? ''} 👋
          </h1>
          <p className="text-ice-muted text-sm arabic-text">
            أنشئ هويتك الرياضية في دقيقتين
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step > s
                    ? 'bg-teal-prime text-navy-dark'
                    : step === s
                    ? 'bg-teal-prime/20 border-2 border-teal-prime text-teal-prime'
                    : 'bg-white/5 text-ice-muted'
                  }
                `}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 ${step > s ? 'bg-teal-prime' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-ice-muted text-xs arabic-text text-center mt-2">خطوة {step} من ٣</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">

          {/* Step 1 — الرياضة والمركز */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-ice-white mb-5 flex items-center gap-2 arabic-text">
                  <Dumbbell className="w-5 h-5 text-teal-prime" />
                  الرياضة والمركز
                </h2>

                {/* Sport */}
                <div className="mb-5">
                  <label className="block text-sm text-ice-muted mb-2 arabic-text">الرياضة *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SPORTS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStep1(prev => ({ ...prev, sport: s, position: POSITIONS[s] ? '' : 'عام' }))}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all arabic-text ${
                          step1.sport === s
                            ? 'bg-teal-prime text-navy-dark'
                            : 'glass-card text-ice-muted hover:text-ice-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                {step1.sport && POSITIONS[step1.sport] && (
                  <div className="mb-5">
                    <label className="block text-sm text-ice-muted mb-2 arabic-text">المركز *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {POSITIONS[step1.sport].map((p) => (
                        <button
                          key={p}
                          onClick={() => setStep1(prev => ({ ...prev, position: p }))}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all arabic-text ${
                            step1.position === p
                              ? 'bg-teal-prime/20 border border-teal-prime text-teal-prime'
                              : 'glass-card text-ice-muted hover:text-ice-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom position for sports without predefined positions */}
                {step1.sport && !POSITIONS[step1.sport] && (
                  <div className="mb-5">
                    <label className="block text-sm text-ice-muted mb-2 arabic-text">المركز (اختياري)</label>
                    <input
                      type="text"
                      value={step1.position === 'عام' ? '' : step1.position}
                      onChange={(e) => setStep1(prev => ({ ...prev, position: e.target.value || 'عام' }))}
                      placeholder="عام"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ice-white text-base placeholder:text-ice-muted/50 focus:outline-none focus:border-teal-prime transition-colors arabic-text"
                      dir="rtl"
                    />
                    <p className="text-ice-muted/60 text-xs mt-1 arabic-text">اتركه فارغاً ليكون "عام"</p>
                  </div>
                )}

                {/* Birth Year */}
                <div>
                  <label className="block text-sm text-ice-muted mb-2 arabic-text">سنة الميلاد *</label>
                  <select
                    value={step1.birth_year}
                    onChange={(e) => setStep1(prev => ({ ...prev, birth_year: Number(e.target.value) }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ice-white text-base focus:outline-none focus:border-teal-prime transition-colors arabic-text"
                    dir="rtl"
                  >
                    {BIRTH_YEARS.map((y) => (
                      <option key={y} value={y} className="bg-navy-dark">
                        {y} ({CURRENT_YEAR - y} سنة)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 — البيانات الجسدية */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-ice-white mb-5 flex items-center gap-2 arabic-text">
                  <User className="w-5 h-5 text-teal-prime" />
                  البيانات التفصيلية
                </h2>

                {/* Height / Weight */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm text-ice-muted mb-2 arabic-text">الطول (سم)</label>
                    <input
                      type="number"
                      value={step2.height_cm}
                      onChange={(e) => setStep2(prev => ({ ...prev, height_cm: e.target.value ? Number(e.target.value) : '' }))}
                      placeholder="175"
                      min={130}
                      max={220}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ice-white text-base focus:outline-none focus:border-teal-prime transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ice-muted mb-2 arabic-text">الوزن (كغ)</label>
                    <input
                      type="number"
                      value={step2.weight_kg}
                      onChange={(e) => setStep2(prev => ({ ...prev, weight_kg: e.target.value ? Number(e.target.value) : '' }))}
                      placeholder="70"
                      min={40}
                      max={150}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ice-white text-base focus:outline-none focus:border-teal-prime transition-colors"
                    />
                  </div>
                </div>

                {/* Dominant Foot */}
                <div className="mb-5">
                  <label className="block text-sm text-ice-muted mb-2 arabic-text">القدم المفضلة *</label>
                  <div className="flex gap-2">
                    {(['right', 'left', 'both'] as Foot[]).map((f) => {
                      const labels = { right: 'يمنى', left: 'يسرى', both: 'كلتاهما' }
                      return (
                        <button
                          key={f}
                          onClick={() => setStep2(prev => ({ ...prev, dominant_foot: f }))}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all arabic-text ${
                            step2.dominant_foot === f
                              ? 'bg-teal-prime/20 border border-teal-prime text-teal-prime'
                              : 'glass-card text-ice-muted hover:text-ice-white'
                          }`}
                        >
                          {labels[f]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Club */}
                <div className="mb-5">
                  <label className="block text-sm text-ice-muted mb-2 arabic-text">النادي الحالي (اختياري)</label>
                  <input
                    type="text"
                    value={step2.club}
                    onChange={(e) => setStep2(prev => ({ ...prev, club: e.target.value }))}
                    placeholder="اسم النادي"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ice-white text-base placeholder:text-ice-muted/50 focus:outline-none focus:border-teal-prime transition-colors arabic-text"
                    dir="rtl"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm text-ice-muted mb-2 arabic-text">المنطقة *</label>
                  <select
                    value={step2.region}
                    onChange={(e) => setStep2(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ice-white text-base focus:outline-none focus:border-teal-prime transition-colors arabic-text"
                    dir="rtl"
                  >
                    <option value="" className="bg-navy-dark">اختر المنطقة</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r} className="bg-navy-dark">{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 — التأكيد */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-ice-white mb-5 flex items-center gap-2 arabic-text">
                  <Check className="w-5 h-5 text-teal-prime" />
                  مراجعة البيانات
                </h2>

                <div className="space-y-3 mb-6">
                  {[
                    { label: 'الاسم', value: profile?.full_name ?? '-' },
                    { label: 'الرياضة', value: step1.sport },
                    { label: 'المركز', value: step1.position },
                    { label: 'العمر', value: `${CURRENT_YEAR - step1.birth_year} سنة` },
                    { label: 'القدم', value: { right: 'يمنى', left: 'يسرى', both: 'كلتاهما' }[step2.dominant_foot] },
                    { label: 'الطول', value: step2.height_cm ? `${step2.height_cm} سم` : 'غير محدد' },
                    { label: 'الوزن', value: step2.weight_kg ? `${step2.weight_kg} كغ` : 'غير محدد' },
                    { label: 'النادي', value: step2.club || 'غير محدد' },
                    { label: 'المنطقة', value: step2.region },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-ice-muted arabic-text">{label}</span>
                      <span className="text-sm font-medium text-ice-white arabic-text">{value}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center mb-4 arabic-text">{error}</p>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl glass-card text-ice-muted hover:text-ice-white transition-colors arabic-text"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </button>
          )}

          {step < 3 && (
            <button
              onClick={() => {
                  trackEvent('onboarding_step_completed', { step })
                  setStep(s => s + 1)
                }}
              disabled={step === 1 ? !step1Valid : !step2Valid}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-prime/25 transition-all arabic-text"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {step < 3 && (step === 1 ? !step1Valid : !step2Valid) && (
            <p className="text-ice-muted/60 text-xs arabic-text text-center mt-2">يُرجى إكمال جميع الحقول المطلوبة</p>
          )}

          {step === 3 && (
            <>
              <p className="text-xs text-ice-muted arabic-text text-center mb-3">
                بالتسجيل أنت توافق على{' '}
                <Link to="/privacy" className="text-teal-prime hover:underline">سياسة الخصوصية</Link>
              </p>
              <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm disabled:opacity-60 hover:shadow-lg hover:shadow-teal-prime/25 transition-all arabic-text"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  أنشئ هويتي الرياضية
                </>
              )}
            </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
