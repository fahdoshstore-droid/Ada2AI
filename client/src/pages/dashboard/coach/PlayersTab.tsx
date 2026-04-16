/**
 * PlayersTab - Players list with quick actions
 */
import React from 'react'
import { Search, Plus, Edit3, Download } from 'lucide-react'
import type { Player, Evaluation } from './types'

interface PlayersTabProps {
  players: Player[]
  selectedPlayer: string | null
  setSelectedPlayer: (id: string | null) => void
  isRTL: boolean
  setShowTrainingModal: (show: boolean) => void
  setShowEvaluationModal: (show: boolean) => void
  evaluation: Evaluation
  setEvaluation: (eval_: Evaluation) => void
}

export default function PlayersTab({
  players,
  selectedPlayer,
  setSelectedPlayer,
  isRTL,
  setShowTrainingModal,
  setShowEvaluationModal,
  evaluation,
  setEvaluation,
}: PlayersTabProps) {
  return (
    <>
      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={() => { setShowTrainingModal(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
            backgroundColor: '#0A0E1A', border: '1px solid #00DCC830', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0,220,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={24} color="#00DCC8" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'إضافة تدريب' : 'Add Training'}</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'جدول جديد' : 'New session'}</div>
          </div>
        </button>

        <button
          onClick={() => { setShowEvaluationModal(true); setEvaluation({ ...evaluation, playerId: selectedPlayer || '' }) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
            backgroundColor: '#0A0E1A', border: '1px solid #10B98130', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit3 size={24} color="#10B981" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'تقييم لاعب' : 'Evaluate Player'}</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'تقرير أداء' : 'Performance report'}</div>
          </div>
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
          backgroundColor: '#0A0E1A', border: '1px solid #007ABA30', borderRadius: '12px',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0,122,186,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={24} color="#007ABA" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'تصدير التقرير' : 'Export Report'}</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'PDF/Excel' : 'PDF/Excel'}</div>
          </div>
        </button>
      </div>

      {/* Players List */}
      <div style={{
        backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? 'قائمة اللاعبين' : 'Players List'}
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
            <input type="text" placeholder={isRTL ? 'بحث...' : 'Search...'} style={{
              padding: '8px 12px', paddingRight: '36px', backgroundColor: '#000A0F',
              border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE', fontSize: '14px', width: '160px',
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {players.map((player) => (
            <div key={player.id} onClick={() => setSelectedPlayer(player.id)} style={{
              padding: '16px', backgroundColor: selectedPlayer === player.id ? 'rgba(0,220,200,0.1)' : 'rgba(255,255,255,0.02)',
              border: selectedPlayer === player.id ? '1px solid #00DCC8' : '1px solid transparent',
              borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007ABA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '14px',
                }}>
                  {player.number}
                </div>
                <div>
                  <div style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '2px' }}>{player.name}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{player.position} • {player.age} {isRTL ? 'سنة' : 'years'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: player.status === 'active' ? '#10B981' : '#EF4444' }} />
                <div style={{
                  backgroundColor: player.rating >= 85 ? 'rgba(16,185,129,0.2)' : player.rating >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                  color: player.rating >= 85 ? '#10B981' : player.rating >= 75 ? '#F59E0B' : '#EF4444',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                }}>
                  {player.rating}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}