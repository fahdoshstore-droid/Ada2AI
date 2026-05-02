/**
 * ScoutDashboard - Player Discovery System
 * STEP 1: Fetch from Supabase (profile_complete=true, is_public=true)
 * STEP 2: Compute score = (speed*0.25 + stamina*0.25 + technique*0.25 + rating*0.25)
 * STEP 3: Sort by score DESC
 * STEP 4: Filters (position, rating range, age range, name search)
 * STEP 5: Send Invite button (coach_players insert)
 */
import React, { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import BackButton from '@/components/BackButton'
import { supabase } from '@/lib/supabase'
import {
  Search, Star, MapPin, Filter, Heart, Eye, Video,
  TrendingUp, Bell, X, Check, UserPlus, BarChart3,
  GitCompare, FileText, MessageSquare, Send, ChevronDown,
  Loader2, AlertCircle, UserCheck
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Player {
  id: string
  name: string
  name_ar?: string
  age?: number
  position?: string
  sport?: string
  region?: string
  rating?: number   // 0-100
  speed?: number    // 0-100
  stamina?: number  // 0-100
  technique?: number // 0-100
  agility?: number  // 0-100
  club?: string
  academy_name?: string
  badge?: string
  badge_color?: string
  photo_url?: string
  video_url?: string
  is_public?: boolean
  profile_complete?: boolean
  score?: number
}

interface InviteState {
  [playerId: string]: 'idle' | 'sending' | 'sent' | 'error'
}

// ─── Score computation ─────────────────────────────────────────────────────────
function computeScore(p: Player): number {
  const speed = p.speed ?? 0
  const stamina = p.stamina ?? 0
  const technique = p.technique ?? 0
  const rating = p.rating ?? 0
  // Fallback: if all 0, use rating
  const total = speed + stamina + technique + rating
  if (total === 0) return rating
  return Math.round((speed * 0.25 + stamina * 0.25 + technique * 0.25 + rating * 0.25) * 10) / 10
}

// ─── Positions ─────────────────────────────────────────────────────────────────
const POSITIONS = ['all', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'CF']

export default function ScoutDashboard() {
  const { isRTL, lang } = useLanguage()

  // ─── State ──────────────────────────────────────────────────────────────────
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [minRating, setMinRating] = useState(0)
  const [maxRating, setMaxRating] = useState(100)
  const [minAge, setMinAge] = useState(10)
  const [maxAge, setMaxAge] = useState(40)
  const [showFilters, setShowFilters] = useState(false)

  // UI State
  const [favorites, setFavorites] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [compareList, setCompareList] = useState<string[]>([])
  const [playerNotes, setPlayerNotes] = useState<Record<string, string>>({})
  const [inviteState, setInviteState] = useState<InviteState>({})
  const [invitesSent, setInvitesSent] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; time: string; read: boolean }>>([
    { id: 1, message: isRTL ? 'لاعب جديد: أحمد صلاح' : 'New player: Ahmed Salah', time: '2h ago', read: false },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ─── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user)
    })
  }, [])

  // ─── STEP 1: Fetch Players ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('players')
        .select('*')
        .eq('profile_complete', true)
        .eq('is_public', true)
        .eq('is_active', true)

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      // Compute score
      const scored = (data || []).map((p: Player) => ({
        ...p,
        score: computeScore(p)
      }))

      // Sort by score
      scored.sort((a, b) => b.score - a.score)

      setPlayers(scored)
      setLoading(false)
    }

    fetchPlayers()
  }, [])

  // ─── STEP 4: Filters ─────────────────────────────────────────────────────────
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const name = lang === 'ar' && p.name_ar ? p.name_ar : (p.name || '')
      if (search && !name.toLowerCase().includes(search.toLowerCase())) return false
      if (positionFilter !== 'all' && p.position !== positionFilter) return false
      if (p.rating !== undefined && (p.rating < minRating || p.rating > maxRating)) return false
      if (p.age !== undefined && (p.age < minAge || p.age > maxAge)) return false
      return true
    })
  }, [players, search, positionFilter, minRating, maxRating, minAge, maxAge, lang])

  // ─── Actions ────────────────────────────────────────────────────────────────
  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const toggleCompare = (id: string) => {
    setCompareList(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) :
      prev.length < 3 ? [...prev, id] : prev
    )
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  // ─── STEP 5: Send Invite ────────────────────────────────────────────────────
  const sendInvite = async (playerId: string) => {
    if (!currentUser) {
      alert(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first')
      return
    }

    setInviteState(prev => ({ ...prev, [playerId]: 'sending' }))

    const { error: err } = await supabase
      .from('coach_players')
      .insert({
        coach_id: currentUser.id,
        player_id: playerId,
        status: 'pending'
      })

    if (err) {
      setInviteState(prev => ({ ...prev, [playerId]: 'error' }))
      setTimeout(() => setInviteState(prev => ({ ...prev, [playerId]: 'idle' })), 2000)
      return
    }

    setInviteState(prev => ({ ...prev, [playerId]: 'sent' }))
    setInvitesSent(prev => new Set([...prev, playerId]))
    setTimeout(() => setInviteState(prev => ({ ...prev, [playerId]: 'idle' })), 3000)
  }

  // ─── Compare panel ───────────────────────────────────────────────────────────
  const comparePlayers = compareList.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[]

  const getScore = (p: Player) => p.score ?? computeScore(p)

  const maxScore = comparePlayers.length > 0 ? Math.max(...comparePlayers.map(getScore)) : 0

  // ─── Stats ───────────────────────────────────────────────────────────────────
  const topPlayer = players[0]
  const avgScore = players.length > 0
    ? (players.reduce((s, p) => s + (p.score ?? 0), 0) / players.length).toFixed(1)
    : '0'

  // ─── Position label ──────────────────────────────────────────────────────────
  const positionLabels: Record<string, string> = {
    GK: isRTL ? 'حارس' : 'GK',
    CB: isRTL ? 'مدافع مركزي' : 'CB',
    LB: isRTL ? 'ظهير أيسر' : 'LB',
    RB: isRTL ? 'ظهير أيمن' : 'RB',
    CDM: isRTL ? 'وسط دفاعي' : 'CDM',
    CM: isRTL ? 'وسط' : 'CM',
    CAM: isRTL ? 'صانع ألعاب' : 'CAM',
    LW: isRTL ? 'جناح أيسر' : 'LW',
    RW: isRTL ? 'جناح أيمن' : 'RW',
    ST: isRTL ? 'مهاجم' : 'ST',
    CF: isRTL ? 'مهاجم مركزي' : 'CF',
    all: isRTL ? 'الكل' : 'All',
  }

  const getPositionLabel = (pos?: string) => pos ? (positionLabels[pos] ?? pos) : '—'

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div>
        <BackButton fallbackRoute="/dashboards" />

        {/* ─── Header ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px', color: '#9CA3AF' }}>
            <Loader2 size={24} style={{ animation: 'spin' }} />
            <span style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : 'inherit' }}>
              {isRTL ? 'جاري التحميل...' : 'Loading players...'}
            </span>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', gap: '12px', color: '#EF4444' }}>
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        ) : (
          <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
              {isRTL ? 'اكتشف اللاعبين' : 'Discover Players'}
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              {isRTL ? 'ابحث عن أفضل المواهب وأرسل دعوات الانضمام' : 'Find the best talents and send team invitations'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Stats pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: 'rgba(0,220,200,0.08)',
              border: '1px solid rgba(0,220,200,0.2)', borderRadius: '8px',
            }}>
              <TrendingUp size={16} color="#00DCC8" />
              <span style={{ color: '#00DCC8', fontWeight: '600', fontSize: '14px' }}>
                {filteredPlayers.length} {isRTL ? 'لاعب' : 'players'}
              </span>
            </div>

            <button
              onClick={() => setCompareMode(!compareMode)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px',
                backgroundColor: compareMode ? '#00DCC8' : 'transparent',
                border: '1px solid #00DCC8', borderRadius: '8px',
                color: compareMode ? '#000A0F' : '#00DCC8',
                cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              <GitCompare size={18} />
              {isRTL ? 'قارن' : 'Compare'}
              {compareList.length > 0 && (
                <span style={{
                  backgroundColor: compareMode ? '#000A0F' : '#00DCC8',
                  color: compareMode ? '#00DCC8' : '#000A0F',
                  padding: '2px 8px', borderRadius: '10px', fontSize: '12px'
                }}>
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #374151', borderRadius: '8px',
                  color: '#9CA3AF', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                }}
              >
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span style={{ backgroundColor: '#EF4444', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '11px' }}>
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '100%', left: isRTL ? 'auto' : '0',
                  right: isRTL ? '0' : 'auto', marginTop: '8px',
                  width: '320px', backgroundColor: '#0A0E1A',
                  border: '1px solid #374151', borderRadius: '12px',
                  padding: '16px', zIndex: 100,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'الإشعارات' : 'Notifications'}</h3>
                    <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <X size={18} color="#6B7280" />
                    </button>
                  </div>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{
                      padding: '12px',
                      backgroundColor: notif.read ? 'transparent' : 'rgba(0,220,200,0.05)',
                      borderRadius: '8px', marginBottom: '8px',
                      border: '1px solid',
                      borderColor: notif.read ? 'transparent' : '#00DCC830'
                    }}>
                      <p style={{ color: '#EEEFEE', fontSize: '14px', marginBottom: '4px' }}>{notif.message}</p>
                      <p style={{ color: '#6B7280', fontSize: '12px' }}>{notif.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Stats Row ─────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(0,220,200,0.06)', border: '1px solid rgba(0,220,200,0.15)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ color: '#00DCC8', marginBottom: '4px' }}><Star size={18} /></div>
            <div style={{ color: '#EEEFEE', fontSize: '24px', fontWeight: 'bold', fontFamily: "'Orbitron', sans-serif" }}>
              {players.length}
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'إجمالي اللاعبين' : 'Total Players'}
            </div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ color: '#F59E0B', marginBottom: '4px' }}><TrendingUp size={18} /></div>
            <div style={{ color: '#EEEFEE', fontSize: '24px', fontWeight: 'bold', fontFamily: "'Orbitron', sans-serif" }}>
              {topPlayer ? getScore(topPlayer).toFixed(1) : '—'}
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'أعلى نتيجة' : 'Top Score'}
            </div>
          </div>
          <div style={{ background: 'rgba(0,122,186,0.06)', border: '1px solid rgba(0,122,186,0.15)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ color: '#007ABA', marginBottom: '4px' }}><BarChart3 size={18} /></div>
            <div style={{ color: '#EEEFEE', fontSize: '24px', fontWeight: 'bold', fontFamily: "'Orbitron', sans-serif" }}>
              {avgScore}
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'متوسط النتائج' : 'Avg Score'}
            </div>
          </div>
          <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ color: '#8B5CF6', marginBottom: '4px' }}><UserCheck size={18} /></div>
            <div style={{ color: '#EEEFEE', fontSize: '24px', fontWeight: 'bold', fontFamily: "'Orbitron', sans-serif" }}>
              {invitesSent.size}
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'الدعوات المرسلة' : 'Invites Sent'}
            </div>
          </div>
        </div>

        {/* ─── Compare Panel ──────────────────────────────────────────────── */}
        {compareMode && comparePlayers.length >= 2 && (
          <div style={{
            backgroundColor: '#0A0E1A', borderRadius: '12px',
            padding: '20px', marginBottom: '24px',
            border: '1px solid #00DCC830'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#EEEFEE', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCompare size={20} color="#00DCC8" />
                {isRTL ? 'مقارنة اللاعبين' : 'Compare Players'}
              </h3>
              <button onClick={() => { setCompareMode(false); setCompareList([]) }} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280'
              }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparePlayers.length + 1}, 1fr)`, gap: '12px', overflowX: 'auto' }}>
              <div />
              {comparePlayers.map(p => (
                <div key={p.id} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: p.badge_color ? `linear-gradient(135deg, ${p.badge_color}, #007ABA)` : '#007ABA',
                    margin: '0 auto 8px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#fff'
                  }}>
                    {(p.name || 'P').charAt(0)}
                  </div>
                  <p style={{ color: '#EEEFEE', fontWeight: '600', fontSize: '13px' }}>
                    {lang === 'ar' && p.name_ar ? p.name_ar : p.name}
                  </p>
                  <p style={{ color: '#6B7280', fontSize: '11px' }}>{getPositionLabel(p.position)}</p>
                </div>
              ))}
              {(['score', 'rating', 'speed', 'stamina', 'technique'] as const).map(stat => {
                const statLabel = stat === 'score' ? (isRTL ? 'النتيجة' : 'Score') :
                  stat === 'rating' ? (isRTL ? 'التقييم' : 'Rating') :
                  stat === 'speed' ? (isRTL ? 'السرعة' : 'Speed') :
                  stat === 'stamina' ? (isRTL ? 'التحمل' : 'Stamina') :
                  (isRTL ? 'التقنية' : 'Technique')
                const statMax = stat === 'score' ? maxScore : 100
                const allVals = comparePlayers.map(cp => {
                  if (stat === 'score') return getScore(cp)
                  if (stat === 'rating') return cp.rating
                  if (stat === 'speed') return cp.speed
                  if (stat === 'stamina') return cp.stamina
                  return cp.technique
                })
                const maxVal = Math.max(...allVals.filter((v): v is number => v !== undefined))
                return (
                  <div key={stat} style={{ display: 'contents' }}>
                    <div style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                      {statLabel}
                    </div>
                    {comparePlayers.map(p => {
                      const val = stat === 'score' ? getScore(p) :
                        stat === 'rating' ? p.rating :
                        stat === 'speed' ? p.speed :
                        stat === 'stamina' ? p.stamina :
                        p.technique
                      const isMax = val !== undefined && val === maxVal && comparePlayers.length > 1
                      return (
                        <div key={p.id} style={{ textAlign: 'center' }}>
                          <div style={{
                            color: isMax ? '#00DCC8' : '#EEEFEE',
                            fontWeight: '700', fontSize: '15px',
                            fontFamily: "'Orbitron', sans-serif"
                          }}>
                            {val ?? '-'}
                          </div>
                          {val !== undefined && (
                            <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '4px auto 0' }}>
                              <div style={{
                                width: `${Math.min((val / statMax) * 100, 100)}%`,
                                height: '100%', borderRadius: '2px',
                                background: isMax ? '#00DCC8' : '#007ABA'
                              }} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── Search & Filters ──────────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#0A0E1A', borderRadius: '12px',
          padding: '20px', marginBottom: '24px', border: '1px solid #1F2937'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? 'ابحث عن لاعب بالاسم...' : 'Search players by name...'}
                style={{
                  width: '100%', padding: '12px 16px', paddingRight: '44px',
                  backgroundColor: '#000A0F', border: '1px solid #374151',
                  borderRadius: '8px', color: '#EEEFEE', fontSize: '14px',
                  fontFamily: "'Cairo', sans-serif", outline: 'none',
                }}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 16px',
                backgroundColor: showFilters ? 'rgba(0,220,200,0.1)' : 'transparent',
                border: '1px solid #374151', borderRadius: '8px',
                color: showFilters ? '#00DCC8' : '#9CA3AF',
                cursor: 'pointer', fontSize: '14px',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              <Filter size={18} />
              {isRTL ? 'تصفية' : 'Filters'}
            </button>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              {/* Position */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '6px', display: 'block', fontFamily: "'Cairo', sans-serif" }}>
                  {isRTL ? 'المركز' : 'Position'}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    style={{
                      padding: '10px 36px 10px 14px',
                      backgroundColor: '#000A0F', border: '1px solid #374151',
                      borderRadius: '8px', color: '#EEEFEE', fontSize: '13px',
                      cursor: 'pointer', fontFamily: "'Cairo', sans-serif",
                      appearance: 'none',
                    }}
                  >
                    {POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{getPositionLabel(pos)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Rating Range */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '6px', display: 'block', fontFamily: "'Cairo', sans-serif" }}>
                  {isRTL ? 'التقييم: ${minRating} - ${maxRating}' : `Rating: ${minRating} - ${maxRating}`}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ color: '#00DCC8', fontWeight: '600', fontSize: '13px', minWidth: '28px' }}>{minRating}</span>
                  <span style={{ color: '#6B7280' }}>–</span>
                  <span style={{ color: '#00DCC8', fontWeight: '600', fontSize: '13px', minWidth: '28px' }}>{maxRating}</span>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={maxRating}
                    onChange={(e) => setMaxRating(Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                </div>
              </div>

              {/* Age Range */}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '6px', display: 'block', fontFamily: "'Cairo', sans-serif" }}>
                  {isRTL ? 'العمر: ${minAge} - ${maxAge}' : `Age: ${minAge} - ${maxAge}`}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range" min="10" max="40" step="1"
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                  <span style={{ color: '#00DCC8', fontWeight: '600', fontSize: '13px', minWidth: '24px' }}>{minAge}</span>
                  <span style={{ color: '#6B7280' }}>–</span>
                  <span style={{ color: '#00DCC8', fontWeight: '600', fontSize: '13px', minWidth: '24px' }}>{maxAge}</span>
                  <input
                    type="range" min="10" max="40" step="1"
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                    style={{ width: '80px' }}
                  />
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setPositionFilter('all'); setMinRating(0); setMaxRating(100)
                  setMinAge(10); setMaxAge(40); setSearch('')
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px', color: '#EF4444',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  fontFamily: "'Cairo', sans-serif", alignSelf: 'flex-end',
                }}
              >
                {isRTL ? 'إعادة تعيين' : 'Reset'}
              </button>
            </div>
          )}
        </div>

        {/* ─── Players Grid ──────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#0A0E1A', borderRadius: '12px',
          padding: '24px', border: '1px solid #1F2937'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'النتائج' : 'Results'}
              <span style={{ color: '#6B7280', fontSize: '14px', marginRight: '8px' }}>
                ({filteredPlayers.length} {isRTL ? 'لاعب' : 'players'})
              </span>
            </h2>
            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', color: '#9CA3AF',
                cursor: 'pointer', fontSize: '13px',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              <TrendingUp size={14} />
              {isRTL ? 'النتيجة' : 'Score'}
              <ChevronDown size={14} style={{ transform: sortDir === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>

          {filteredPlayers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7280' }}>
              <UserPlus size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <p style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'لا يوجد لاعبين بهذه المعايير' : 'No players match your criteria'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {filteredPlayers.map((player) => {
                const score = getScore(player)
                const isFav = favorites.includes(player.id)
                const isCompare = compareList.includes(player.id)
                const invState = inviteState[player.id] || 'idle'
                const isInvited = invitesSent.has(player.id)
                const playerName = lang === 'ar' && player.name_ar ? player.name_ar : (player.name || '—')
                const badgeColor = player.badge_color || '#00DCC8'

                return (
                  <div key={player.id} style={{
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: `1px solid ${isCompare ? '#00DCC8' : '#374151'}`,
                    transition: 'border-color 0.2s',
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '50%',
                          background: `linear-gradient(135deg, ${badgeColor}, #007ABA)`,
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#fff',
                          flexShrink: 0,
                        }}>
                          {(player.name || 'P').charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '2px', fontSize: '15px' }}>
                            {playerName}
                          </h3>
                          <p style={{ color: '#9CA3AF', fontSize: '12px' }}>
                            {getPositionLabel(player.position)} · {player.age || '?'} {isRTL ? 'سنة' : 'yrs'}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {compareMode && (
                          <button onClick={() => toggleCompare(player.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                            <GitCompare size={18} color={isCompare ? '#00DCC8' : '#6B7280'} />
                          </button>
                        )}
                        <button onClick={() => toggleFavorite(player.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Heart size={20} color={isFav ? '#EF4444' : '#6B7280'} fill={isFav ? '#EF4444' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {player.academy_name && (
                        <span style={{
                          backgroundColor: `${badgeColor}15`, color: badgeColor,
                          padding: '4px 8px', borderRadius: '4px',
                          fontSize: '11px', fontWeight: '600',
                          border: `1px solid ${badgeColor}30`,
                        }}>
                          {player.academy_name}
                        </span>
                      )}
                      {player.region && (
                        <span style={{
                          backgroundColor: 'rgba(139,92,246,0.1)', color: '#8B5CF6',
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                          <MapPin size={10} />
                          {player.region}
                        </span>
                      )}
                      {player.badge && (
                        <span style={{
                          backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                        }}>
                          {player.badge}
                        </span>
                      )}
                    </div>

                    {/* Score bar */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: "'Cairo', sans-serif" }}>
                          {isRTL ? 'النتيجة' : 'Score'}
                        </span>
                        <span style={{
                          color: '#EEEFEE', fontWeight: '700', fontSize: '18px',
                          fontFamily: "'Orbitron', sans-serif",
                          color: score >= 80 ? '#00DCC8' : score >= 60 ? '#F59E0B' : '#9CA3AF'
                        }}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(score, 100)}%`,
                          height: '100%', borderRadius: '3px',
                          background: score >= 80 ? 'linear-gradient(90deg, #00DCC8, #007ABA)' :
                            score >= 60 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' :
                            'linear-gradient(90deg, #6B7280, #374151)',
                          transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>

                    {/* Attribute pills */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      {[
                        { label: isRTL ? 'ت' : 'SPD', val: player.speed, color: '#00DCC8' },
                        { label: isRTL ? 'ت' : 'STA', val: player.stamina, color: '#F59E0B' },
                        { label: isRTL ? 'ت' : 'TEC', val: player.technique, color: '#007ABA' },
                        { label: isRTL ? 'ت' : 'RAT', val: player.rating, color: '#8B5CF6' },
                      ].filter(attr => attr.val !== undefined).map(attr => (
                        <div key={attr.label} style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: `${attr.color}10`, border: `1px solid ${attr.color}25`,
                          borderRadius: '6px', padding: '4px 8px',
                        }}>
                          <span style={{ color: attr.color, fontSize: '10px', fontWeight: '700' }}>{attr.label}</span>
                          <span style={{ color: '#EEEFEE', fontSize: '12px', fontWeight: '600' }}>{attr.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    {playerNotes[player.id] && (
                      <div style={{
                        backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: '6px',
                        padding: '8px 12px', marginBottom: '12px',
                        border: '1px solid #8B5CF630'
                      }}>
                        <p style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <MessageSquare size={12} />
                          {isRTL ? 'ملاحظاتي:' : 'My notes:'}
                        </p>
                        <p style={{ color: '#EEEFEE', fontSize: '13px' }}>{playerNotes[player.id]}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          const note = prompt(isRTL ? 'أضف ملاحظة:' : 'Add a note:')
                          if (note !== null) setPlayerNotes(prev => ({ ...prev, [player.id]: note || '' }))
                        }}
                        style={{
                          padding: '9px',
                          backgroundColor: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.3)',
                          borderRadius: '6px', color: '#8B5CF6',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                        title={isRTL ? 'ملاحظة' : 'Note'}
                      >
                        <FileText size={14} />
                      </button>
                      <button
                        onClick={() => {/* view profile */}}
                        style={{
                          flex: 1, padding: '9px',
                          backgroundColor: 'rgba(0,122,186,0.1)',
                          border: '1px solid rgba(0,122,186,0.3)',
                          borderRadius: '6px', color: '#007ABA',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: '600',
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        <Eye size={14} />
                        {isRTL ? 'عرض' : 'View'}
                      </button>

                      {/* ─── INVITE BUTTON ─────────────────────────────────────── */}
                      <button
                        onClick={() => sendInvite(player.id)}
                        disabled={invState === 'sending' || isInvited}
                        style={{
                          flex: 1, padding: '9px',
                          backgroundColor: isInvited ? 'rgba(16,185,129,0.15)' :
                            invState === 'error' ? 'rgba(239,68,68,0.15)' :
                            invState === 'sent' ? 'rgba(16,185,129,0.15)' :
                            'rgba(0,220,200,0.1)',
                          border: `1px solid ${isInvited ? 'rgba(16,185,129,0.4)' :
                            invState === 'error' ? 'rgba(239,68,68,0.4)' :
                            invState === 'sent' ? 'rgba(16,185,129,0.4)' :
                            'rgba(0,220,200,0.3)'}`,
                          borderRadius: '6px',
                          color: isInvited ? '#10B981' :
                            invState === 'error' ? '#EF4444' :
                            invState === 'sent' ? '#10B981' :
                            '#00DCC8',
                          cursor: invState === 'sending' || isInvited ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: '600',
                          fontFamily: "'Cairo', sans-serif",
                          transition: 'all 0.2s',
                        }}
                      >
                        {invState === 'sending' ? (
                          <Loader2 size={14} style={{ animation: 'spin' }} />
                        ) : invState === 'sent' || isInvited ? (
                          <Check size={14} />
                        ) : (
                          <Send size={14} />
                        )}
                        {invState === 'sending' ? (isRTL ? 'جاري الإرسال...' : 'Sending...') :
                          invState === 'sent' ? (isRTL ? 'تم الإرسال!' : 'Sent!') :
                          invState === 'error' ? (isRTL ? 'خطأ!' : 'Error!') :
                          isInvited ? (isRTL ? 'تم الدعوة' : 'Invited') :
                          (isRTL ? 'إرسال دعوة' : 'Send Invite')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── CSS Animation ────────────────────────────────────────────── */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
