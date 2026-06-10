import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'

interface PlayerData {
  id: string
  name: string
  position: string | null
  age: number | null
  rating: number
  speed: number
  agility: number
  technique: number
  stamina: number
  academy_name: string | null
  avatar_url: string | null
  bio: string | null
  is_verified: boolean
}

const QUERY_TIMEOUT_MS = 8000

export function PlayerDashboard() {
  const { userId, signOut } = useAuth()
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchPlayer = async () => {
    if (!userId) return
    try {
      setLoading(true)
      setError(null)

      const queryPromise = supabase
        .from('players')
        .select('id, name, position, age, rating, speed, agility, technique, stamina, academy_name, avatar_url, bio, is_verified')
        .eq('user_id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), QUERY_TIMEOUT_MS)
      )

      const result: any = await Promise.race([queryPromise, timeoutPromise])
        .catch(() => ({ data: null, error: new Error('timeout') }))

      if (!mountedRef.current) return
      if (result.error) throw result.error
      setPlayer(result.data)
    } catch (err: any) {
      if (!mountedRef.current) return
      setError(err.message || 'فشل في تحميل بيانات اللاعب')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    fetchPlayer()
    return () => { mountedRef.current = false }
  }, [userId])

  const handleSignOut = async () => { await signOut() }

  if (!userId) return <LoadingState />
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={fetchPlayer} />

  // No player record linked to this user yet
  if (!player) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000A0F', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
        <header style={{ backgroundColor: '#0D1E35', borderBottom: '1px solid rgba(0, 220, 200, 0.15)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#00DCC8', letterSpacing: '-0.01em' }}>لوحة اللاعب</h1>
          <button onClick={handleSignOut} style={{ padding: '8px 16px', backgroundColor: '#FF4444', color: '#000A0F', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>خروج</button>
        </header>
        <main style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
          <EmptyState title="لم يتم ربط ملف اللاعب بعد" description="سيتم ربط ملفك تلقائياً عند تسجيل بياناتك" />
        </main>
      </div>
    )
  }

  const stats = [
    { label: 'السرعة', value: player.speed || '—', color: '#00DCC8' },
    { label: 'الرشاقة', value: player.agility || '—', color: '#10B981' },
    { label: 'التقنية', value: player.technique || '—', color: '#F59E0B' },
    { label: 'اللياقة', value: player.stamina || '—', color: '#FF4444' },
    { label: 'التقييم العام', value: player.rating || '—', color: '#007ABA' },
    { label: 'المركز', value: player.position || '—', color: '#00DCC8' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000A0F', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      <header style={{ backgroundColor: '#0D1E35', borderBottom: '1px solid rgba(0, 220, 200, 0.15)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#00DCC8', letterSpacing: '-0.01em' }}>لوحة اللاعب</h1>
          <p style={{ margin: '4px 0 0', color: '#6B8099', fontSize: '14px' }}>{player.name}</p>
        </div>
        <button onClick={handleSignOut} style={{ padding: '8px 16px', backgroundColor: '#FF4444', color: '#000A0F', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>خروج</button>
      </header>

      <main style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Player Profile Card */}
        <div style={{ backgroundColor: '#0D1E35', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0, 220, 200, 0.12)', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#0A1628', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', border: '1px solid rgba(0, 220, 200, 0.2)' }}>
            {player.avatar_url ? <img src={player.avatar_url} alt={player.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '⚽'}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Orbitron', sans-serif", color: '#EEEFEE', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{player.name}</h2>
          {player.position && <p style={{ color: '#6B8099', fontSize: '14px', margin: '0 0 4px' }}>{player.position}</p>}
          {player.academy_name && <p style={{ color: '#6B8099', fontSize: '13px', margin: 0 }}>{player.academy_name}</p>}
          {player.bio && <p style={{ color: '#6B8099', fontSize: '13px', margin: '8px 0 0', fontStyle: 'italic' }}>{player.bio}</p>}
        </div>

        {/* Real Stats from Supabase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Intelligence Navigation */}
        <a href="/app/intelligence" style={{ display: 'block', backgroundColor: '#1e40af', color: '#fff', padding: '16px 24px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>
          🧠 عرض الذكاء الرياضي
        </a>

        {/* Analysis History — will connect to video_analyses later */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>سجل التحليلات</h3>
          <EmptyState title="لا توجد تحليلات بعد" description="سيظهر سجل التحليلات عند رفع فيديو وتحليله" />
        </div>
      </main>
    </div>
  )
}