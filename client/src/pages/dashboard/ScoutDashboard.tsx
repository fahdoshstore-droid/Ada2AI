/**
 * ScoutDashboard - Scout tools for discovering players
 * Enhanced with: Advanced filters, Compare, Notifications, Notes, Reports
 */
import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Star, MapPin, Filter, Heart, Eye, Video, TrendingUp, Bell, X, Check, UserPlus, BarChart3, GitCompare, FileText, MessageSquare } from 'lucide-react'

interface Player {
  id: number
  name: string
  age: number
  position: string
  club: string
  rating: number
  region: string
  videoUrl: string
  stats?: {
    goals: number
    assists: number
    appearances: number
  }
  lastScouted?: string
}

export default function ScoutDashboard() {
  const { isRTL } = useLanguage()
  const [favorites, setFavorites] = useState<number[]>([1, 3])
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; time: string; read: boolean }>>([
    { id: 1, message: isRTL ? 'لاعب جديد: أحمد صلاح' : 'New player: Ahmed Salah', time: '2h ago', read: false },
    { id: 2, message: isRTL ? 'تحديث التصنيف: محمد خالد' : 'Rating updated: Mohammed Khaled', time: '5h ago', read: false },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareList, setCompareList] = useState<number[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [playerNotes, setPlayerNotes] = useState<Record<number, string>>({})

  const players: Player[] = [
    { id: 1, name: isRTL ? 'أحمد صلاح' : 'Ahmed Salah', age: 19, position: isRTL ? 'مهاجم' : 'Forward', club: 'Al-Ittihad', rating: 9.2, region: 'Jeddah', videoUrl: '#', stats: { goals: 12, assists: 5, appearances: 18 }, lastScouted: '2026-04-10' },
    { id: 2, name: isRTL ? 'محمد خالد' : 'Mohammed Khaled', age: 21, position: isRTL ? 'وسط' : 'Midfielder', club: 'Al-Hilal', rating: 8.5, region: 'Riyadh', videoUrl: '#', stats: { goals: 8, assists: 12, appearances: 22 }, lastScouted: '2026-04-08' },
    { id: 3, name: isRTL ? 'عبدالله أحمد' : 'Abdullah Ahmed', age: 18, position: isRTL ? 'مدافع' : 'Defender', club: 'Al-Nassr', rating: 8.8, region: 'Riyadh', videoUrl: '#', stats: { goals: 2, assists: 3, appearances: 20 }, lastScouted: '2026-04-12' },
    { id: 4, name: isRTL ? 'فهد' : 'Fahad', age: 22, position: isRTL ? 'حارس' : 'Goalkeeper', club: 'Al-Ahli', rating: 8.1, region: 'Jeddah', videoUrl: '#', stats: { goals: 0, assists: 0, appearances: 16 } },
    { id: 5, name: isRTL ? 'يوسف' : 'Yousef', age: 20, position: isRTL ? 'وسط' : 'Midfielder', club: 'Al-Taawun', rating: 8.6, region: 'Abha', videoUrl: '#', stats: { goals: 6, assists: 9, appearances: 19 }, lastScouted: '2026-04-05' },
    { id: 6, name: isRTL ? 'سالم' : 'Salem', age: 23, position: isRTL ? 'مدافع' : 'Defender', club: 'Al-Shabab', rating: 7.9, region: 'Riyadh', videoUrl: '#', stats: { goals: 1, assists: 2, appearances: 15 } },
  ]

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const toggleCompare = (id: number) => {
    setCompareList(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  const filteredPlayers = players.filter(player => {
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (positionFilter !== 'all' && player.position !== positionFilter) return false
    if (regionFilter !== 'all' && player.region !== regionFilter) return false
    if (player.rating < minRating) return false
    return true
  })

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
              {isRTL ? 'لوحة الكشاف' : 'Scout Dashboard'}
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              {isRTL ? 'اكتشف واعثر على أفضل المواهب' : 'Discover and find the best talents'}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCompareMode(!compareMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: compareMode ? '#00DCC8' : 'transparent',
                border: '1px solid #00DCC8',
                borderRadius: '8px',
                color: compareMode ? '#000A0F' : '#00DCC8',
                cursor: 'pointer',
                fontWeight: '600',
                fontFamily: "'Cairo', sans-serif",
                fontSize: '14px'
              }}
            >
              <GitCompare size={18} />
              {isRTL ? 'قارن' : 'Compare'}
              {compareList.length > 0 && (
                <span style={{ backgroundColor: compareMode ? '#000A0F' : '#00DCC8', color: compareMode ? '#00DCC8' : '#000A0F', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                  {compareList.length}
                </span>
              )}
            </button>
            
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '14px'
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
                  position: 'absolute',
                  top: '100%',
                  left: isRTL ? 'auto' : '0',
                  right: isRTL ? '0' : 'auto',
                  marginTop: '8px',
                  width: '320px',
                  backgroundColor: '#0A0E1A',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  padding: '16px',
                  zIndex: 100,
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
                      borderRadius: '8px',
                      marginBottom: '8px',
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

        {/* Compare Panel */}
        {compareMode && compareList.length >= 2 && (
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
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
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length + 1}, 1fr)`, gap: '12px' }}>
              <div />
              {compareList.map(id => {
                const p = players.find(pl => pl.id === id)
                return (
                  <div key={id} style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#007ABA', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                      {p?.name.charAt(0)}
                    </div>
                    <p style={{ color: '#EEEFEE', fontWeight: '600', fontSize: '14px' }}>{p?.name}</p>
                  </div>
                )
              })}
              {['rating', 'goals', 'assists', 'appearances'].map(stat => (
                <React.Fragment key={stat}>
                  <div style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center' }}>{stat}</div>
                  {compareList.map(id => {
                    const p = players.find(pl => pl.id === id)
                    const val = stat === 'rating' ? p?.rating : stat === 'goals' ? p?.stats?.goals : stat === 'assists' ? p?.stats?.assists : p?.stats?.appearances
                    return <div key={id} style={{ color: '#EEEFEE', fontWeight: '600', textAlign: 'center' }}>{val ?? '-'}</div>
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #1F2937'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRTL ? 'ابحث عن لاعب...' : 'Search for a player...'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '44px',
                  backgroundColor: '#000A0F',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#EEEFEE',
                  fontSize: '14px',
                  fontFamily: "'Cairo', sans-serif"
                }}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: showFilters ? 'rgba(0,220,200,0.1)' : 'transparent',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: showFilters ? '#00DCC8' : '#9CA3AF',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: "'Cairo', sans-serif"
              }}
            >
              <Filter size={18} />
              {isRTL ? 'تصفية' : 'Filters'}
            </button>
          </div>
          
          {showFilters && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#000A0F',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                <option value="all">{isRTL ? 'جميع المراكز' : 'All Positions'}</option>
                <option value={isRTL ? 'مهاجم' : 'Forward'}>{isRTL ? 'مهاجم' : 'Forward'}</option>
                <option value={isRTL ? 'وسط' : 'Midfielder'}>{isRTL ? 'وسط' : 'Midfielder'}</option>
                <option value={isRTL ? 'مدافع' : 'Defender'}>{isRTL ? 'مدافع' : 'Defender'}</option>
                <option value={isRTL ? 'حارس' : 'Goalkeeper'}>{isRTL ? 'حارس' : 'Goalkeeper'}</option>
              </select>
              
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#000A0F',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                <option value="all">{isRTL ? 'جميع المناطق' : 'All Regions'}</option>
                <option value="Riyadh">Riyadh</option>
                <option value="Jeddah">Jeddah</option>
                <option value="Abha">Abha</option>
              </select>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#9CA3AF', fontSize: '14px' }}>{isRTL ? 'الحد الأدنى للتقييم:' : 'Min Rating:'}</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  style={{ width: '100px' }}
                />
                <span style={{ color: '#00DCC8', fontWeight: '600', minWidth: '30px' }}>{minRating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Top Rated */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #F59E0B30'
        }}>
          <h2 style={{
            color: '#EEEFEE',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: "'Cairo', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={20} color="#F59E0B" />
            {isRTL ? 'الأعلى تقييماً' : 'Top Rated Players'}
          </h2>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {players.slice(0, 3).map((player) => (
              <div key={player.id} style={{
                minWidth: '200px',
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid #374151',
                textAlign: 'center',
                position: 'relative'
              }}>
                {compareMode && (
                  <button
                    onClick={() => toggleCompare(player.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <GitCompare size={16} color={compareList.includes(player.id) ? '#00DCC8' : '#6B7280'} />
                  </button>
                )}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#007ABA',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {player.name.split(' ')[0].charAt(0)}
                </div>
                <h3 style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '4px' }}>{player.name}</h3>
                <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>{player.position} • {player.age} {isRTL ? 'سنة' : 'yrs'}</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(245,158,11,0.2)',
                  color: '#F59E0B',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  <Star size={14} fill="#F59E0B" />
                  {player.rating}
                </div>
                {player.stats && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                    <span><BarChart3 size={12} /> {player.stats.goals}G</span>
                    <span><UserPlus size={12} /> {player.stats.assists}A</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #1F2937'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{
              color: '#EEEFEE',
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRTL ? 'جميع اللاعبين' : 'All Players'}
              <span style={{ color: '#6B7280', fontSize: '14px', marginRight: '8px' }}>
                ({filteredPlayers.length} {isRTL ? 'لاعب' : 'players'})
              </span>
            </h2>
            {selectedPlayers.length > 0 && (
              <button style={{
                padding: '8px 16px',
                backgroundColor: '#00DCC8',
                border: 'none',
                borderRadius: '6px',
                color: '#000A0F',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                fontFamily: "'Cairo', sans-serif"
              }}>
                {isRTL ? 'تصدير التقرير' : 'Export Report'}
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filteredPlayers.map((player) => (
              <div key={player.id} style={{
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: compareList.includes(player.id) ? '1px solid #00DCC8' : '1px solid #374151'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#007ABA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}>
                      {player.name.split(' ')[0].charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '2px' }}>{player.name}</h3>
                      <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{player.position}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {compareMode && (
                      <button onClick={() => toggleCompare(player.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <GitCompare size={18} color={compareList.includes(player.id) ? '#00DCC8' : '#6B7280'} />
                      </button>
                    )}
                    <button onClick={() => toggleFavorite(player.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                      <Heart size={20} color={favorites.includes(player.id) ? '#EF4444' : '#6B7280'} fill={favorites.includes(player.id) ? '#EF4444' : 'none'} />
                    </button>
                  </div>
                </div>

                {player.stats && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '12px' }}>
                    <span style={{ color: '#10B981' }}>{player.stats.goals} {isRTL ? 'هدف' : 'goals'}</span>
                    <span style={{ color: '#007ABA' }}>{player.stats.assists} {isRTL ? 'تمريرة' : 'assists'}</span>
                    <span style={{ color: '#9CA3AF' }}>{player.stats.appearances} {isRTL ? 'مباراة' : 'apps'}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: 'rgba(0,220,200,0.1)', color: '#00DCC8', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                    {player.club}
                  </span>
                  <span style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#8B5CF6', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={10} />
                    {player.region}
                  </span>
                  <span style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                    ⭐ {player.rating}
                  </span>
                </div>

                {/* Notes Section */}
                {playerNotes[player.id] && (
                  <div style={{
                    backgroundColor: 'rgba(139,92,246,0.1)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    border: '1px solid #8B5CF630'
                  }}>
                    <p style={{ color: '#9CA3AF', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={12} />
                      {isRTL ? 'ملاحظاتي:' : 'My notes:'}
                    </p>
                    <p style={{ color: '#EEEFEE', fontSize: '13px' }}>{playerNotes[player.id]}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'rgba(0,122,186,0.1)',
                    border: '1px solid #007ABA',
                    borderRadius: '6px',
                    color: '#007ABA',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: "'Cairo', sans-serif"
                  }}>
                    <Eye size={14} />
                    {isRTL ? 'عرض' : 'View'}
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'rgba(0,220,200,0.1)',
                    border: '1px solid #00DCC8',
                    borderRadius: '6px',
                    color: '#00DCC8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: "'Cairo', sans-serif"
                  }}>
                    <Video size={14} />
                    {isRTL ? 'فيديو' : 'Video'}
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt(isRTL ? 'أضف ملاحظة:' : 'Add a note:')
                      if (note) setPlayerNotes(prev => ({ ...prev, [player.id]: note }))
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: 'rgba(139,92,246,0.1)',
                      border: '1px solid #8B5CF6',
                      borderRadius: '6px',
                      color: '#8B5CF6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  >
                    <FileText size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
