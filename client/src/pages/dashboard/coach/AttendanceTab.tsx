/**
 * AttendanceTab - Attendance records table
 */
import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Player, AttendanceRecord } from './types'

interface AttendanceTabProps {
  attendanceRecords: AttendanceRecord[]
  players: Player[]
  isRTL: boolean
}

export default function AttendanceTab({ attendanceRecords, players, isRTL }: AttendanceTabProps) {
  return (
    <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
      <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
        {isRTL ? 'سجل الحضور' : 'Attendance Records'}
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'اللاعب' : 'Player'}</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'حاضر' : 'Present'}</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'غائب' : 'Absent'}</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'النسبة' : 'Rate'}</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record) => {
              const player = players.find(p => p.id === String(record.playerId))
              return (
                <tr key={record.playerId} style={{ borderBottom: '1px solid #1F2937' }}>
                  <td style={{ padding: '12px', color: '#EEEFEE' }}>{player?.name}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#10B981' }}>{record.present}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#EF4444' }}>{record.absent}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      backgroundColor: record.rate >= 90 ? 'rgba(16,185,129,0.2)' : record.rate >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                      color: record.rate >= 90 ? '#10B981' : record.rate >= 75 ? '#F59E0B' : '#EF4444',
                      padding: '4px 12px', borderRadius: '4px', fontWeight: '600',
                    }}>
                      {record.rate >= 90 ? <TrendingUp size={14} /> : record.rate >= 75 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {record.rate}%
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                      backgroundColor: record.rate >= 90 ? 'rgba(16,185,129,0.2)' : record.rate >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                      color: record.rate >= 90 ? '#10B981' : record.rate >= 75 ? '#F59E0B' : '#EF4444',
                    }}>
                      {record.rate >= 90 ? (isRTL ? 'ممتاز' : 'Excellent') : record.rate >= 75 ? (isRTL ? 'جيد' : 'Good') : (isRTL ? 'يحتاج تحسين' : 'Needs Improvement')}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}