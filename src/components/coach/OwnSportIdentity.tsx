/**
 * OwnSportIdentity — the signed-in player's own Sport ID on /sport-id.
 *
 * Read-only: never creates or enrolls a player. Shown to player accounts only;
 * coaches and scouts get a role-specific call to action in the page header.
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BadgeCheck, ChevronLeft, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOwnPlayer } from '../../hooks/useOwnPlayer'
import { getSportIdentityForProfile } from '../../services/sportIdentity'
import { sportLabel } from '../../lib/sportLabel'

export default function OwnSportIdentity() {
  const { user, profile } = useAuth()
  const isPlayer = profile?.user_type === 'player'
  const own = useOwnPlayer()
  const identity = useQuery({
    queryKey: ['own-sport-identity', user?.id],
    enabled: !!user && isPlayer,
    queryFn: () => getSportIdentityForProfile(user!.id),
    staleTime: 30_000,
  })

  if (!user || !isPlayer) return null
  if (own.isPending) return <p className="text-sm text-ice-muted arabic-text" role="status">جارٍ تحميل هويتك الرياضية…</p>
  if (own.isError) return <p className="text-sm text-gold arabic-text" role="alert">تعذّر تحميل هويتك الرياضية. حدّث الصفحة وحاول مرة أخرى.</p>

  const player = own.data
  const sportId = identity.data?.sport_id

  if (!player) {
    return (
      <div className="flex flex-col items-start gap-4 border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-black text-ice-white arabic-text">لم تُنشئ هويتك الرياضية بعد</p>
          <p className="mt-1 text-sm text-ice-muted arabic-text">ثلاث خطوات: الرياضة والمركز، ثم بياناتك، ثم المراجعة والتأكيد. تأخذ دقيقتين.</p>
        </div>
        <Link to="/player/onboarding" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm arabic-text">
          <UserPlus className="h-4 w-4" /> أنشئ هويتك الآن
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 border border-teal-prime/30 bg-teal-prime/[0.04] p-6 sm:grid-cols-[1fr_auto] sm:items-center" data-testid="own-sport-identity">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold text-teal-prime arabic-text">
          <BadgeCheck className="h-4 w-4" /> هويتك الرياضية
        </p>
        <p className="mt-2 text-2xl font-black text-ice-white arabic-text">{player.name || 'بدون اسم'}</p>
        <p className="mt-1 text-sm text-ice-muted arabic-text">
          {[player.position, player.sport ? sportLabel(player.sport) : null, player.club].filter(Boolean).join(' · ')}
        </p>
        {sportId && (
          <p className="mt-3 text-xs text-ice-muted arabic-text">
            رقم الهوية: <bdi dir="ltr" className="font-display font-bold tracking-wider text-ice-white">{sportId}</bdi>
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={`/player/${player.id}`} className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm arabic-text">
          عرض بطاقتي <ChevronLeft className="h-4 w-4" />
        </Link>
        <Link to="/player/dashboard" className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-ice-white transition-colors hover:border-teal-prime/50 arabic-text">
          تحديث بياناتي
        </Link>
      </div>
    </div>
  )
}
