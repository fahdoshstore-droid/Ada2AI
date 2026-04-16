/**
 * AttendanceModal - Modal for taking attendance for a training session
 */
import React from 'react'
import { X, Check } from 'lucide-react'
import type { Player, Training } from './types'

interface AttendanceModalProps {
  selectedTrainingForAttendance: number | null
  players: Player[]
  trainings: Training[]
  isRTL: boolean
  onClose: () => void
  toggleAttendance: (trainingId: number, playerId: string | number) => void
}

export default function AttendanceModal({
  selectedTrainingForAttendance,
  players,
  trainings,
  isRTL,
  onClose,
  toggleAttendance,
}: AttendanceModalProps) {
  if (!selectedTrainingForAttendance) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', border: '1px solid #374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600' }}>{isRTL ? 'تسجيل الحضور' : 'Take Attendance'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {players.map(player => {
            const training = trainings.find(t => t.id === selectedTrainingForAttendance)
            const isAttending = training?.attendance.map(String).includes(player.id)
            return (
              <div key={player.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px',
                backgroundColor: isAttending ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                borderRadius: '8px', cursor: 'pointer', border: isAttending ? '1px solid #10B981' : '1px solid #EF4444',
              }}
                onClick={() => toggleAttendance(selectedTrainingForAttendance, Number(player.id))}
              >
                <div style={{ color: '#EEEFEE', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#007ABA',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '12px',
                  }}>
                    {player.number}
                  </div>
                  <span>{player.name}</span>
                </div>
                {isAttending ? (
                  <Check size={20} color="#10B981" />
                ) : (
                  <X size={20} color="#EF4444" />
                )}
              </div>
            )
          })}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: '16px', padding: '12px', backgroundColor: '#374151', border: 'none',
            borderRadius: '8px', color: '#EEEFEE', fontWeight: '600', cursor: 'pointer',
          }}
        >
          {isRTL ? 'تم' : 'Done'}
        </button>
      </div>
    </div>
  )
}