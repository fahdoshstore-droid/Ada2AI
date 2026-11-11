/**
 * ScoutReportForm - نموذج تقييم الكشاف
 * Digital version of the paper scouting form: player header, mini pitch,
 * four pillars × eight criteria rated 1–5, notes, scout opinion and total %.
 */
import React, { useMemo, useState } from 'react'
import { AlertCircle, ArrowRight, ArrowLeft, Loader2, Printer, Save } from 'lucide-react'
import {
  PILLARS, PITCH_POSITIONS, RATING_SCALE, TOTAL_CRITERIA,
  missingCriteria, pillarPercent, ratedCount, scoreColor, totalScore, validateDraft,
  type DraftField, type PillarKey, type ScoutReportDraft,
} from '@/lib/scoutReport'

interface Props {
  initial: ScoutReportDraft
  isRTL: boolean
  isEditing: boolean
  isSaving: boolean
  saveError: string | null
  onSave: (draft: ScoutReportDraft) => void
  onCancel: () => void
}

const cairo = "'Cairo', sans-serif"
const card: React.CSSProperties = { backgroundColor: '#0A0E1A', border: '1px solid #1F2937', borderRadius: '12px', padding: '20px' }
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151',
  borderRadius: '8px', color: '#EEEFEE', fontSize: '14px', fontFamily: cairo, outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { color: '#9CA3AF', fontSize: '12px', marginBottom: '6px', display: 'block', fontFamily: cairo }

