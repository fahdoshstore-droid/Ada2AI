/**
 * TrackIdentityLinker — «ربط المسارات باللاعبين»
 *
 * The hinge of the whole analysis pipeline. Every metric the vision service
 * produces is attached to a temporary track_id; the engine labels it
 * "track_id is NOT player_id". This screen is where a coach says which track
 * is which player, writing the link the rest of the product reads.
 *
 * Deliberately unglamorous: tracks ordered by how long they were actually
 * visible, each showing the evidence behind it, and nothing auto-matched.
 * A guess here would silently attach one player's running to another.
 */
import { useMemo, useState } from 'react'
import { Link2, Link2Off, Loader2, UserCheck } from 'lucide-react'
import type { Player } from '../../lib/supabase'
import { useMatchTracks, useLinkTrack } from '../../hooks/useTrackLinks'

interface Props {
  matchId: string
  /** The coach's own roster — the only players a track may be linked to. */
  players: Player[]
}

const TEAM_COLOR: Record<number, string> = { 1: '#00DCC8', 2: '#0095E0' }

function meters(v: number | null) {
  return v == null ? '—' : `${v.toFixed(1)} م`
}

export default function TrackIdentityLinker({ matchId, players }: Props) {
  const { tracks, links, loading, error } = useMatchTracks(matchId)
  const { link, unlink } = useLinkTrack(matchId)
  const [choice, setChoice] = useState<Record<string, string>>({})

  const linkByTrack = useMemo(() => {
    const m = new Map<string, (typeof links)[number]>()
    for (const l of links) m.set(`${l.analysis_id}:${l.track_id}`, l)
    return m
  }, [links])

  const playerById = useMemo(() => new Map(players.map(p => [p.id, p])), [players])

  // 61 players across 11 clubs sit in one list otherwise. Grouping by club
  // is what makes the coach's own squad findable in a flat <select>.
  const byClub = useMemo(() => {
    const groups = new Map<string, Player[]>()
    for (const player of players) {
      const club = player.club || 'بدون نادٍ'
      const bucket = groups.get(club)
      if (bucket) bucket.push(player)
      else groups.set(club, [player])
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ar'))
  }, [players])
  const linkedCount = tracks.filter(t => linkByTrack.get(`${t.analysisId}:${t.trackId}`)?.player_id).length

  if (loading) {
    return (
      <p className="glass-card flex items-center gap-2 rounded-2xl p-6 text-sm text-ice-muted arabic-text" role="status">
        <Loader2 className="h-4 w-4 animate-spin" /> جارٍ تحميل مسارات المباراة…
      </p>
    )
  }

  if (error) {
    return (
      <p className="glass-card rounded-2xl p-6 text-sm text-gold arabic-text" role="status">
        تعذّر قراءة المسارات: {error}
      </p>
    )
  }

  if (!tracks.length) {
    return (
      <p className="glass-card rounded-2xl p-6 text-sm text-ice-muted arabic-text">
        لا توجد مسارات محفوظة لهذه المباراة. ارفع فيديو وشغّل التحليل أولاً.
      </p>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6" dir="rtl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-black tracking-tightest text-ice-white arabic-text">ربط المسارات باللاعبين</h3>
          <p className="mt-1 max-w-xl text-sm text-ice-muted arabic-text">
            رقم المسار مؤقت وليس هوية لاعب. حتى تربطه، تبقى الأرقام بلا صاحب ولا تدخل بطاقة أحد.
          </p>
        </div>
        <span className="rounded-full border border-teal-prime/30 px-3 py-1 text-xs font-bold text-teal-prime">
          <span className="num">{linkedCount}</span> / <span className="num">{tracks.length}</span> مربوط
        </span>
      </div>

      {!players.length && (
        <p className="mb-4 rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm text-gold arabic-text">
          لا يوجد لاعبون في كشفك، فلا يمكن الربط. أضف لاعبيك أولاً.
        </p>
      )}

      <ul className="flex flex-col divide-y divide-white/[0.06]">
        {tracks.map(t => {
          const key = `${t.analysisId}:${t.trackId}`
          const existing = linkByTrack.get(key)
          const linkedPlayer = existing?.player_id ? playerById.get(existing.player_id) : undefined
          const isLinked = !!existing?.player_id
          const busy = link.isPending || unlink.isPending

          return (
            <li key={key} className="flex flex-wrap items-center gap-3 py-3">
              <span
                className="flex h-9 w-14 flex-none items-center justify-center rounded-lg border text-xs font-bold"
                style={{
                  color: t.team ? TEAM_COLOR[t.team] : '#8A97A6',
                  borderColor: t.team ? `${TEAM_COLOR[t.team]}55` : 'rgba(238,239,238,.15)',
                }}
                title={t.team ? `الفريق ${t.team}` : 'فريق غير محدد'}
              >
                <span className="num">T-{t.trackId}</span>
              </span>

              <span className="flex-1 min-w-[140px] text-xs text-ice-muted arabic-text">
                ظهر <span className="num text-ice-white">{t.framesVisible ?? 0}</span> إطاراً
                <span className="mx-2 opacity-40">·</span>
                مسافة <span className="num text-ice-white">{meters(t.totalDistanceMeters)}</span>
                <span className="mx-2 opacity-40">·</span>
                <span className="text-gold">غير معايرة</span>
              </span>

              {isLinked ? (
                <>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-teal-prime arabic-text">
                    <UserCheck className="h-4 w-4" />
                    {linkedPlayer?.name ?? 'لاعب مرتبط'}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => existing && unlink.mutate(existing.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-ice-muted transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-50 arabic-text"
                  >
                    <Link2Off className="h-3.5 w-3.5" /> فك الربط
                  </button>
                </>
              ) : (
                <>
                  <label className="sr-only" htmlFor={`sel-${key}`}>اختر لاعباً للمسار {t.trackId}</label>
                  <select
                    id={`sel-${key}`}
                    value={choice[key] ?? ''}
                    disabled={!players.length || busy}
                    onChange={e => setChoice(c => ({ ...c, [key]: e.target.value }))}
                    className="min-w-[150px] rounded-lg border border-white/10 bg-[#05080f] px-3 py-2 text-sm text-ice-white outline-none focus:border-teal-prime/50 disabled:opacity-50 arabic-text"
                  >
                    <option value="">— اختر لاعباً —</option>
                    {byClub.map(([club, group]) => (
                      <optgroup key={club} label={club}>
                        {group.map(p => (
                          <option key={p.id} value={p.id}>{p.name || 'بدون اسم'}{p.position ? ` · ${p.position}` : ''}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!choice[key] || busy}
                    onClick={() => {
                      const p = playerById.get(choice[key])
                      if (!p) return
                      link.mutate({
                        analysisId: t.analysisId,
                        trackId: t.trackId,
                        playerId: p.id,
                        playerProfileId: p.user_id ?? null,
                        existingLinkId: existing?.id ?? null,
                      })
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-prime px-4 py-2 text-xs font-bold text-navy-dark transition-opacity disabled:opacity-40 arabic-text"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                    اربط
                  </button>
                </>
              )}
            </li>
          )
        })}
      </ul>

      {(link.error || unlink.error) && (
        <p className="mt-4 text-sm text-gold arabic-text">
          تعذّر الحفظ: {(link.error ?? unlink.error)?.message}
        </p>
      )}
    </div>
  )
}
