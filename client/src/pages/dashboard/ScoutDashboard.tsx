/**
 * ScoutDashboard - Scout tools for discovering players
 */
import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Star, MapPin, Filter, Heart, Eye, Video, TrendingUp } from 'lucide-react'

export default function ScoutDashboard() {
  const { isRTL } = useLanguage()
  const [favorites, setFavorites] = useState<number[]>([1, 3])

  const players = [
    { id: 1, name: isRTL ? 'أحمد صلاح' : 'Ahmed Salah', age: 19, position: isRTL ? 'مهاجم' : 'Forward', club: 'Al-Ittihad', rating: 9.2, region: 'Jeddah', videoUrl: '#' },
    { id: 2, name: isRTL ? 'محمد敬畏' : 'Mohammed Khaled', age: 21, position: isRTL ? 'وسط' : 'Midfielder', club: 'Al-Hilal', rating: 8.5, region: 'Riyadh', videoUrl: '#' },
    { id: 3, name: isRTL ? 'عبدالله أحمد' : 'Abdullah Ahmed', age: 18, position: isRTL ? 'مدافع' : 'Defender', club: 'Al-Nassr', rating: 8.8, region: 'Riyadh', videoUrl: '#' },
    { id: 4, name: isRTL ? 'فهد' : 'Fahad', age: 22, position: isRTL ? 'حارس' : 'Goalkeeper', club: 'Al-Ahli', rating: 8.1, region: 'Jeddah', videoUrl: '#' },
    { id: 5, name: isRTL ? 'يوسف' : 'Yousef', age: 20, position: isRTL ? 'وسط' : 'Midfielder', club: 'Al-Taawun', rating: 8.6, region: 'Abha', videoUrl: '#' },
  ]

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
            {isRTL ? 'لوحة الكشاف' : 'Scout Dashboard'}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            {isRTL ? 'اكتشف واعثر على أفضل المواهب' : 'Discover and find the best talents'}
          </p>
        </div>

        {/* Search & Filters */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #1F2937'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
              <input
                type="text"
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
            <select style={{
              padding: '12px 16px',
              backgroundColor: '#000A0F',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#9CA3AF',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif"
            }}>
              <option>{isRTL ? 'جميع المراكز' : 'All Positions'}</option>
              <option>{isRTL ? 'مهاجم' : 'Forward'}</option>
              <option>{isRTL ? 'وسط' : 'Midfielder'}</option>
              <option>{isRTL ? 'مدافع' : 'Defender'}</option>
              <option>{isRTL ? 'حارس' : 'Goalkeeper'}</option>
            </select>
            <select style={{
              padding: '12px 16px',
              backgroundColor: '#000A0F',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#9CA3AF',
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif"
            }}>
              <option>{isRTL ? 'جميع المناطق' : 'All Regions'}</option>
              <option>Riyadh</option>
              <option>Jeddah</option>
              <option>Dammam</option>
            </select>
          </div>
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
                textAlign: 'center'
              }}>
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
          <h2 style={{
            color: '#EEEFEE',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            {isRTL ? 'جميع اللاعبين' : 'All Players'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {players.map((player) => (
              <div key={player.id} style={{
                padding: '20px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                border: '1px solid #374151'
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
                  <button
                    onClick={() => toggleFavorite(player.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Heart
                      size={20}
                      color={favorites.includes(player.id) ? '#EF4444' : '#6B7280'}
                      fill={favorites.includes(player.id) ? '#EF4444' : 'none'}
                    />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: 'rgba(0,220,200,0.1)',
                    color: '#00DCC8',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {player.club}
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(139,92,246,0.1)',
                    color: '#8B5CF6',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <MapPin size={10} />
                    {player.region}
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(245,158,11,0.1)',
                    color: '#F59E0B',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    ⭐ {player.rating}
                  </span>
                </div>

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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