export default function ScoutReportForm({ initial, isRTL, isEditing, isSaving, saveError, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<ScoutReportDraft>(initial)
  const [errors, setErrors] = useState<DraftField[]>([])
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const total = useMemo(() => totalScore(draft.ratings), [draft.ratings])
  const rated = useMemo(() => ratedCount(draft.ratings), [draft.ratings])
  const missing = useMemo(() => new Set(missingCriteria(draft.ratings).map(m => `${m.pillar}.${m.key}`)), [draft.ratings])
  const showMissing = errors.includes('ratings')

  const set = <K extends keyof ScoutReportDraft>(key: K, value: ScoutReportDraft[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }))

  const setRating = (pillar: PillarKey, key: string, value: number) =>
    setDraft(prev => ({ ...prev, ratings: { ...prev.ratings, [pillar]: { ...prev.ratings[pillar], [key]: value } } }))

  const togglePitch = (code: string) =>
    setDraft(prev => {
      const has = prev.pitch_positions.includes(code)
      if (has) return { ...prev, pitch_positions: prev.pitch_positions.filter(c => c !== code) }
      if (prev.pitch_positions.length >= 3) return prev
      return { ...prev, pitch_positions: [...prev.pitch_positions, code] }
    })

  const submit = () => {
    const found = validateDraft(draft, new Date().getFullYear())
    setErrors(found)
    if (found.length === 0) onSave(draft)
  }

  const errBorder = (f: DraftField): React.CSSProperties => (errors.includes(f) ? { borderColor: '#EF4444' } : {})
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  return (
    <div className="scout-report-print" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: cairo }}>
      {/* ─── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '14px', fontFamily: cairo }}>
          <BackIcon size={16} />
          {t('رجوع للتقارير', 'Back to reports')}
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'transparent', border: '1px solid #374151', borderRadius: '8px', color: '#9CA3AF', cursor: 'pointer', fontSize: '14px', fontFamily: cairo }}>
            <Printer size={16} />
            {t('طباعة', 'Print')}
          </button>
          <button onClick={submit} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#00DCC8', border: 'none', borderRadius: '8px', color: '#000A0F', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: cairo, opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
            {isEditing ? t('حفظ التعديلات', 'Save changes') : t('حفظ التقرير', 'Save report')}
          </button>
        </div>
      </div>

      {(errors.length > 0 || saveError) && (
        <div className="no-print" role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', marginBottom: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#FCA5A5', fontSize: '13px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            {saveError ?? (showMissing
              ? t(`أكمل تقييم جميع المعايير (${rated} من ${TOTAL_CRITERIA}) والحقول المطلوبة.`, `Rate every criterion (${rated} of ${TOTAL_CRITERIA}) and fill the required fields.`)
              : t('أكمل الحقول المطلوبة المظللة بالأحمر.', 'Fill the required fields highlighted in red.'))}
          </span>
        </div>
      )}

      <h1 style={{ color: '#EEEFEE', fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>
        {t('نموذج تقييم لاعب', 'Player Scouting Report')}
      </h1>

      {/* ─── Header: player info + pitch ─────────────────────────────────── */}
      <div style={{ ...card, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 170px', gap: '20px', marginBottom: '16px' }} className="scout-report-header">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignContent: 'start' }}>
          <div>
            <label style={labelStyle} htmlFor="sr-name">{t('الاسم', 'Name')} *</label>
            <input id="sr-name" value={draft.player_name} onChange={e => set('player_name', e.target.value)} style={{ ...inputStyle, ...errBorder('player_name') }} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="sr-birth">{t('تاريخ الميلاد (السنة)', 'Birth year')}</label>
            <input id="sr-birth" type="number" inputMode="numeric" min={1950} max={new Date().getFullYear()} value={draft.birth_year ?? ''}
              onChange={e => set('birth_year', e.target.value === '' ? null : Number(e.target.value))} style={{ ...inputStyle, ...errBorder('birth_year') }} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="sr-club">{t('النادي', 'Club')}</label>
            <input id="sr-club" value={draft.club} onChange={e => set('club', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="sr-position">{t('المركز', 'Position')} *</label>
            <input id="sr-position" value={draft.position} onChange={e => set('position', e.target.value)} placeholder={t('مثال: محور', 'e.g. Central midfielder')} style={{ ...inputStyle, ...errBorder('position') }} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="sr-target">{t('اللاعب مستهدف لفئة', 'Target age group')}</label>
            <input id="sr-target" value={draft.target_category} onChange={e => set('target_category', e.target.value)} placeholder={t('مثال: 2010', 'e.g. 2010')} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="sr-date">{t('تاريخ الاكتشاف', 'Discovery date')} *</label>
            <input id="sr-date" type="date" value={draft.discovery_date} onChange={e => set('discovery_date', e.target.value)} style={{ ...inputStyle, colorScheme: 'dark', ...errBorder('discovery_date') }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle} htmlFor="sr-match">{t('المباراة', 'Match')}</label>
            <input id="sr-match" value={draft.match} onChange={e => set('match', e.target.value)} placeholder={t('مثال: دوري الدرجة الأولى تحت 15 — عكاظ × الفاو', 'e.g. U15 First Division — Okaz v Al-Faw')} style={inputStyle} />
          </div>
        </div>

        {/* Mini pitch */}
        <div>
          <span style={labelStyle}>{t('مراكز اللعب (حتى ٣)', 'Playing positions (up to 3)')}</span>
          <div dir="ltr" style={{ position: 'relative', width: '100%', aspectRatio: '2 / 3', background: 'linear-gradient(180deg, #0F3D2A, #0B2E20)', border: '2px solid rgba(255,255,255,0.35)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.35)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '26%', aspectRatio: '1', transform: 'translate(-50%, -50%)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: '13%', border: '1px solid rgba(255,255,255,0.35)', borderTop: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '25%', right: '25%', height: '13%', border: '1px solid rgba(255,255,255,0.35)', borderBottom: 'none' }} />
            {PITCH_POSITIONS.map(pos => {
              const on = draft.pitch_positions.includes(pos.code)
              return (
                <button key={pos.code} type="button" onClick={() => togglePitch(pos.code)} title={pos.ar} aria-label={pos.ar} aria-pressed={on}
                  className={on ? undefined : 'no-print'}
                  style={{
                    position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)',
                    width: '30px', height: '30px', borderRadius: '50%', padding: 0, cursor: 'pointer',
                    fontSize: '10px', fontWeight: 700, fontFamily: 'inherit',
                    background: on ? '#00DCC8' : 'rgba(255,255,255,0.08)',
                    color: on ? '#000A0F' : 'rgba(255,255,255,0.6)',
                    border: on ? '2px solid #fff' : '1px solid rgba(255,255,255,0.25)',
                  }}>
                  {pos.code}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Rating scale legend ─────────────────────────────────────────── */}
      <div style={{ ...card, padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ color: '#00DCC8', fontWeight: 700, fontSize: '14px' }}>{t('المعايير', 'Scale')}</span>
        {RATING_SCALE.map(s => (
          <span key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '13px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#EEEFEE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>{s.value}</span>
            {isRTL ? s.ar : s.en}
          </span>
        ))}
        <span style={{ marginInlineStart: 'auto', color: '#6B7280', fontSize: '12px' }}>
          {t(`${rated} من ${TOTAL_CRITERIA} معيار`, `${rated} of ${TOTAL_CRITERIA} rated`)}
        </span>
      </div>

      {/* ─── Four pillars ────────────────────────────────────────────────── */}
      <div className="scout-report-pillars" style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
        {PILLARS.map(pillar => {
          const pct = pillarPercent(pillar, draft.ratings[pillar.key])
          return (
            <section key={pillar.key} style={{ ...card, padding: 0, overflow: 'hidden', borderColor: `${pillar.color}40` }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: `${pillar.color}1F`, borderBottom: `1px solid ${pillar.color}40` }}>
                <h2 style={{ color: pillar.color, fontSize: '16px', fontWeight: 700, margin: 0 }}>{isRTL ? pillar.ar : pillar.en}</h2>
                <span style={{ color: pillar.color, fontWeight: 700, fontSize: '15px', fontFamily: "'Orbitron', sans-serif" }}>{pct}%</span>
              </header>
              <div style={{ padding: '8px 16px' }}>
                {pillar.criteria.map(c => {
                  const value = draft.ratings[pillar.key]?.[c.key]
                  const isMissing = showMissing && missing.has(`${pillar.key}.${c.key}`)
                  const label = isRTL ? c.ar : c.en
                  return (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: isMissing ? '#FCA5A5' : '#EEEFEE', fontSize: '13px' }}>{label}</span>
                      <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        {RATING_SCALE.map(s => {
                          const on = value === s.value
                          return (
                            <button key={s.value} type="button" role="radio" aria-checked={on} title={isRTL ? s.ar : s.en}
                              onClick={() => setRating(pillar.key, c.key, s.value)}
                              className={on ? 'rating-on' : 'rating-off'}
                              style={{
                                width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', padding: 0,
                                fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                                background: on ? pillar.color : 'transparent',
                                color: on ? '#000A0F' : '#6B7280',
                                border: `1px solid ${on ? pillar.color : isMissing ? 'rgba(239,68,68,0.5)' : '#374151'}`,
                              }}>
                              {s.value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <label style={{ ...labelStyle, marginTop: '12px' }} htmlFor={`sr-notes-${pillar.key}`}>{t('ملاحظات', 'Notes')}</label>
                <textarea id={`sr-notes-${pillar.key}`} rows={2} value={draft.notes[pillar.key]}
                  onChange={e => setDraft(prev => ({ ...prev, notes: { ...prev.notes, [pillar.key]: e.target.value } }))}
                  style={{ ...inputStyle, resize: 'vertical', marginBottom: '8px' }} />
              </div>
            </section>
          )
        })}
      </div>

      {/* ─── Total + opinion ─────────────────────────────────────────────── */}
      <div className="scout-report-footer" style={{ ...card, display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
          <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>{t('إجمالي التقييم من 100%', 'Total score out of 100%')}</div>
          <div style={{ color: scoreColor(total), fontSize: '44px', fontWeight: 800, fontFamily: "'Orbitron', sans-serif", lineHeight: 1.1 }}>{total}</div>
          {rated < TOTAL_CRITERIA && (
            <div className="no-print" style={{ color: '#6B7280', fontSize: '11px', marginTop: '6px' }}>{t('غير مكتمل', 'Incomplete')}</div>
          )}
        </div>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label style={labelStyle} htmlFor="sr-opinion">{t('رأي الكشاف', "Scout's opinion")}</label>
            <textarea id="sr-opinion" rows={3} value={draft.scout_opinion} onChange={e => set('scout_opinion', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ maxWidth: '320px' }}>
            <label style={labelStyle} htmlFor="sr-scout">{t('اسم الكشاف', 'Scout name')} *</label>
            <input id="sr-scout" value={draft.scout_name} onChange={e => set('scout_name', e.target.value)} style={{ ...inputStyle, ...errBorder('scout_name') }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .scout-report-pillars { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        @media (min-width: 1500px) { .scout-report-pillars { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 760px) { .scout-report-pillars { grid-template-columns: minmax(0, 1fr); } }
        @media (max-width: 640px) {
          .scout-report-header, .scout-report-footer { grid-template-columns: 1fr !important; }
          .scout-report-header > div:last-child { max-width: 200px; margin: 0 auto; width: 100%; }
        }
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          .scout-report-print, .scout-report-print * { visibility: visible !important; }
          .scout-report-print { position: absolute; inset: 0 auto auto 0; width: 100%; }
          .scout-report-print .no-print { display: none !important; }
          .scout-report-print, .scout-report-print * {
            color: #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          .scout-report-print section, .scout-report-print .scout-report-header,
          .scout-report-print .scout-report-footer, .scout-report-print > div {
            background: #fff !important; border-color: #999 !important; break-inside: avoid;
          }
          .scout-report-print input, .scout-report-print textarea {
            background: #fff !important; border-color: #bbb !important;
          }
          .scout-report-print .scout-report-pillars { grid-template-columns: repeat(4, 1fr) !important; gap: 6px !important; }
          .scout-report-print .rating-off { display: none !important; }
          .scout-report-print .rating-on { background: #fff !important; border: 1px solid #000 !important; }
        }
      `}</style>
    </div>
  )
}
