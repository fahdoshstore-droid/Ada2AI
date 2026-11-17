/**
 * /match-report — the single post-match report route for all three roles.
 * The signed-in profile's user_type picks the view; there is no role switch
 * on screen because a user is exactly one of them.
 */
import { ClipboardList } from 'lucide-react'
import PageHeader from '../components/cinema/PageHeader'
import MatchReport from '../components/match-report/MatchReport'
import { useAuth } from '../contexts/AuthContext'

export default function MatchReportPage() {
  const { profile } = useAuth()
  const role = profile?.user_type ?? 'player'
  return (
    <div className="min-h-screen bg-navy">
      <PageHeader eyebrow="بعد صافرة النهاية" icon={ClipboardList} titleTop="تقرير" titleBottom="المباراة" compact />
      <div className="px-4 pb-16 pt-6">
        <MatchReport role={role} />
      </div>
    </div>
  )
}
