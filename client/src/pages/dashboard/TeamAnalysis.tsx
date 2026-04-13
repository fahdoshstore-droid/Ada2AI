/**
 * TeamAnalysis - Analyze team/player performance
 */
import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { BarChart3, Users, TrendingUp, Target, Play, Filter, Download } from 'lucide-react'

export default function TeamAnalysis() {
  const { isRTL } = useLanguage()
  const [selectedMatch, setSelectedMatch] = useState('match_1')

  const matches = [
    { id: 'match_1', date: '2026-04-10', opponent: 'Al-Ittihad', score: '2-1', result: 'win' },
    { id: 'match_2', date: '2026-04-05', opponent: 'Al-Hilal', score: '1-1', result: 'draw' },
    { id: 'match_3', date: '2026-03-28', opponent: 'Al-Nassr', score: '0-2', result: 'loss' },
  ]

  const teamStats = [
    { label: isRTL ? ' possession' : 'Possession', home: '58%', away: '42%', color: '#00DCC8' },
    { label: isRTL ? 'التسديدات' : 'Shots', home: '12', away: '8', color: '#007ABA' },
    { label: isRTL ? 'التمريرات' : 'Passes', home: '485', away: '312', color: '#10B981' },
    { label: isRTL ? 'الأخطاء' : 'Fouls', home: '9', away: '14', color: '#F59E0B' },
    { label: isRTL ? 'الزوايا' : 'Corners', home: '6', away: '3', color: '#8B5CF6' },
  ]

  const playerStats = [
    { name: isRTL ? 'أحمد' : 'Ahmed', number: 10, position: 'MF', rating: 8.5, goals: 1, assists: 1 },
    { name: isRTL ? 'محمد' : 'Mohammed', number: 7, position: 'FW', rating: 7.8, goals: 1, assists: 0 },
    { name: isRTL ? 'عبدالله' : 'Abdullah', number: 4, position: 'DF', rating: 7.5, goals: 0, assists: 0 },
    { name: isRTL ? 'خالد' : 'Khaled', number: 1, position: 'GK', rating: 8.0, goals: 0, assists: 0 },
  ]

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
              {isRTL ? 'تحليل الفريق' : 'Team Analysis'}
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              {isRTL ? 'رؤية شاملة لأداء الفريق' : 'Comprehensive team performance view'}
            </p>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#00DCC8',
            color: '#000A0F',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif"
          }}>
            <Download size={18} />
            {isRTL ? 'تصدير التقرير' : 'Export Report'}
          </button>
        </div>

        {/* Match Selector */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #1F2937'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Filter size={18} color="#9CA3AF" />
            <span style={{ color: '#EEEFEE', fontWeight: '600' }}>
              {isRTL ? 'اختر المباراة' : 'Select Match'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match.id)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: selectedMatch === match.id ? 'rgba(0,220,200,0.1)' : 'transparent',
                  border: selectedMatch === match.id ? '2px solid #00DCC8' : '1px solid #374151',
                  borderRadius: '8px',
                  color: selectedMatch === match.id ? '#00DCC8' : '#9CA3AF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', color: '#EEEFEE' }}>{match.opponent}</div>
                  <div style={{ fontSize: '12px' }}>{match.date} • {match.score}</div>
                </div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: match.result === 'win' ? '#10B981' : match.result === 'draw' ? '#F59E0B' : '#EF4444'
                }} />
              </button>
            ))}
          </div>
        </div>

        {/* Team Stats */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #1F2937'
        }}>
          <h2 style={{
            color: '#EEEFEE',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            {isRTL ? 'إحصائيات المباراة' : 'Match Statistics'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teamStats.map((stat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>{stat.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    flex: parseInt(stat.home),
                    height: '24px',
                    backgroundColor: stat.color,
                    borderRadius: '4px 0 0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#000'
                  }}>
                    {stat.home}
                  </div>
                  <div style={{
                    flex: parseInt(stat.away),
                    height: '24px',
                    backgroundColor: '#374151',
                    borderRadius: '0 4px 4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#9CA3AF'
                  }}>
                    {stat.away}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Performance */}
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
            {isRTL ? 'أداء اللاعبين' : 'Player Performance'}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: '12px', textAlign: isRTL ? 'right' : 'left', color: '#9CA3AF', fontSize: '12px' }}>#</th>
                  <th style={{ padding: '12px', textAlign: isRTL ? 'right' : 'left', color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'اللاعب' : 'Player'}</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'مركز' : 'Pos'}</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'تقييم' : 'Rating'}</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'أهداف' : 'Goals'}</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'تمريرات حاسمة' : 'Assists'}</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((player, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1F2937' }}>
                    <td style={{ padding: '12px', color: '#9CA3AF' }}>{player.number}</td>
                    <td style={{ padding: '12px', color: '#EEEFEE', fontWeight: '600' }}>{player.name}</td>
                    <td style={{ padding: '12px', color: '#9CA3AF', textAlign: 'center' }}>{player.position}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: player.rating >= 8 ? 'rgba(16,185,129,0.2)' : player.rating >= 7 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                        color: player.rating >= 8 ? '#10B981' : player.rating >= 7 ? '#F59E0B' : '#EF4444',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {player.rating}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#10B981', textAlign: 'center', fontWeight: '600' }}>{player.goals}</td>
                    <td style={{ padding: '12px', color: '#007ABA', textAlign: 'center', fontWeight: '600' }}>{player.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
