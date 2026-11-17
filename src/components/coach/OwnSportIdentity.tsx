import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getSportIdentityForProfile, resolveFootballSportIdentity } from '../../services/sportIdentity'

/** Existing authenticated identity; never creates or enrolls a football player. */
export default function OwnSportIdentity() {
  const { user } = useAuth()
  const identity = useQuery({
    queryKey: ['own-football-sport-identity', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const existing = await getSportIdentityForProfile(user!.id)
      if (!existing) return null
      const resolved = await resolveFootballSportIdentity(existing.sport_id)
      if (!resolved || resolved.identity.profile_id !== user!.id || resolved.identity.id !== existing.id) throw new Error('Identity/profile mismatch')
      return resolved
    },
    staleTime: 0,
    gcTime: 0,
  })
  if (!user) return null
  if (identity.isPending) return <p className="text-sm text-ice-muted arabic-text" role="status">جارٍ التحقق من Sport ID…</p>
  if (identity.isError) return <p className="text-sm text-gold arabic-text" role="status">تعذر التحقق من ربط الهوية الرياضية. لم يُنشأ ملف لاعب.</p>
  if (!identity.data) return <p className="text-sm text-ice-muted arabic-text">Sport ID غير متاح للحساب الحالي.</p>
  return <div className="glass-card rounded-xl p-4 text-sm arabic-text" data-testid="own-sport-identity">
    <p className="font-bold text-teal-prime" dir="ltr">Sport ID: {identity.data.identity.sport_id}</p>
    {identity.data.player ? <Link className="text-teal-prime underline" to={`/player/${identity.data.player.id}`}>عرض ملف لاعب كرة القدم المرتبط</Link> :
      <p className="text-ice-muted mt-2">الهوية مرتبطة بالحساب؛ لا يوجد ملف لاعب كرة قدم متاح لهذا الحساب.</p>}
  </div>
}
