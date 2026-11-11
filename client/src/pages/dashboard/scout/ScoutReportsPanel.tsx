/**
 * ScoutReportsPanel - list of the scout's evaluation reports + the report editor.
 * `prefill` opens a new report for a platform player picked from the discover grid.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ClipboardList, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { useScoutReports } from '@/hooks/useScoutReports'
import {
  PILLARS, emptyDraft, pillarPercent, scoreColor,
  type ScoutReport, type ScoutReportDraft,
} from '@/lib/scoutReport'
import ScoutReportForm from './ScoutReportForm'

export interface ReportPrefill {
  player_id: string
  player_name: string
  birth_year: number | null
  club: string
  position: string
}

interface Props {
  isRTL: boolean
  prefill: ReportPrefill | null
  onPrefillConsumed: () => void
}

type Editing = { id?: string; draft: ScoutReportDraft; key: string } | null

const cairo = "'Cairo', sans-serif"

function todayISO(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function toDraft(r: ScoutReport): ScoutReportDraft {
  const { id: _id, scout_id: _s, total_score: _t, created_at: _c, updated_at: _u, ...draft } = r
  return draft
}

export default function ScoutReportsPanel({ isRTL, prefill, onPrefillConsumed }: Props) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { reports, isLoading, isError, save, remove } = useScoutReports()
  const [editing, setEditing] = useState<Editing>(null)
  const [search, setSearch] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const scoutName = profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || ''

  const startNew = (base?: Partial<ScoutReportDraft>) => {
    setSaveError(null)
    setEditing({ draft: { ...emptyDraft(todayISO(), scoutName), ...base }, key: `new-${Date.now()}` })
  }

  useEffect(() => {
    if (!prefill) return
    startNew(prefill)
    onPrefillConsumed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return reports
    return reports.filter(r => `${r.player_name} ${r.club} ${r.position} ${r.match}`.toLowerCase().includes(q))
  }, [reports, search])

  const handleSave = (draft: ScoutReportDraft) => {
    setSaveError(null)
    save.mutate({ id: editing?.id, draft }, {
      onSuccess: () => setEditing(null),
      onError: () => setSaveError(t('تعذّر حفظ التقرير. تحقق من الاتصال وحاول مرة أخرى.', 'Could not save the report. Check your connection and try again.')),
    })
  }

  const handleDelete = (r: ScoutReport) => {
    if (!window.confirm(t(`حذف تقرير «${r.player_name}» نهائياً؟`, `Permanently delete the report for "${r.player_name}"?`))) return
    remove.mutate(r.id)
  }

  if (editing) {
    return (
      <ScoutReportForm
        key={editing.key}
        initial={editing.draft}
        isRTL={isRTL}
        isEditing={!!editing.id}
        isSaving={save.isPending}
        saveError={saveError}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div style={{ fontFamily: cairo }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', insetInlineEnd: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('ابحث في التقارير بالاسم أو النادي...', 'Search reports by name or club...')}
            aria-label={t('بحث في التقارير', 'Search reports')}
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', paddingInlineEnd: '44px', backgroundColor: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px', color: '#EEEFEE', fontSize: '14px', fontFamily: cairo, outline: 'none' }}
          />
        </div>
        <button onClick={() => startNew()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#00DCC8', border: 'none', borderRadius: '8px', color: '#000A0F', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: cairo }}>
          <Plus size={18} />
          {t('تقييم لاعب جديد', 'New player report')}
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '60px', color: '#9CA3AF' }}>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
          {t('جاري تحميل التقارير...', 'Loading reports...')}
        </div>
      ) : isError ? (
        <div role="alert" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', padding: '60px', color: '#EF4444' }}>
          <AlertCircle size={22} />
          {t('تعذّر تحميل التقارير', 'Failed to load reports')}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280', backgroundColor: '#0A0E1A', border: '1px solid #1F2937', borderRadius: '12px' }}>
          <ClipboardList size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p>{reports.length === 0
            ? t('لا توجد تقارير بعد. ابدأ بتقييم أول لاعب.', 'No reports yet. Start by evaluating your first player.')
            : t('لا توجد تقارير مطابقة للبحث', 'No reports match your search')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(r => (
            <article key={r.id} style={{ padding: '18px', backgroundColor: '#0A0E1A', border: '1px solid #1F2937', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ color: '#EEEFEE', fontSize: '16px', fontWeight: 700, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.player_name}</h3>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', margin: 0 }}>
                    {[r.position, r.club, r.birth_year].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div style={{ color: scoreColor(r.total_score), fontSize: '26px', fontWeight: 800, fontFamily: "'Orbitron', sans-serif", flexShrink: 0 }}>
                  {r.total_score}<span style={{ fontSize: '13px' }}>%</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
                {PILLARS.map(p => {
                  const pct = pillarPercent(p, r.ratings[p.key])
                  return (
                    <div key={p.key} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 36px', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? p.ar : p.en}</span>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: p.color, borderRadius: '3px' }} />
                      </div>
                      <span style={{ color: '#EEEFEE', fontSize: '12px', fontWeight: 600, textAlign: 'end' }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>

              {r.scout_opinion && (
                <p style={{ color: '#D1D5DB', fontSize: '13px', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.scout_opinion}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#6B7280', fontSize: '12px' }} dir="ltr">{r.discovery_date}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { setSaveError(null); setEditing({ id: r.id, draft: toDraft(r), key: r.id }) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(0,220,200,0.1)', border: '1px solid rgba(0,220,200,0.3)', borderRadius: '6px', color: '#00DCC8', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: cairo }}>
                    <Pencil size={13} />
                    {t('فتح', 'Open')}
                  </button>
                  <button onClick={() => handleDelete(r)} disabled={remove.isPending} aria-label={t('حذف التقرير', 'Delete report')} title={t('حذف', 'Delete')}
                    style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#EF4444', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
