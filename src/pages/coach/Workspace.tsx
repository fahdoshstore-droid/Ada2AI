/**
 * Coach Workspace — Ada2AI
 *
 * Real workspace for coaches to manage video analysis lifecycle.
 * No fake AI — buttons trigger actual state changes in video_analyses.
 *
 * SECTION A: Pending analyses queue
 * SECTION B: Team formation (interactive pitch)
 * SECTION C: Inline results form (triggered from pending)
 * SECTION D: Completed analyses history
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Clock, Loader2, CheckCircle, XCircle,
  Play, ClipboardList, BarChart3,
  ChevronDown, ChevronUp, ArrowLeft, Users, Swords, Upload as UploadIcon, FileText
} from 'lucide-react'
import {
  usePendingAnalyses,
  useCompletedAnalyses,
  useUpdateAnalysisStatus,
  useSaveAnalysisResults,
} from '../../hooks/useAnalysis'
import { useCoachPlayers } from '../../hooks/useCoachPlayers'
import { type AnalysisResults } from '../../services/analysis'
import { createAnalysisRecord } from '../../services/analysis'
import { StatusBadge } from '../../components/StatusBadge'
import { SectionHeader } from '../../components/SectionHeader'
import type { StatusKey } from '../../lib/tokens'
import PitchView from '../../components/coach/PitchView'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

// ── Results Form ──────────────────────────────────────────────

function ResultsForm({
  analysisId,
  onSave,
  onCancel,
}: {
  analysisId: string
  onSave: (id: string, results: AnalysisResults) => void
  onCancel: () => void
}) {
  const [touches, setTouches] = useState('')
  const [speed, setSpeed] = useState('')
  const [activityScore, setActivityScore] = useState(50)
  const [possession, setPossession] = useState(50)
  const [defensiveZone, setDefensiveZone] = useState(33)
  const [midZone, setMidZone] = useState(34)
  const [attackingZone, setAttackingZone] = useState(33)
  const [notes, setNotes] = useState('')

  const setZone = (zone: 'def' | 'mid' | 'att', val: number) => {
    if (zone === 'def') setDefensiveZone(val)
    else if (zone === 'mid') setMidZone(val)
    else setAttackingZone(val)
  }

  // Suppress unused warning — setZone is used in JSX below

  const handleSubmit = () => {
    const results: AnalysisResults = {
      touches_estimate: touches ? Number(touches) : undefined,
      speed_estimate_kmh: speed ? Number(speed) : undefined,
      activity_score: activityScore,
      possession_involvement: possession,
      movement_zones: [
        { zone: 'دفاعي', percentage: defensiveZone },
        { zone: 'وسط', percentage: midZone },
        { zone: 'هجومي', percentage: attackingZone },
      ],
      notes: notes || undefined,
    }
    onSave(analysisId, results)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white/5 rounded-xl p-4 space-y-4 border border-teal-prime/20"
    >
      <h4 className="text-sm font-bold text-teal-prime arabic-text flex items-center gap-2">
        <ClipboardList className="w-4 h-4" />
        تسجيل نتائج التحليل
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {/* Touches */}
        <div>
          <label className="text-xs text-ice-muted arabic-text block mb-1">عدد اللمسات</label>
          <input
            type="number"
            value={touches}
            onChange={e => setTouches(e.target.value)}
            placeholder="مثال: 45"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ice-white arabic-text focus:border-teal-prime/50 focus:outline-none"
          />
        </div>

        {/* Speed */}
        <div>
          <label className="text-xs text-ice-muted arabic-text block mb-1">السرعة (كم/س)</label>
          <input
            type="number"
            value={speed}
            onChange={e => setSpeed(e.target.value)}
            placeholder="مثال: 28"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ice-white arabic-text focus:border-teal-prime/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Activity Score Slider */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-ice-muted arabic-text">نشاط اللاعب</span>
          <span className="text-teal-prime font-medium">{activityScore}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={activityScore}
          onChange={e => setActivityScore(Number(e.target.value))}
          className="w-full accent-teal-prime"
        />
      </div>

      {/* Possession Involvement Slider */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-ice-muted arabic-text">مشاركة في الاستحواذ</span>
          <span className="text-teal-prime font-medium">{possession}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={possession}
          onChange={e => setPossession(Number(e.target.value))}
          className="w-full accent-teal-prime"
        />
      </div>

      {/* Movement Zones */}
      <div>
        <p className="text-xs text-ice-muted arabic-text mb-2">مناطق التحرك (يجب أن مجموعها 100%)</p>
        <div className="space-y-2">
          {[
            { label: 'دفاعي', value: defensiveZone, setter: (v: number) => setZone('def', v) },
            { label: 'وسط', value: midZone, setter: (v: number) => setZone('mid', v) },
            { label: 'هجومي', value: attackingZone, setter: (v: number) => setZone('att', v) },
          ].map(zone => (
            <div key={zone.label} className="flex items-center gap-2">
              <span className="text-xs text-ice-muted arabic-text w-12">{zone.label}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-prime to-scout-blue rounded-full transition-all"
                  style={{ width: `${zone.value}%` }}
                />
              </div>
              <span className="text-xs text-ice-white font-medium w-8 text-left">{zone.value}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={zone.value}
                onChange={e => zone.setter(Number(e.target.value))}
                className="w-16 accent-teal-prime"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-ice-muted arabic-text block mb-1">ملاحظات</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="أضف ملاحظاتك عن أداء اللاعب..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ice-white arabic-text focus:border-teal-prime/50 focus:outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm hover:shadow-xl hover:shadow-teal-prime/25 transition-all arabic-text"
        >
          حفظ النتائج
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl glass-card text-ice-muted text-sm hover:text-ice-white transition-colors arabic-text"
        >
          إلغاء
        </button>
      </div>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────

export default function CoachWorkspace() {
  const navigate = useNavigate()
  const { analyses: pending, loading: loadingPending } = usePendingAnalyses()
  const { analyses: completed, loading: loadingCompleted } = useCompletedAnalyses()
  const updateStatus = useUpdateAnalysisStatus()
  const saveResults = useSaveAnalysisResults()
  const { players } = useCoachPlayers()
  const { user } = useAuth()

  const [activeFormId, setActiveFormId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formation, setFormation] = useState<'4-3-3' | '4-4-2' | '3-5-2'>('4-3-3')
  const [activeTab, setActiveTab] = useState<'workspace' | 'opponent'>('workspace')
  const [opponentTeam, setOpponentTeam] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [opponentVideo, setOpponentVideo] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const [tacticalNotes, setTacticalNotes] = useState('')

  const handleStartProcessing = (id: string) => {
    updateStatus.mutate({ id, status: 'processing' })
  }

  const handleMarkFailed = (id: string) => {
    updateStatus.mutate({ id, status: 'failed' })
  }

  const handleSaveResults = (id: string, results: AnalysisResults) => {
    saveResults.mutate(
      { id, results },
      {
        onSuccess: () => {
          setActiveFormId(null)
        },
      }
    )
  }

  const handleOpponentUpload = async () => {
    if (!opponentTeam.trim() || !opponentVideo || !user) return
    setUploading(true)
    setUploadMsg(null)
    try {
      const filePath = `opponent/${Date.now()}_${opponentVideo.name}`
      const { error: uploadError } = await supabase.storage
        .from('player-media')
        .upload(filePath, opponentVideo, { cacheControl: '3600' })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('player-media').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      await createAnalysisRecord(user.id, publicUrl)
      // Update the title to indicate opponent analysis
      // We update via a direct query since createAnalysisRecord doesn't accept title
      const { data: latestAnalysis } = await supabase
        .from('video_analyses')
        .select('id')
        .eq('video_url', publicUrl)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestAnalysis) {
        await supabase
          .from('video_analyses')
          .update({
            title: `تحليل منافس: ${opponentTeam}`,
            match: opponentTeam,
            date: matchDate || undefined,
          })
          .eq('id', latestAnalysis.id)
      }

      setUploadMsg('تم الرفع — التحليل سيبدأ قريباً')
      setOpponentTeam('')
      setMatchDate('')
      setOpponentVideo(null)
      // Save tactical notes to localStorage as temporary storage
      if (tacticalNotes.trim()) {
        // TODO: Persist to evaluations.notes when opponent player_id is available
        const key = `opponent_notes_${latestAnalysis?.id || Date.now()}`
        localStorage.setItem(key, tacticalNotes)
        setTacticalNotes('')
      }
    } catch (err: any) {
      setUploadMsg(`خطأ: ${err.message || 'فشل الرفع'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-navy">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header + Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/coach')}
                className="flex items-center gap-1.5 text-ice-muted text-sm hover:text-ice-white transition-colors arabic-text"
              >
                <ArrowLeft className="w-4 h-4" />
                رجوع
              </button>
            </div>
            <h1 className="text-xl font-bold font-display text-ice-white arabic-text">مساحة العمل</h1>
          </div>
          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors arabic-text ${
                activeTab === 'workspace'
                  ? 'bg-teal-prime/20 text-teal-prime border border-teal-prime/30'
                  : 'glass-card text-ice-muted hover:text-ice-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              التحليلات
            </button>
            <button
              onClick={() => setActiveTab('opponent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors arabic-text ${
                activeTab === 'opponent'
                  ? 'bg-teal-prime/20 text-teal-prime border border-teal-prime/30'
                  : 'glass-card text-ice-muted hover:text-ice-white'
              }`}
            >
              <Swords className="w-4 h-4" />
              تحليل المنافس
            </button>
          </div>
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'workspace' && (
          <>
            {/* ── SECTION B: Team Formation (Interactive Pitch) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <SectionHeader title="تشكيل الفريق" icon={<Users className="w-4 h-4" />} />
          <PitchView
            players={players ?? []}
            formation={formation}
            onFormationChange={(f: string) => setFormation(f as '4-3-3' | '4-4-2' | '3-5-2')}
          />
        </motion.div>

        {/* ── SECTION A: Pending Analyses ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <SectionHeader title="تحليلات قيد الانتظار" icon={<Clock className="w-4 h-4" />} />

          {loadingPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-teal-prime animate-spin" />
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-teal-prime mx-auto mb-2" />
              <p className="text-ice-muted text-sm arabic-text">لا توجد تحليلات معلقة حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((analysis) => (
                <div key={analysis.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-prime/20 to-scout-blue/20 flex items-center justify-center">
                        <Play className="w-5 h-5 text-teal-prime" />
                      </div>
                      <div>
                        <p className="text-ice-white text-sm font-medium arabic-text">
                          {analysis.title || 'تحليل فيديو'}
                        </p>
                        <p className="text-ice-muted text-xs arabic-text">
                          {analysis.created_at
                            ? new Date(analysis.created_at).toLocaleDateString('ar-SA')
                            : '—'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={analysis.status as StatusKey} />
                  </div>

                  {/* Video thumbnail or URL link */}
                  {analysis.video_url && (
                    <p className="text-xs text-ice-muted truncate mb-2" dir="ltr">
                      {analysis.video_url}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {analysis.status === 'queued' && (
                      <button
                        onClick={() => handleStartProcessing(analysis.id)}
                        disabled={updateStatus.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-prime/10 text-teal-prime text-xs font-medium hover:bg-teal-prime/20 transition-colors arabic-text disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        بدء التحليل
                      </button>
                    )}
                    {analysis.status === 'processing' && (
                      <>
                        <button
                          onClick={() => setActiveFormId(analysis.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-prime/10 text-teal-prime text-xs font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          تسجيل النتائج
                        </button>
                        <button
                          onClick={() => handleMarkFailed(analysis.id)}
                          disabled={updateStatus.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-colors arabic-text disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          فشل التحليل
                        </button>
                      </>
                    )}
                  </div>

                  {/* Inline Results Form */}
                  <AnimatePresence>
                    {activeFormId === analysis.id && (
                      <div className="mt-3">
                        <ResultsForm
                          analysisId={analysis.id}
                          onSave={handleSaveResults}
                          onCancel={() => setActiveFormId(null)}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── SECTION C: Completed Analyses ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <SectionHeader title="التحليلات المكتملة" icon={<BarChart3 className="w-4 h-4" />} />

          {loadingCompleted ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-teal-prime animate-spin" />
            </div>
          ) : completed.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-10 h-10 text-ice-muted mx-auto mb-2" />
              <p className="text-ice-muted text-sm arabic-text">لا توجد تحليلات مكتملة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completed.map((analysis) => {
                const results = analysis.analysis_data
                const isExpanded = expandedId === analysis.id

                return (
                  <div key={analysis.id} className="bg-white/5 rounded-xl p-4">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : analysis.id)}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-prime flex-shrink-0" />
                        <div>
                          <p className="text-ice-white text-sm font-medium arabic-text">
                            {analysis.title || 'تحليل فيديو'}
                          </p>
                          <p className="text-ice-muted text-xs arabic-text">
                            {analysis.updated_at
                              ? new Date(analysis.updated_at).toLocaleDateString('ar-SA')
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={analysis.status as StatusKey} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/player/${analysis.uploaded_by}`)
                          }}
                          className="text-xs text-teal-prime hover:underline arabic-text"
                        >
                          عرض اللاعب
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-ice-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-ice-muted" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Results */}
                    <AnimatePresence>
                      {isExpanded && results && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/5"
                        >
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {results.activity_score != null && (
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold font-display text-teal-prime">{results.activity_score}%</div>
                                <div className="text-xs text-ice-muted arabic-text">نشاط اللاعب</div>
                              </div>
                            )}
                            {results.touches_estimate != null && (
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold font-display text-ice-white">{results.touches_estimate}</div>
                                <div className="text-xs text-ice-muted arabic-text">لمسات</div>
                              </div>
                            )}
                            {results.speed_estimate_kmh != null && (
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold font-display text-ice-white">{results.speed_estimate_kmh}</div>
                                <div className="text-xs text-ice-muted arabic-text">كم/س</div>
                              </div>
                            )}
                            {results.possession_involvement != null && (
                              <div className="bg-white/5 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold font-display text-ice-white">{results.possession_involvement}%</div>
                                <div className="text-xs text-ice-muted arabic-text">استحواذ</div>
                              </div>
                            )}
                          </div>

                          {/* Movement Zones */}
                          {results.movement_zones && results.movement_zones.length > 0 && (
                            <div className="space-y-1.5 mb-3">
                              <p className="text-xs text-ice-muted arabic-text">مناطق التحرك</p>
                              {results.movement_zones.map((zone) => (
                                <div key={zone.zone} className="flex items-center gap-2">
                                  <span className="text-xs text-ice-muted arabic-text w-12">{zone.zone}</span>
                                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-teal-prime to-scout-blue rounded-full"
                                      style={{ width: `${zone.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-ice-white font-medium w-8">{zone.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Notes */}
                          {results.notes && (
                            <div className="bg-white/5 rounded-lg p-3">
                              <p className="text-xs text-ice-muted arabic-text mb-1">ملاحظات المدرب</p>
                              <p className="text-sm text-ice-white arabic-text">{results.notes}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
          </>
        )}

        {/* ── Opponent Analysis Tab ── */}
        {activeTab === 'opponent' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5 space-y-5"
          >
            <h2 className="font-bold font-display text-ice-white flex items-center gap-2 arabic-text">
              <Swords className="w-5 h-5 text-teal-prime" />
              تحليل المنافس
            </h2>
            <p className="text-ice-muted text-sm arabic-text">
              ارفع فيديو لفريق المنافس وسيتم إنشاء تحليل تلقائي في قائمة الانتظار
            </p>

            {/* Team Name */}
            <div>
              <label className="text-xs text-ice-muted arabic-text block mb-1">اسم الفريق المنافس</label>
              <input
                type="text"
                value={opponentTeam}
                onChange={e => setOpponentTeam(e.target.value)}
                placeholder="مثال: الهلال"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ice-white arabic-text focus:border-teal-prime/50 focus:outline-none"
              />
            </div>

            {/* Match Date */}
            <div>
              <label className="text-xs text-ice-muted arabic-text block mb-1">تاريخ المباراة (اختياري)</label>
              <input
                type="date"
                value={matchDate}
                onChange={e => setMatchDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ice-white focus:border-teal-prime/50 focus:outline-none"
              />
            </div>

            {/* Video Upload */}
            <div>
              <label className="text-xs text-ice-muted arabic-text block mb-1">فيديو المنافس</label>
              <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-teal-prime/40 transition-colors">
                <UploadIcon className="w-8 h-8 text-ice-muted" />
                <span className="text-sm text-ice-muted arabic-text">
                  {opponentVideo ? opponentVideo.name : 'اختر ملف الفيديو'}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => setOpponentVideo(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Tactical Notes */}
            <div>
              <label className="text-xs text-ice-muted arabic-text block mb-1">ملاحظات تكتيكية</label>
              <textarea
                value={tacticalNotes}
                onChange={e => setTacticalNotes(e.target.value)}
                rows={4}
                placeholder="أضف ملاحظاتك عن أسلوب اللعب، نقاط الضعف، إلخ..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-ice-white arabic-text focus:border-teal-prime/50 focus:outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleOpponentUpload}
              disabled={uploading || !opponentTeam.trim() || !opponentVideo}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm hover:shadow-xl hover:shadow-teal-prime/25 transition-all arabic-text disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الرفع...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  رفع وتحليل
                </>
              )}
            </button>

            {/* Upload message */}
            {uploadMsg && (
              <p className={`text-sm arabic-text text-center ${uploadMsg.startsWith('خطأ') ? 'text-red-400' : 'text-teal-prime'}`}>
                {uploadMsg}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}