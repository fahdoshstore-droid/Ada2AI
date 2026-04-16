/**
 * PlayerDetailPanel - Selected player detail panel
 */
import React from 'react'
import { BarChart3, Edit3, MessageSquare } from 'lucide-react'
import type { Player, Evaluation } from './types'

interface PlayerDetailPanelProps {
  selectedPlayer: string | null
  players: Player[]
  isRTL: boolean
  setShowEvaluationModal: (show: boolean) => void
  evaluation: Evaluation
  setEvaluation: (eval_: Evaluation) => void
}

export default function PlayerDetailPanel({
  selectedPlayer,
  players,
  isRTL,
  setShowEvaluationModal,
  evaluation,
  setEvaluation,
}: PlayerDetailPanelProps) {
  if (!selectedPlayer) return null

  return (
    <div style={{
      marginTop: '24px', backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #00DCC830',
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
            padding: '10px 16px', backgroundColor: 'rgba(0,122,186,0.1)', border: '1px solid #007ABA',
            borderRadius: '8px', color: '#007ABA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Cairo', sans-serif",
          }}>
            <BarChart3 size={16} /> {isRTL ? 'التحليل' : 'Analysis'}
          </button>
          <button
            onClick={() => { setShowEvaluationModal(true); setEvaluation({ ...evaluation, playerId: selectedPlayer || '' }) }}
            style={{
              padding: '10px 16px', backgroundColor: 'rgba(0,220,200,0.1)', border: '1px solid #00DCC8',
              borderRadius: '8px', color: '#00DCC8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            <Edit3 size={16} /> {isRTL ? 'تقييم' : 'Evaluate'}
          </button>
          <button style={{
            padding: '10px 16px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981',
            borderRadius: '8px', color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Cairo', sans-serif",
          }}>
            <MessageSquare size={16} /> {isRTL ? 'رسالة' : 'Message'}
          </button>
        </div>
      </div>
    </div>
  )
}