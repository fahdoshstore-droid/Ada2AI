/**
 * TrainingTab - Training schedule and quick stats
 */
import React from 'react'
import { Plus } from 'lucide-react'
import type { Player, Training } from './types'

interface TrainingTabProps {
  trainings: Training[]
  players: Player[]
  isRTL: boolean
  setShowTrainingModal: (show: boolean) => void
  setSelectedTrainingForAttendance: (id: number | null) => void
}

export default function TrainingTab({
  trainings,
  players,
  isRTL,
  setShowTrainingModal,
  setSelectedTrainingForAttendance,
}: TrainingTabProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Training Schedule */}
      <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? 'جدول التدريب' : 'Training Schedule'}
          </h2>
          <button onClick={() => setShowTrainingModal(true)} style={{
            padding: '8px 16px', backgroundColor: 'rgba(0,220,200,0.1)', border: '1px solid #00DCC8',
            borderRadius: '8px', color: '#00DCC8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Cairo', sans-serif",
          }}>
            <Plus size={16} /> {isRTL ? 'جديد' : 'New'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {trainings.map((training) => (
            <div key={training.id} style={{
              padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <div style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '4px' }}>{training.title}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{training.date} • {training.time}</div>
                </div>
                <button
                  onClick={() => setSelectedTrainingForAttendance(training.id)}
                  style={{
                    padding: '6px 12px', backgroundColor: 'rgba(0,220,200,0.1)', border: '1px solid #00DCC8',
                    borderRadius: '6px', color: '#00DCC8', cursor: 'pointer', fontSize: '12px',
                  }}
                >
                  {isRTL ? 'الحضور' : 'Attendance'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  backgroundColor: 'rgba(0,220,200,0.1)', color: '#00DCC8', padding: '4px 8px',
                  borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                }}>
                  {training.attendance.length}/{training.maxAttendance} {isRTL ? 'حاضر' : 'attending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
        <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
          {isRTL ? 'إحصائيات سريعة' : 'Quick Stats'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(0,220,200,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#00DCC8', fontSize: '32px', fontWeight: 'bold' }}>{trainings.length}</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'تدريب هذا الأسبوع' : 'Trainings this week'}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#10B981', fontSize: '32px', fontWeight: 'bold' }}>
              {Math.round(trainings.reduce((sum, t) => sum + t.attendance.length, 0) / Math.max(trainings.length, 1))}
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'متوسط الحضور' : 'Avg Attendance'}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(0,122,186,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#007ABA', fontSize: '32px', fontWeight: 'bold' }}>{players.length}</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'لاعبين مسجلين' : 'Registered players'}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#F59E0B', fontSize: '32px', fontWeight: 'bold' }}>{players.filter(p => p.status === 'injured').length}</div>
            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'إصابات نشطة' : 'Active injuries'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}