/**
 * EvaluationForm — Ada2AI
 *
 * Coach evaluation form for players.
 * Reads playerId from useParams, fetches player data,
 * submits via useCreateEvaluation hook.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Player } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useCreateEvaluation } from '../../hooks/useCreateEvaluation'
import { trackEvent } from '../../lib/analytics'
import {
  Star, ArrowRight, Loader2, AlertCircle,
  Save
} from 'lucide-react'

// ── Slider Field ──────────────────────────────────────
function SliderField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-ice-muted arabic-text">{label}</span>
        <span className="text-sm font-bold text-teal-prime">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer
          bg-white/5
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-teal-prime
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:shadow-teal-prime/30
          [&::-webkit-slider-thumb]:cursor-pointer
        "
      />
    </div>
  )
}

// ── Main Component ──────────────────────────────────────
export default function EvaluationForm() {
  const { playerId } = useParams<{ playerId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [player, setPlayer] = useState<Player | null>(null)
  const [loadingPlayer, setLoadingPlayer] = useState(true)
  const [playerError, setPlayerError] = useState<string | null>(null)

  const [technical, setTechnical] = useState(50)
  const [tactical, setTactical] = useState(50)
  const [physical, setPhysical] = useState(50)
  const [mental, setMental] = useState(50)
  const [notes, setNotes] = useState('')

  const { mutate, isPending, isSuccess, error: submitError } = useCreateEvaluation()

  const overall = Math.round((technical + tactical + physical + mental) / 4)

  // Track evaluation started on mount
  useEffect(() => {
    if (playerId) {
      trackEvent('evaluation_started', { playerId })
    }
  }, [playerId])

  // Fetch player
  useEffect(() => {
    if (!playerId) {
      setPlayerError('معرّف اللاعب غير موجود')
      setLoadingPlayer(false)
      return
    }

    supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setPlayerError('تعذّر تحميل بيانات اللاعب')
        } else if (!data) {
          setPlayerError('اللاعب غير موجود')
        } else {
          setPlayer(data as Player)
        }
        setLoadingPlayer(false)
      })
  }, [playerId])

  // Redirect after success
  useEffect(() => {
    if (isSuccess) {
      navigate(-1)
    }
  }, [isSuccess, navigate])

  // Submit handler
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!playerId || !user) return

    mutate({
      player_id: playerId,
      coach_id: user.id,
      technical,
      tactical,
      physical,
      mental,
      overall,
      notes: notes || undefined,
      evaluation_date: new Date().toISOString().split('T')[0],
    })
  }

  // Loading
  if (loadingPlayer) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-prime animate-spin" />
      </div>
    )
  }

  // Player not found / error
  if (playerError || !player) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-card rounded-2xl p-8 max-w-sm w-full text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-ice-white font-bold text-lg mb-4 arabic-text">
            {playerError || 'اللاعب غير موجود'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-navy pb-12">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-xl mx-auto px-4 pt-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-ice-muted text-sm mb-6 hover:text-ice-white transition-colors arabic-text"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>

        {/* Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {(player.name || '؟').charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-ice-white arabic-text">
                {player.name || 'لاعب'}
              </h1>
              <p className="text-ice-muted text-xs arabic-text">
                {player.position || '—'} · {player.sport || '—'} · {player.club || '—'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Evaluation Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-lg font-bold text-ice-white arabic-text">
              تقييم اللاعب
            </h2>
          </div>

          {/* Overall — auto-calculated */}
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-ice-muted text-xs arabic-text mb-1">التقييم العام</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-gradient-teal">{overall}</span>
              <span className="text-ice-muted text-sm">/100</span>
            </div>
          </div>

          {/* Sliders */}
          <SliderField label="فني" value={technical} onChange={setTechnical} />
          <SliderField label="تكتيكي" value={tactical} onChange={setTactical} />
          <SliderField label="بدني" value={physical} onChange={setPhysical} />
          <SliderField label="ذهني" value={mental} onChange={setMental} />

          {/* Notes */}
          <div>
            <label className="block text-sm text-ice-muted arabic-text mb-2">
              ملاحظات
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظاتك على اللاعب..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ice-white text-sm placeholder:text-ice-muted/50 focus:outline-none focus:border-teal-prime/40 resize-none h-24 arabic-text"
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2 text-red-400 text-sm arabic-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError.message}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm hover:shadow-xl hover:shadow-teal-prime/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed arabic-text"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ التقييم
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}