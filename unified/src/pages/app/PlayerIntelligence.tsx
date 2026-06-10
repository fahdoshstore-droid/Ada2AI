import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'

// ═══ Types (used by API response shape) ═══

interface TemporalPoint {
  phase: string
  phase_ar: string
  summary: string
  metrics: Record<string, number>
}

interface PlayerIntelligenceData {
  track_id: number
  dna: {
    team: number
    traits: Record<string, number>
    labels: string[]
    consistency_score: number
  }
  role_fits: Record<string, any>
  temporal_profile: TemporalPoint[] | null
  explanation: {
    reasoning: string
    confidence: number
    evidence: string[]
  } | null
}

// ═══ DNA Trait Arabic Mapping ═══
const DNA_LABELS: Record<string, { ar: string; en: string; desc: string }> = {
  press_aggression: { ar: 'عدوانية الضغط', en: 'Press Aggression', desc: 'ميل اللاعب للضغط على حامل الكرة' },
  carry_vs_pass: { ar: 'تقدم بالكرة مقابل التمرير', en: 'Carry vs Pass', desc: '+1 تقدم بالكرة / -1 تمرير تقدمي' },
  risk_appetite: { ar: 'مستوى المخاطرة', en: 'Risk Appetite', desc: 'ميل اللاعب للحلول عالية المخاطر' },
  transition_focus: { ar: 'تركيز التحولات', en: 'Transition Focus', desc: 'نشاط اللاعب في لحظات التحول' },
  positional_stability: { ar: 'استقرار مواقعي', en: 'Positional Stability', desc: 'مدى التزام اللاعب بمنطقه' },
  tempo_control: { ar: 'التحكم بالإيقاع', en: 'Tempo Control', desc: 'قدرة التباين في السرعة' },
  half_space_tendency: { ar: 'ميل المساحة النصفية', en: 'Half-Space Tendency', desc: 'ميل لاحتلال المساحات بين الأطراف والوسط' },
  box_presence: { ar: 'حضور منطقة الجزاء', en: 'Box Presence', desc: 'مستوى تواجد اللاعب في منطقة الجزاء' },
}

// ═══ Role Arabic Mapping ═══
const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  pressing_forward: { ar: 'مهاجم ضاغط', en: 'Pressing Forward' },
  inverted_fullback: { ar: 'ظهير معكوس', en: 'Inverted Fullback' },
  deep_lying_playmaker: { ar: 'صانع لعب عميق', en: 'Deep-Lying Playmaker' },
  box_crasher: { ar: 'مقتحم الجزاء', en: 'Box Crasher' },
  progressive_centerback: { ar: 'مدافع تقدمي', en: 'Progressive Centerback' },
  wide_creator: { ar: 'صانع ألعاب طرفي', en: 'Wide Creator' },
  holding_midfielder: { ar: 'محور دفاعي', en: 'Holding Midfielder' },
  transition_winger: { ar: 'جناح تحولات', en: 'Transition Winger' },
}

// ═══ Helpers ═══
const API_BASE = import.meta.env.VITE_API_BASE || ''

function confidenceBadge(confidence: number) {
  if (confidence >= 0.7) return { label: 'ثقة عالية', color: '#10b981', bg: '#d1fae5' }
  if (confidence >= 0.4) return { label: 'ثقة متوسطة', color: '#f59e0b', bg: '#fef3c7' }
  return { label: 'ثقة منخفضة', color: '#ef4444', bg: '#fee2e2' }
}

function traitBar(value: number): { pct: number; color: string } {
  // DNA traits range roughly -1 to +1, normalize to 0-100
  const pct = Math.max(0, Math.min(100, Math.round((value + 1) / 2 * 100)))
  const color = pct >= 65 ? '#10b981' : pct >= 35 ? '#f59e0b' : '#6b7280'
  return { pct, color }
}

