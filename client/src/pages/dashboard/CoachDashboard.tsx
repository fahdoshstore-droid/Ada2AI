/**
 * CoachDashboard - Coach tools and player management
 */
import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, BarChart3, Video, Calendar, TrendingUp, Search, Plus, MessageSquare } from 'lucide-react'

export default function CoachDashboard() {
  const { isRTL } = useLanguage()
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)

  const players = [
    { id: 1, name: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed', age: 22, position: isRTL ? 'وسط' : 'Midfielder', status: 'active', performance: 85 },
    { id: 2, name: isRTL ? 'محمد عبدالله' : 'Mohammed Abdullah', age: 20, position: isRTL ? 'مدافع' : 'Defender', status: 'active', performance: 78 },
    { id: 3, name: isRTL ? 'عبدالله' : 'Abdullah', age: 24, position: isRTL ? 'مهاجم' : 'Forward', status: 'injured', performance: 92 },
    { id: 4, name: isRTL ? 'خالد' : 'Khaled', age: 21, position: isRTL ? 'حارس' : 'Goalkeeper', status: 'active', performance: 80 },
  ]

  const trainings = [
    { id: 1, title: isRTL ? 'تمارين اللياقة' : 'Fitness Training', date: '2026-04-15', time: '18:00', attendance: 18 },
    { id: 2, title: isRTL ? 'تمارين تكتيكية' : 'Tactical Drills', date: '2026-04-14', time: '19:00', attendance: 20 },
    { id: 3, title: isRTL ? 'مباراة ودية' : 'Friendly Match', date: '2026-04-13', time: '17:00', attendance: 22 },
  ]

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
            {isRTL ? 'لوحة المدرب' : 'Coach Dashboard'}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            {isRTL ? 'إدارة اللاعبين والتدريب' : 'Manage players and training'}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px',
            backgroundColor: '#0A0E1A',
            border: '1px solid #00DCC830',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0,220,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} color="#00DCC8" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'إضافة لاعب' : 'Add Player'}</div>
              <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'سجل لاعب جديد' : 'Register new player'}</div>
            </div>
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px',
            backgroundColor: '#0A0E1A',
            border: '1px solid #007ABA30',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0,122,186,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={24} color="#007ABA" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'جدول التدريب' : 'Training Schedule'}</div>
              <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'إدارة日程' : 'Manage schedule'}</div>
            </div>
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px',
            backgroundColor: '#0A0E1A',
            border: '1px solid #10B98130',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} color="#10B981" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'تقارير الأداء' : 'Performance Reports'}</div>
              <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'عرض الإحصائيات' : 'View analytics'}</div>
            </div>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Players List */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #1F2937'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'اللاعبين' : 'Players'}
              </h2>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                <input
                  type="text"
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  style={{
                    padding: '8px 12px',
                    paddingRight: '36px',
                    backgroundColor: '#000A0F',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#EEEFEE',
                    fontSize: '14px',
                    width: '160px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {players.map((player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  style={{
                    padding: '16px',
                    backgroundColor: selectedPlayer === player.id ? 'rgba(0,220,200,0.1)' : 'rgba(255,255,255,0.02)',
                    border: selectedPlayer === player.id ? '1px solid #00DCC8' : '1px solid transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#007ABA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {player.number}
                    </div>
                    <div>
                      <div style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '2px' }}>{player.name}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{player.position} • {player.age} {isRTL ? 'سنة' : 'years'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: player.status === 'active' ? '#10B981' : '#EF4444'
                    }} />
                    <div style={{
                      backgroundColor: player.performance >= 85 ? 'rgba(16,185,129,0.2)' : player.performance >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                      color: player.performance >= 85 ? '#10B981' : player.performance >= 75 ? '#F59E0B' : '#EF4444',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {player.performance}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Schedule */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #1F2937'
          }}>
            <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'جدول التدريب' : 'Training Schedule'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trainings.map((training) => (
                <div key={training.id} style={{
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '4px' }}>{training.title}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{training.date} • {training.time}</div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(0,220,200,0.1)',
                    color: '#00DCC8',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {training.attendance} {isRTL ? 'حاضر' : 'attending'}
                  </div>
                </div>
              ))}
            </div>

            <button style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#9CA3AF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Cairo', sans-serif"
            }}>
              <Plus size={16} />
              {isRTL ? 'إضافة تدريب جديد' : 'Add New Training'}
            </button>
          </div>
        </div>

        {/* Selected Player Detail */}
        {selectedPlayer && (
          <div style={{
            marginTop: '24px',
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #00DCC830'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                  {players.find(p => p.id === selectedPlayer)?.name}
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                  {isRTL ? 'تفاصيل اللاعب' : 'Player Details'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(0,122,186,0.1)',
                  border: '1px solid #007ABA',
                  borderRadius: '8px',
                  color: '#007ABA',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Cairo', sans-serif"
                }}>
                  <BarChart3 size={16} />
                  {isRTL ? 'التحليل' : 'Analysis'}
                </button>
                <button style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(0,220,200,0.1)',
                  border: '1px solid #00DCC8',
                  borderRadius: '8px',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Cairo', sans-serif"
                }}>
                  <MessageSquare size={16} />
                  {isRTL ? 'رسالة' : 'Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
