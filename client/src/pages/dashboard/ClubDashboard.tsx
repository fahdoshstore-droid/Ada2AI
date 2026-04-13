/**
 * ClubDashboard - Club management dashboard
 */
import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Building2, Users, Trophy, TrendingUp, BarChart3, Calendar, Video, Settings, Plus } from 'lucide-react'

export default function ClubDashboard() {
  const { isRTL } = useLanguage()

  const stats = [
    { icon: <Users size={24} />, label: isRTL ? 'اللاعبين' : 'Players', value: '24', color: '#00DCC8' },
    { icon: <Trophy size={24} />, label: isRTL ? 'البطولات' : 'Championships', value: '3', color: '#F59E0B' },
    { icon: <TrendingUp size={24} />, label: isRTL ? 'المركز' : 'Rank', value: '#2', color: '#10B981' },
    { icon: <BarChart3 size={24} />, label: isRTL ? 'المباريات' : 'Matches', value: '18', color: '#007ABA' },
  ]

  const squad = [
    { id: 1, name: isRTL ? 'أحمد' : 'Ahmed', number: 10, position: 'MF', status: 'fit' },
    { id: 2, name: isRTL ? 'محمد' : 'Mohammed', number: 7, position: 'FW', status: 'fit' },
    { id: 3, name: isRTL ? 'عبدالله' : 'Abdullah', number: 4, position: 'DF', status: 'injured' },
    { id: 4, name: isRTL ? 'خالد' : 'Khaled', number: 1, position: 'GK', status: 'fit' },
    { id: 5, name: isRTL ? 'سعود' : 'Saud', number: 8, position: 'MF', status: 'fit' },
  ]

  const matches = [
    { date: '2026-04-20', opponent: 'Al-Hilal', type: isRTL ? 'دوري' : 'League', time: '20:00' },
    { date: '2026-04-15', opponent: 'Al-Ittihad', type: isRTL ? 'كأس' : 'Cup', time: '19:00' },
    { date: '2026-04-10', opponent: 'Al-Nassr', type: isRTL ? 'دوري' : 'League', time: '20:00' },
  ]

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
            {isRTL ? 'نادي الوحدة' : 'Al-Wehda Club'}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            {isRTL ? 'إدارة الفريق والأنشطة' : 'Manage team and activities'}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${stat.color}30`
            }}>
              <div style={{ color: stat.color, marginBottom: '12px' }}>{stat.icon}</div>
              <h3 style={{
                color: '#EEEFEE',
                fontSize: '32px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
                marginBottom: '4px'
              }}>
                {stat.value}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Squad */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #1F2937'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'قائمة اللاعبين' : 'Squad'}
              </h2>
              <button style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(0,220,200,0.1)',
                border: '1px solid #00DCC8',
                borderRadius: '6px',
                color: '#00DCC8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontFamily: "'Cairo', sans-serif"
              }}>
                <Plus size={14} />
                {isRTL ? 'إضافة' : 'Add'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {squad.map((player) => (
                <div key={player.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#007ABA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '12px'
                    }}>
                      {player.number}
                    </div>
                    <div>
                      <div style={{ color: '#EEEFEE', fontWeight: '600', fontSize: '14px' }}>{player.name}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{player.position}</div>
                    </div>
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: player.status === 'fit' ? '#10B981' : '#EF4444'
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #1F2937'
          }}>
            <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'المباريات القادمة' : 'Upcoming Matches'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matches.map((match, i) => (
                <div key={i} style={{
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '4px' }}>
                      <span style={{ color: '#00DCC8' }}>vs</span> {match.opponent}
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{match.type} • {match.time}</div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(0,122,186,0.1)',
                    color: '#007ABA',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {match.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <button style={{
            padding: '20px',
            backgroundColor: '#0A0E1A',
            border: '1px solid #1F2937',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            <Video size={24} color="#007ABA" />
            <span style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'تحليل المباريات' : 'Match Analysis'}</span>
          </button>
          <button style={{
            padding: '20px',
            backgroundColor: '#0A0E1A',
            border: '1px solid #1F2937',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            <Users size={24} color="#10B981" />
            <span style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'إدارة الكشافة' : 'Scout Management'}</span>
          </button>
          <button style={{
            padding: '20px',
            backgroundColor: '#0A0E1A',
            border: '1px solid #1F2937',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            <Settings size={24} color="#9CA3AF" />
            <span style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'إعدادات النادي' : 'Club Settings'}</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
