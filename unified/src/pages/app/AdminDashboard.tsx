import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'

const QUERY_TIMEOUT_MS = 8000

export function AdminDashboard() {
  const { email, signOut } = useAuth()
  const [stats, setStats] = useState({ players: 0, coaches: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const playerPromise = supabase
        .from('players')
        .select('*', { count: 'exact', head: true })

      const coachPromise = supabase
        .from('coaches')
        .select('*', { count: 'exact', head: true })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), QUERY_TIMEOUT_MS)
      )

      const results: any = await Promise.race([
        Promise.all([playerPromise, coachPromise]),
        timeoutPromise
      ]).catch(() => [{ count: null, error: new Error('timeout') }, { count: null, error: null }])

      if (!mountedRef.current) return

      const playerResult = results?.[0] || { count: null }
      const coachResult = results?.[1] || { count: null }

      setStats({
        players: playerResult.count ?? 0,
        coaches: coachResult.count ?? 0,
      })
    } catch (err) {
      if (!mountedRef.current) return
      setError('فشل في تحميل البيانات')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => { mountedRef.current = false }
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={fetchData} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000A0F', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      <header style={{ backgroundColor: '#0A0E1A', borderBottom: '1px solid rgba(0, 220, 200, 0.15)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#EEEFEE', fontFamily: "'Orbitron', sans-serif", letterSpacing: '-0.01em' }}>لوحة المسؤول</h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>
            {email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/app/rankings" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>التصنيفات</Link>
          <button onClick={signOut} style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>تسجيل الخروج</button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { label: 'اللاعبين', value: stats.players, color: '#10B981' },
            { label: 'المدربين', value: stats.coaches, color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: '#0A0E1A', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0, 220, 200, 0.12)', textAlign: 'center', boxShadow: '0 0 20px rgba(0, 220, 200, 0.08)' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: stat.color, fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 12px ${stat.color}40` }}>{stat.value}</div>
              <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}