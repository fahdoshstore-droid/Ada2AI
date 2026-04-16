/**
 * CoachDashboardHeader - Title and subtitle for the coach dashboard
 */
import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CoachDashboardHeader() {
  const { isRTL } = useLanguage()

  return (
    <div style={{ marginBottom: '32px' }}>
      <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
        {isRTL ? 'لوحة المدرب' : 'Coach Dashboard'}
      </h1>
      <p style={{ color: '#9CA3AF' }}>
        {isRTL ? 'إدارة اللاعبين والتدريب والتحليل' : 'Manage players, training and analytics'}
      </p>
    </div>
  )
}