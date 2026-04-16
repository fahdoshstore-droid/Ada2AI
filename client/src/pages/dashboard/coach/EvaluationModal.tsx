/**
 * EvaluationModal - Modal for player evaluation
 */
import React from 'react'
import { X } from 'lucide-react'
import type { Player, Evaluation } from './types'

interface EvaluationModalProps {
  show: boolean
  isRTL: boolean
  evaluation: Evaluation
  setEvaluation: (eval_: Evaluation) => void
  players: Player[]
  onClose: () => void
  onSubmit: () => void
}

export default function EvaluationModal({ show, isRTL, evaluation, setEvaluation, players, onClose, onSubmit }: EvaluationModalProps) {
  if (!show) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', border: '1px solid #374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600' }}>{isRTL ? 'تقييم اللاعب' : 'Player Evaluation'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'اللاعب' : 'Player'}</label>
            <select
              value={evaluation.playerId || ''}
              onChange={(e) => setEvaluation({ ...evaluation, playerId: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
            >
              <option value="">{isRTL ? 'اختر لاعب' : 'Select player'}</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {[
            { key: 'technical', label: isRTL ? 'تقني' : 'Technical', color: '#00DCC8' },
            { key: 'tactical', label: isRTL ? 'تكتيكي' : 'Tactical', color: '#007ABA' },
            { key: 'physical', label: isRTL ? 'بدني' : 'Physical', color: '#10B981' },
            { key: 'mental', label: isRTL ? 'ذهني' : 'Mental', color: '#F59E0B' },
          ].map(item => (
            <div key={item.key}>
              <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.label}</span>
                <span style={{ color: item.color }}>{evaluation[item.key as keyof typeof evaluation]}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={evaluation[item.key as keyof typeof evaluation] ?? 0}
                onChange={(e) => setEvaluation({ ...evaluation, [item.key]: Number(e.target.value) })}
                style={{ width: '100%', accentColor: item.color }}
              />
            </div>
          ))}
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'ملاحظات' : 'Notes'}</label>
            <textarea
              value={evaluation.notes}
              onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
              placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE', resize: 'vertical' }}
            />
          </div>
          <button
            onClick={onSubmit}
            disabled={!evaluation.playerId}
            style={{
              width: '100%', padding: '12px', backgroundColor: '#10B981', border: 'none', borderRadius: '8px',
              color: '#fff', fontWeight: '600', cursor: evaluation.playerId ? 'pointer' : 'not-allowed',
              opacity: evaluation.playerId ? 1 : 0.5,
            }}
          >
            {isRTL ? 'حفظ التقييم' : 'Save Evaluation'}
          </button>
        </div>
      </div>
    </div>
  )
}