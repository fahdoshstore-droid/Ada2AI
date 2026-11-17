import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { getFootballTrackIdentities } from '../../services/sportIdentity'

export default function FootballTrackLinks({ matchId }: { matchId: string }) {
  const { user } = useAuth()
  const links = useQuery({
    queryKey: ['football-track-identities', user?.id, matchId],
    enabled: !!user && !!matchId,
    queryFn: () => getFootballTrackIdentities(matchId),
  })
  if (!user) return null
  return <section className="rounded-xl bg-white/5 p-4 text-sm arabic-text">
    <h3 className="font-bold text-ice-white">هوية مسارات كرة القدم</h3>
    <p className="text-xs text-ice-muted mt-1">المسار مجهول حتى يوجد ربط موثق بلاعب. رقم المسار ليس رقم قميص أو هوية دائمة.</p>
    {links.isPending ? <p className="text-ice-muted">جارٍ تحميل الروابط…</p> : links.isError ? <p className="text-gold">تعذر التحقق من روابط الهوية أو صلاحية الوصول.</p> : !links.data?.length ? <p className="text-ice-muted">لا توجد مسارات متاحة للحساب الحالي.</p> :
      <ul className="mt-3 max-h-48 overflow-y-auto space-y-2">{links.data.map(link => <li key={`${link.analysisId}:${link.trackId}`} className="text-ice-muted break-all">
        <span dir="ltr">Analysis {link.analysisId} · Track {link.trackId}</span>
        {' · '}{link.player ? <span className="text-teal-prime">Player {link.player.id}{link.identity ? ` · ${link.identity.sport_id}` : ''}</span> : 'هوية غير مؤكدة'}
      </li>)}</ul>}
  </section>
}
