/**
 * EvaluationForm — Ada2AI
 *
 * Coach evaluation page. The four 0-100 sliders were replaced by the shared
 * <EvaluationReport />: the same four axes, but scored over 32 named items,
 * so a coach evaluation and a scout report describe a player identically.
 * The axis percentages written to `evaluations` keep their previous meaning,
 * and the per-item detail goes to the new `details` column.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Player } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import EvaluationReport from '../../components/evaluation/EvaluationReport'
import { sportLabel } from '../../lib/sportLabel'
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react'

export default function EvaluationForm() {
  const { playerId } = useParams<{ playerId: string }>()
  const navigate = useNavigate()

  const [player, setPlayer] = useState<Player | null>(null)
  // Derived from the route, not set inside an effect: a missing id is known
  // on the first render, so there is nothing to synchronise.
  const [loadingPlayer, setLoadingPlayer] = useState(!!playerId)
  const [playerError, setPlayerError] = useState<string | null>(
    playerId ? null : 'معرّف اللاعب غير موجود',
  )

  useEffect(() => {
    if (playerId) trackEvent('evaluation_started', { playerId })
  }, [playerId])

  useEffect(() => {
    if (!playerId) return

    let active = true
    supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setPlayerError('تعذّر تحميل بيانات اللاعب')
        else if (!data) setPlayerError('اللاعب غير موجود')
        else setPlayer(data as Player)
        setLoadingPlayer(false)
      })
    return () => { active = false }
  }, [playerId])

  if (loadingPlayer) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-prime animate-spin" />
      </div>
    )
  }

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
    <div dir="rtl" className="relative min-h-screen bg-navy pb-12">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-ice-muted transition-colors hover:text-ice-white arabic-text"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-6 rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue text-lg font-bold text-white">
              {(player.name || '؟').charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tightest text-ice-white arabic-text">
                {player.name || 'لاعب'}
              </h1>
              <p className="text-xs text-ice-muted arabic-text">
                {player.position || '—'} · {player.sport ? sportLabel(player.sport) : '—'} · {player.club || '—'}
              </p>
            </div>
          </div>
        </motion.div>

        <EvaluationReport player={player} variant="coach" onSaved={() => navigate(-1)} />
      </div>
    </div>
  )
}
