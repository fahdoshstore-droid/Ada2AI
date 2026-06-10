import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import { uploadVideoForAnalysis, getRecentAnalyses } from '../../lib/analysis'

const QUERY_TIMEOUT_MS = 8000

type Tab = 'players' | 'analysis'

export function CoachDashboard() {
  const { signOut } = useAuth()
  const [players, setPlayers] = useState<Array<{ id: string; user_id: string | null; name?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formation, setFormation] = useState('4-3-3')
  const [tacticalNotes, setTacticalNotes] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('players')
  const mountedRef = useRef(true)

  // Video analysis state
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<any[]>([])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setError(null)

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

  const fetchAnalyses = async () => {
    try {
      const data = await getRecentAnalyses(10)
      if (mountedRef.current) setAnalyses(data)
    } catch {
      // silently fail — analyses are supplementary
    }
  }

  useEffect(() => {
    mountedRef.current = true
    fetchPlayers()
    fetchAnalyses()
    return () => { mountedRef.current = false }
  }, [])

  // Refresh analyses after upload
  useEffect(() => {
    if (uploadResult) fetchAnalyses()
  }, [uploadResult])

  const handleUpload = async () => {
    if (!file || !title) return
    setUploading(true)
    setUploadError(null)
    try {
      const { analysisId } = await uploadVideoForAnalysis(file, title)
      setUploadResult(analysisId)
      setFile(null)
      setTitle('')
    } catch (e: any) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = async () => { await signOut() }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={fetchPlayers} />

  const statusColor = (st: string) =>
    st === 'completed' ? '#00DCC8' :
    st === 'مكتمل' ? '#00DCC8' :
    st === 'failed' ? '#EF4444' :
    st === 'فشل' ? '#EF4444' : '#F59E0B'

  const statusAr = (st: string) => {
    const map: Record<string, string> = {
      queued: 'قيد الانتظار',
      processing: 'جارٍ التحليل',
      completed: 'مكتمل',
      failed: 'فشل',
    }
    return map[st] || st
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 24px',
    border: 'none',
    borderBottom: active ? '2px solid #00DCC8' : '2px solid transparent',
    background: 'transparent',
    color: active ? '#00DCC8' : '#6B7280',
    fontFamily: "'Cairo', sans-serif",
    fontSize: 15,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
  })

  const cardStyle: React.CSSProperties = {
    background: '#0D1E35',
    borderRadius: 16,
    padding: 24,
    border: '1px solid rgba(0,220,200,0.15)',
    marginBottom: 16,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,220,200,0.2)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#EEEFEE',
    fontFamily: "'Cairo', sans-serif",
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: 4,
  }

  const labelStyle: React.CSSProperties = {
    color: '#6B7280',
    fontFamily: "'Cairo', sans-serif",
    fontSize: 13,
    display: 'block',
    marginBottom: 4,
  }

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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(0,220,200,0.1)', padding: '0 32px', backgroundColor: '#0D1E35' }}>
        <button onClick={() => setActiveTab('players')} style={tabStyle(activeTab === 'players')}>
          اللاعبين والتشكيل
        </button>
        <button onClick={() => setActiveTab('analysis')} style={tabStyle(activeTab === 'analysis')}>
          تحليل الفيديو
        </button>
      </div>

      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'players' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={cardStyle}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#00DCC8', fontFamily: "'Orbitron', sans-serif", marginBottom: '16px' }}>التشكيل</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'].map(f => (
                    <button key={f} onClick={() => setFormation(f)} style={{ padding: '8px 16px', backgroundImage: formation === f ? 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)' : 'none', backgroundColor: formation === f ? 'transparent' : '#0A1628', color: formation === f ? '#000A0F' : '#6B7280', border: formation === f ? 'none' : '1px solid rgba(0, 220, 200, 0.12)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: formation === f ? 600 : 400 }}>{f}</button>
                  ))}
                </div>
                <div style={{ backgroundColor: '#0A1628', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#6B8099', fontSize: '14px' }}>
                  {formation} — انقر على اللاعبين لتعيينهم
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#00DCC8', fontFamily: "'Orbitron', sans-serif", marginBottom: '16px' }}>ملاحظات تكتيكية</h2>
                <textarea value={tacticalNotes} onChange={(e) => setTacticalNotes(e.target.value)} placeholder="اكتب ملاحظاتك التكتيكية هنا..." rows={5} style={{ width: '100%', padding: '12px', border: '1px solid rgba(0, 220, 200, 0.15)', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', backgroundColor: '#0A1628', color: '#EEEFEE' }} />
              </div>
            </div>

            <div style={{ ...cardStyle, marginTop: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#00DCC8', fontFamily: "'Orbitron', sans-serif", marginBottom: '16px' }}>اللاعبين ({players.length})</h2>
              {players.length === 0 ? (
                <EmptyState title="لا يوجد لاعبين" description="لم يتم تسجيل أي لاعب بعد" />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {players.map(player => (
                    <div key={player.id} style={{ padding: '12px', backgroundColor: '#0A1628', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', backgroundColor: '#0D1E35', borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', border: '1px solid rgba(0, 220, 200, 0.12)' }}>⚽</div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#EEEFEE' }}>{player.name || 'لاعب'}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{player.user_id ? player.user_id.slice(0, 8) + '...' : '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ═══ Video Analysis Tab ═══ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* رفع فيديو */}
            <div style={cardStyle}>
              <h3 style={{
                fontFamily: "'Orbitron', sans-serif",
                color: '#00DCC8',
                fontSize: 16,
                marginTop: 0,
                marginBottom: 20,
              }}>
                تحليل فيديو جديد
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>عنوان التحليل *</label>
                  <input
                    style={inputStyle}
                    placeholder="مثال: تدريب الروضة - 10 يونيو"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label style={labelStyle}>ملف الفيديو *</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    style={{ ...inputStyle, padding: '10px 16px' }}
                  />
                  {file && (
                    <p style={{ color: '#00DCC8', fontFamily: "'Cairo', sans-serif", fontSize: 12, marginTop: 4 }}>
                      ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                  )}
                </div>

                {uploadError && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: '#EF4444',
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: 13,
                  }}>
                    {uploadError}
                  </div>
                )}

                {uploadResult && (
                  <div style={{
                    background: 'rgba(0,220,200,0.1)',
                    border: '1px solid rgba(0,220,200,0.3)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    color: '#00DCC8',
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: 13,
                  }}>
                    ✅ تم رفع الفيديو بنجاح — جارٍ التحليل (30-60 ثانية)
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploading || !file || !title}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    border: 'none',
                    background: (uploading || !file || !title) ? '#1a3a4a' : '#00DCC8',
                    color: (uploading || !file || !title) ? '#6B7280' : '#000A0F',
                    fontFamily: "'Cairo', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: (uploading || !file || !title) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? 'جارٍ الرفع...' : 'رفع وتحليل'}
                </button>
              </div>
            </div>

            {/* التحليلات السابقة */}
            <div style={cardStyle}>
              <h3 style={{
                fontFamily: "'Orbitron', sans-serif",
                color: '#EEEFEE',
                fontSize: 14,
                marginTop: 0,
                marginBottom: 16,
              }}>
                التحليلات السابقة
              </h3>

              {analyses.length === 0 ? (
                <p style={{ color: '#6B7280', fontFamily: "'Cairo', sans-serif", fontSize: 13 }}>
                  لا توجد تحليلات بعد
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {analyses.map(a => (
                    <div key={a.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{
                          margin: 0,
                          color: '#EEEFEE',
                          fontFamily: "'Cairo', sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                        }}>
                          {a.title}
                        </p>
                        {a.analysis_data?.intelligence?.dna?.primary_style && (
                          <p style={{
                            margin: '2px 0 0',
                            color: '#00DCC8',
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: 11,
                          }}>
                            {a.analysis_data.intelligence.dna.primary_style}
                          </p>
                        )}
                        {a.analysis_data?.activity_score != null && (
                          <p style={{
                            margin: '2px 0 0',
                            color: '#6B7280',
                            fontFamily: "'Cairo', sans-serif",
                            fontSize: 11,
                          }}>
                            نشاط: {a.analysis_data.activity_score}% — detections: {a.analysis_data.total_detections}
                          </p>
                        )}
                      </div>
                      <span style={{
                        color: statusColor(a.status),
                        fontFamily: "'Cairo', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {statusAr(a.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}