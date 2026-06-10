import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'

const QUERY_TIMEOUT_MS = 8000

export function CoachDashboard() {
  const { signOut } = useAuth()
  const [players, setPlayers] = useState<Array<{ id: string; user_id: string | null; name?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formation, setFormation] = useState('4-3-3')
  const [tacticalNotes, setTacticalNotes] = useState('')
  const mountedRef = useRef(true)

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Race: query vs timeout
      const queryPromise = supabase
        .from('players')
        .select('id, user_id, name')
        .eq('is_verified', true)

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), QUERY_TIMEOUT_MS)
      )

      const result: any = await Promise.race([queryPromise, timeoutPromise])
        .catch(() => ({ data: null, error: new Error('timeout') }))

      if (!mountedRef.current) return
      if (result.error) throw result.error
      setPlayers(result.data || [])
    } catch (err) {
      if (!mountedRef.current) return
      setError('فشل في تحميل بيانات اللاعبين')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    fetchPlayers()
    return () => { mountedRef.current = false }
  }, [])

  const handleSignOut = async () => { await signOut() }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={fetchPlayers} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000A0F', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      <header style={{ backgroundColor: '#0D1E35', borderBottom: '1px solid rgba(0, 220, 200, 0.15)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#00DCC8', fontFamily: "'Orbitron', sans-serif" }}>لوحة المدرب</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/app/rankings" style={{ padding: '8px 16px', backgroundImage: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)', color: '#000A0F', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>التصنيفات</Link>
          <button onClick={handleSignOut} style={{ padding: '8px 16px', backgroundColor: '#FF4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>خروج</button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#0D1E35', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0, 220, 200, 0.12)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#00DCC8', fontFamily: "'Orbitron', sans-serif", marginBottom: '16px' }}>التشكيل</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'].map(f => (
                <button key={f} onClick={() => setFormation(f)} style={{ padding: '8px 16px', backgroundImage: formation === f ? 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)' : 'none', backgroundColor: formation === f ? 'transparent' : '#0A1628', color: formation === f ? '#000A0F' : '#6B8099', border: formation === f ? 'none' : '1px solid rgba(0, 220, 200, 0.12)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: formation === f ? 600 : 400 }}>{f}</button>
              ))}
            </div>
            <div style={{ backgroundColor: '#0A1628', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#6B8099', fontSize: '14px' }}>
              {formation} — انقر على اللاعبين لتعيينهم
            </div>
          </div>

          <div style={{ backgroundColor: '#0D1E35', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0, 220, 200, 0.12)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#00DCC8', fontFamily: "'Orbitron', sans-serif", marginBottom: '16px' }}>ملاحظات تكتيكية</h2>
            <textarea value={tacticalNotes} onChange={(e) => setTacticalNotes(e.target.value)} placeholder="اكتب ملاحظاتك التكتيكية هنا..." rows={5} style={{ width: '100%', padding: '12px', border: '1px solid rgba(0, 220, 200, 0.15)', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', backgroundColor: '#0A1628', color: '#EEEFEE' }} />
          </div>
        </div>

        <div style={{ backgroundColor: '#0D1E35', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0, 220, 200, 0.12)', marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#00DCC8', fontFamily: "'Orbitron', sans-serif", marginBottom: '16px' }}>اللاعبين ({players.length})</h2>
          {players.length === 0 ? (
            <EmptyState title="لا يوجد لاعبين" description="لم يتم تسجيل أي لاعب بعد" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {players.map(player => (
                <div key={player.id} style={{ padding: '12px', backgroundColor: '#0A1628', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#0D1E35', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid rgba(0, 220, 200, 0.12)' }}>⚽</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#EEEFEE' }}>{player.name || 'لاعب'}</div>
                  <div style={{ fontSize: '12px', color: '#6B8099' }}>{player.user_id ? player.user_id.slice(0, 8) + '...' : '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}