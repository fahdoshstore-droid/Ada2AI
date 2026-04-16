/**
 * TrainingModal - Modal for adding new training sessions
 */
import React from 'react'
import { X } from 'lucide-react'
import type { NewTraining } from './types'

interface TrainingModalProps {
  show: boolean
  isRTL: boolean
  newTraining: NewTraining
  setNewTraining: (training: NewTraining) => void
  onClose: () => void
  onSubmit: () => void
}

export default function TrainingModal({ show, isRTL, newTraining, setNewTraining, onClose, onSubmit }: TrainingModalProps) {
  if (!show) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', border: '1px solid #374151' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600' }}>{isRTL ? 'إضافة تدريب جديد' : 'Add New Training'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
            <input
              type="text"
              value={newTraining.title}
              onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
              placeholder={isRTL ? 'مثال: تمارين لياقة' : 'e.g., Fitness Training'}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
            />
          </div>
          <div>
            <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
            <input
              type="text"
              value={newTraining.titleEn}
              onChange={(e) => setNewTraining({ ...newTraining, titleEn: e.target.value })}
              placeholder={isRTL ? 'مثال: Fitness Training' : 'e.g., Fitness Training'}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374141', borderRadius: '6px', color: '#EEEFEE' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'التاريخ' : 'Date'}</label>
              <input
                type="date"
                value={newTraining.date}
                onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
              />
            </div>
            <div>
              <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'الوقت' : 'Time'}</label>
              <input
                type="time"
                value={newTraining.time}
                onChange={(e) => setNewTraining({ ...newTraining, time: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
              />
            </div>
          </div>
          <button
            onClick={onSubmit}
            disabled={!newTraining.title || !newTraining.date || !newTraining.time}
            style={{
              width: '100%', padding: '12px', backgroundColor: '#00DCC8', border: 'none', borderRadius: '8px',
              color: '#000', fontWeight: '600', cursor: newTraining.title && newTraining.date && newTraining.time ? 'pointer' : 'not-allowed',
              opacity: newTraining.title && newTraining.date && newTraining.time ? 1 : 0.5,
            }}
          >
            {isRTL ? 'إضافة' : 'Add Training'}
          </button>
        </div>
      </div>
    </div>
  )
}