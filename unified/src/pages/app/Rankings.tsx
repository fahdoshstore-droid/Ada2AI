import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'

const DEMO_RANKINGS = [
  { rank: 1, player_name: 'أحمد محمد', team: 'نادي النهضة', score: 95 },
  { rank: 2, player_name: 'خالد العتيبي', team: 'أكاديمية الأمل', score: 92 },
  { rank: 3, player_name: 'سامي القحطاني', team: 'نادي الشباب', score: 89 },
  { rank: 4, player_name: 'محمد الدوسري', team: 'نادي الهلال', score: 87 },
  { rank: 5, player_name: 'عبدالله السالم', team: 'أكاديمية النخبة', score: 85 },
]

export function Rankings() {
  const [rankings, setRankings] = useState(DEMO_RANKINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRankings = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await supabase
        .from('players')
        .select('id, user_id')
        .eq('is_active', true)

      if (data && data.length > 0) {
        const withScores = data.map((_p, i) => ({
          rank: i + 1,
          player_name: `لاعب ${i + 1}`,
          team: 'فريق',
          score: Math.floor(Math.random() * 30) + 70,
        }))
        setRankings(withScores.sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 })))
      }
    } catch (err) {
      setError('فشل في تحميل التصنيفات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRankings() }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={fetchRankings} />
  if (rankings.length === 0) return <EmptyState title="لا توجد تصنيفات حالياً" description="سيظهر التصنيف عند توفر بيانات اللاعبين" />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>التصنيفات</h1>
        <Link to="/app" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>العودة</Link>
      </header>

      <main style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {rankings.slice(0, 3).map((p, i) => (
            <div key={p.rank} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center', order: i === 0 ? -1 : i }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>{p.player_name}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{p.team}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb', marginTop: '8px' }}>{p.score}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                {['#', 'اللاعب', 'الفريق', 'النقاط'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankings.map((player, i) => (
                <tr key={player.rank} style={{ borderBottom: i < rankings.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: player.rank <= 3 ? '#d97706' : '#374151' }}>{player.rank}</td>
                  <td style={{ padding: '12px 16px', color: '#1e293b' }}>{player.player_name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px' }}>{player.team}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563eb' }}>{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