// ═══ Component ═══
export function PlayerIntelligence() {
  useAuth() // auth gate via ProtectedRoute wrapper
  const [data, setData] = useState<PlayerIntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null)
  const [availablePlayers, setAvailablePlayers] = useState<{ track_id: number; team: number; labels: string[] }[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(false)

  // Step 1: Fetch available players from latest analysis
  const fetchPlayers = async () => {
    try {
      setLoadingPlayers(true)
      const res = await fetch(`${API_BASE}/intelligence/players`)
      if (!res.ok) {
        if (res.status === 404) {
          setAvailablePlayers([])
          return
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const json = await res.json()
      setAvailablePlayers(json.players || [])
      if (json.players?.length > 0 && !selectedTrackId) {
        setSelectedTrackId(json.players[0].track_id)
      }
    } catch (err: any) {
      // Don't fail the page — just show no players available
      setAvailablePlayers([])
    } finally {
      setLoadingPlayers(false)
    }
  }

  // Step 2: Fetch intelligence for selected player
  const fetchIntelligence = async (trackId: number) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE}/intelligence/player/${trackId}`)
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.detail || `HTTP ${res.status}`)
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات الذكاء')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlayers() }, [])

  useEffect(() => {
    if (selectedTrackId !== null) fetchIntelligence(selectedTrackId)
  }, [selectedTrackId])

  // ═══ RENDER ═══
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>الذكاء الرياضي</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>تحليل شخصي مبني على بيانات حقيقية</p>
        </div>
        {availablePlayers.length > 0 && (
          <select
            value={selectedTrackId || ''}
            onChange={e => setSelectedTrackId(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#fff' }}
          >
            {availablePlayers.map(p => (
              <option key={p.track_id} value={p.track_id}>
                لاعب #{p.track_id} — {p.labels?.[0] || `فريق ${p.team}`}
              </option>
            ))}
          </select>
        )}
      </header>

      <main style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
        {/* No analysis data yet */}
        {loadingPlayers && availablePlayers.length === 0 && !data && <LoadingState />}

        {!loadingPlayers && availablePlayers.length === 0 && !data && (
          <EmptyState
            title="لا توجد بيانات تحليل بعد"
            description="سيظهر الذكاء الرياضي هنا بعد رفع فيديو وتحليله عبر النظام. البيانات حقيقية فقط — لا بيانات تجريبية."
          />
        )}

        {error && <ErrorState message={error} onRetry={() => selectedTrackId && fetchIntelligence(selectedTrackId)} />}

        {loading && data === null && availablePlayers.length > 0 && <LoadingState />}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ═══ Consistency Score ═══ */}
            <div style={{ backgroundColor: '#fff', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>معدل الثبات</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>مدى انتظام أداء اللاعب عبر التحليل</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
                  {Math.round((data.dna.consistency_score ?? 0) * 100)}%
                </span>
                {(() => {
                  const badge = confidenceBadge(data.dna.consistency_score)
                  return <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
                })()}
              </div>
            </div>

            {/* ═══ DNA Traits ═══ */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e293b' }}>البصمة الوراثية الرياضية (DNA)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(data.dna.traits || {}).map(([key, rawValue]) => {
                  const label = DNA_LABELS[key]
                  if (!label) return null
                  const value = rawValue as number
                  const { pct, color } = traitBar(value)
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{label.ar}</span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{value.toFixed(2)}</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.5s' }} />
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>{label.desc}</p>
                    </div>
                  )
                })}
              </div>
              {data.dna.labels && data.dna.labels.length > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {data.dna.labels.map((label, i) => (
                    <span key={i} style={{ padding: '4px 12px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '16px', fontSize: '13px' }}>{label}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ═══ Role Fits ═══ */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e293b' }}>ملائمة الأدوار التكتيكية</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(data.role_fits || {})
                  .sort(([, a]: any, [, b]: any) => (b.score || 0) - (a.score || 0))
                  .map(([roleId, fit]: any) => {
                    const label = ROLE_LABELS[roleId] || { ar: roleId, en: roleId }
                    const score = fit.score || 0
                    const conf = fit.confidence ?? 0
                    const badge = confidenceBadge(conf)
                    return (
                      <div key={roleId} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{label.ar}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{Math.round(score * 100)}%</span>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
                          </div>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                          <div style={{ width: `${Math.round(score * 100)}%`, height: '100%', backgroundColor: score >= 0.6 ? '#10b981' : score >= 0.3 ? '#f59e0b' : '#9ca3af', borderRadius: '3px' }} />
                        </div>
                        {fit.evidence && fit.evidence.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>الأدلة:</p>
                            <ul style={{ margin: 0, padding: '0 20px', fontSize: '13px', color: '#374151' }}>
                              {fit.evidence.slice(0, 5).map((ev: string, i: number) => (
                                <li key={i} style={{ marginBottom: '2px' }}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {conf < 0.4 && (
                          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#ef4444', fontStyle: 'italic' }}>
                            ⚠️ تفسير بثقة منخفضة — قد لا يكون دقيقاً بالكامل
                          </p>
                        )}
                      </div>
                    )
                  })}
              </div>
              {Object.keys(data.role_fits || {}).length === 0 && (
                <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>لا توجد بيانات أدوار بعد</p>
              )}
            </div>

            {/* ═══ Explanation / Why ═══ */}
            {data.explanation && (
              <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#1e293b' }}>لماذا هذا التقييم؟</h3>
                {data.explanation.reasoning && (
                  <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{data.explanation.reasoning}</p>
                )}
                {data.explanation.evidence && data.explanation.evidence.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>الأدلة المستخدمة:</p>
                    <ul style={{ margin: 0, padding: '0 20px', fontSize: '13px', color: '#374151' }}>
                      {data.explanation.evidence.map((ev, i) => (
                        <li key={i} style={{ marginBottom: '3px' }}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(() => {
                  const badge = confidenceBadge(data.explanation.confidence)
                  return (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>مستوى الثقة:</span>
                      <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color }}>{badge.label}</span>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* ═══ Temporal Profile ═══ */}
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1e293b' }}>التطور الزمني</h3>
              {data.temporal_profile && data.temporal_profile.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.temporal_profile.map((tp, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{tp.phase_ar || tp.phase}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{tp.summary}</p>
                      {tp.metrics && Object.keys(tp.metrics).length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {Object.entries(tp.metrics).map(([k, v]) => (
                            <span key={k} style={{ fontSize: '12px', color: '#6b7280' }}>{k}: <strong style={{ color: '#374151' }}>{typeof v === 'number' ? v.toFixed(2) : String(v)}</strong></span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>لا توجد بيانات زمنية كافية بعد — تحتاج أكثر من تحليل واحد</p>
              )}
            </div>

            {/* ═══ Trust Notice ═══ */}
            <div style={{ padding: '16px 20px', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: 1.6 }}>
                💡 جميع البيانات المعروضة مبنية على تحليل حقيقي من فيديو فعلي. لا توجد بيانات تجريبية أو مولّدة عشوائياً.
                كل تقييم يُعرض مع مستوى الثقة والأدلة المقابلة. إذا كانت الثقة منخفضة، يُشار لذلك صراحةً.
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}