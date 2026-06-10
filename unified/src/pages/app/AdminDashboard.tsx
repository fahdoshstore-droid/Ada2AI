import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'
import { ErrorState } from '../../components/ErrorState'
import { getClubPlayers, createPlayerViaEdgeFunction } from '../../lib/admin'
import type { ClubPlayer } from '../../lib/admin'

const QUERY_TIMEOUT_MS = 8000

type Tab = 'stats' | 'players' | 'add'

export function AdminDashboard() {
  const { email, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [stats, setStats] = useState({ players: 0, coaches: 0 })
  const [players, setPlayers] = useState<ClubPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  // Add player form state
  const [form, setForm] = useState({
    firstName: '', email: '', position: '',
    age: '', dominantFoot: 'right', jerseyNumber: ''
  })
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const playerPromise = supabase
        .from('players')
        .select('*', { count: 'exact', head: true })

      const coachPromise = supabase
        .from('coaches')
        .select('*', { count: 'exact', head: true })

      const timeoutPromise = new Promise<never>((_, reject) =>
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

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getClubPlayers('الروضة')
      if (!mountedRef.current) return
      setPlayers(data)
    } catch (err) {
      if (!mountedRef.current) return
      setError('فشل في تحميل بيانات اللاعبين')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true
    if (activeTab === 'stats') fetchStats()
    else if (activeTab === 'players') fetchPlayers()
    return () => { mountedRef.current = false }
  }, [activeTab])

  const handleCreatePlayer = async () => {
    if (!form.firstName || !form.email) return
    setCreating(true)
    setCreateError(null)
    setCreated(null)
    try {
      const result = await createPlayerViaEdgeFunction(form)
      setCreated({ email: result.email, tempPassword: result.tempPassword })
      setForm({ firstName: '', email: '', position: '', age: '', dominantFoot: 'right', jerseyNumber: '' })
    } catch (err: any) {
      setCreateError(err.message || 'فشل إنشاء الحساب')
    } finally {
      setCreating(false)
    }
  }

  if (loading && activeTab !== 'add') return <LoadingState />
  if (error && activeTab !== 'add') return <ErrorState message={error} onRetry={activeTab === 'stats' ? fetchStats : fetchPlayers} />

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#0D1E35',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(0, 220, 200, 0.12)',
    boxShadow: '0 0 20px rgba(0, 220, 200, 0.05)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 220, 200, 0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#EEEFEE',
    fontFamily: "'Cairo', sans-serif",
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    color: '#6B7280',
    fontFamily: "'Cairo', sans-serif",
    fontSize: '13px',
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats', label: 'الإحصائيات' },
    { id: 'players', label: 'اللاعبون' },
    { id: 'add', label: '+ إضافة لاعب' },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000A0F', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* ── Header ── */}
      <header style={{ backgroundColor: '#0A0E1A', borderBottom: '1px solid rgba(0, 220, 200, 0.15)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#EEEFEE', fontFamily: "'Orbitron', sans-serif", letterSpacing: '-0.01em' }}>
            لوحة المسؤول
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '14px' }}>{email}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/app/rankings" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)', color: '#000A0F', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>التصنيفات</Link>
          <button onClick={signOut} style={{ padding: '8px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>خروج</button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div style={{ padding: '16px 32px 0', display: 'flex', gap: '8px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCreated(null); setCreateError(null) }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              background: activeTab === tab.id ? '#00DCC8' : '#0D1E35',
              color: activeTab === tab.id ? '#000A0F' : '#6B7280',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Stats ── */}
      {activeTab === 'stats' && (
        <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { label: 'اللاعبين', value: stats.players, color: '#10B981' },
              { label: 'المدربين', value: stats.coaches, color: '#F59E0B' },
            ].map(stat => (
              <div key={stat.label} style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: stat.color, fontFamily: "'Orbitron', sans-serif", textShadow: `0 0 12px ${stat.color}40` }}>{stat.value}</div>
                <div style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── Tab: Players ── */}
      {activeTab === 'players' && (
        <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", color: '#EEEFEE', fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>
              لاعبو نادي الروضة ({players.length})
            </h2>
            {players.length === 0 ? (
              <p style={{ color: '#6B7280', fontFamily: "'Cairo', sans-serif" }}>لا يوجد لاعبون بعد — أضف أول لاعب من تبويب "إضافة لاعب"</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {players.map(player => (
                  <div key={player.id} style={{
                    backgroundColor: 'rgba(0, 220, 200, 0.05)',
                    border: '1px solid rgba(0, 220, 200, 0.1)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ margin: 0, color: '#EEEFEE', fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}>{player.name}</p>
                      <p style={{ margin: '2px 0 0', color: '#6B7280', fontFamily: "'Cairo', sans-serif", fontSize: '12px' }}>
                        {player.position || 'مركز غير محدد'}{player.age ? ` · ${player.age} سنة` : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {player.is_verified && (
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: "'Cairo', sans-serif" }}>مؤكد</span>
                      )}
                      {player.rating && (
                        <span style={{ backgroundColor: 'rgba(0, 220, 200, 0.15)', color: '#00DCC8', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: "'Orbitron', sans-serif", fontWeight: 700 }}>{player.rating}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── Tab: Add Player ── */}
      {activeTab === 'add' && (
        <main style={{ padding: '32px', maxWidth: '520px', margin: '0 auto' }}>
          <div style={cardStyle}>
            <h2 style={{ fontFamily: "'Cairo', sans-serif", color: '#EEEFEE', fontSize: '16px', fontWeight: 700, margin: '0 0 20px' }}>
              إضافة لاعب جديد
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'firstName', label: 'الاسم الأول *', type: 'text', placeholder: 'اسم اللاعب' },
                { key: 'email', label: 'البريد الإلكتروني *', type: 'email', placeholder: 'player@email.com' },
                { key: 'position', label: 'المركز', type: 'text', placeholder: 'مهاجم، مدافع...' },
                { key: 'age', label: 'العمر', type: 'number', placeholder: '16' },
                { key: 'jerseyNumber', label: 'رقم القميص', type: 'number', placeholder: '10' },
              ].map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <label style={labelStyle}>القدم المفضلة</label>
                <select
                  value={form.dominantFoot}
                  onChange={e => setForm(prev => ({ ...prev, dominantFoot: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="right">اليمنى</option>
                  <option value="left">اليسرى</option>
                  <option value="both">كلتاهما</option>
                </select>
              </div>

              {createError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '12px 16px', color: '#EF4444', fontFamily: "'Cairo', sans-serif", fontSize: '13px' }}>
                  {createError}
                </div>
              )}

              <button
                onClick={handleCreatePlayer}
                disabled={creating || !form.firstName || !form.email}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: (creating || !form.firstName || !form.email) ? '#1a3a4a' : '#00DCC8',
                  color: (creating || !form.firstName || !form.email) ? '#6B7280' : '#000A0F',
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: (creating || !form.firstName || !form.email) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {creating ? 'جارٍ الإنشاء...' : 'إنشاء حساب اللاعب'}
              </button>
            </div>
          </div>

          {/* Creation result */}
          {created && (
            <div style={{ marginTop: '16px', ...cardStyle, borderColor: 'rgba(0, 220, 200, 0.4)' }}>
              <p style={{ color: '#00DCC8', fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: '15px', margin: '0 0 16px' }}>
                ✅ تم إنشاء الحساب بنجاح
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'البريد', value: created.email },
                  { label: 'كلمة المرور المؤقتة', value: created.tempPassword },
                  { label: 'الرابط', value: 'https://ada2ai.com' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: '#6B7280', fontFamily: "'Cairo', sans-serif", fontSize: '13px' }}>{row.label}</span>
                    <span style={{ color: '#EEEFEE', fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(
                  `البريد: ${created.email}\nكلمة المرور: ${created.tempPassword}\nالرابط: https://ada2ai.com`
                )}
                style={{
                  marginTop: '16px', width: '100%', padding: '10px', borderRadius: '10px',
                  border: '1px solid rgba(0, 220, 200, 0.3)', background: 'transparent',
                  color: '#00DCC8', fontFamily: "'Cairo', sans-serif", fontSize: '13px', cursor: 'pointer',
                }}
              >
                نسخ البيانات لإرسالها للاعب
              </button>
              <p style={{ color: '#6B7280', fontFamily: "'Cairo', sans-serif", fontSize: '11px', textAlign: 'center', margin: '8px 0 0' }}>
                أرسل هذه البيانات للاعب — سيغير كلمة المرور عند أول دخول
              </p>
            </div>
          )}
        </main>
      )}
    </div>
  )
}