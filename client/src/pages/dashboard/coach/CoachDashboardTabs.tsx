/**
 * CoachDashboardTabs - Tab navigation for the coach dashboard
 */
import React from 'react'
import { Users, BarChart3, Calendar, Check } from 'lucide-react'
import type { ActiveTab } from './types'

interface CoachDashboardTabsProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  isRTL: boolean
}

export default function CoachDashboardTabs({ activeTab, setActiveTab, isRTL }: CoachDashboardTabsProps) {
  const tabs = [
    { key: 'players' as ActiveTab, label: isRTL ? 'اللاعبين' : 'Players', icon: <Users size={16} /> },
    { key: 'training' as ActiveTab, label: isRTL ? 'التدريب' : 'Training', icon: <Calendar size={16} /> },
    { key: 'stats' as ActiveTab, label: isRTL ? 'الإحصائيات' : 'Stats', icon: <BarChart3 size={16} /> },
    { key: 'attendance' as ActiveTab, label: isRTL ? 'الحضور' : 'Attendance', icon: <Check size={16} /> },
  ]

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: activeTab === tab.key ? 'rgba(0,220,200,0.1)' : 'transparent',
            border: activeTab === tab.key ? '1px solid #00DCC8' : '1px solid transparent',
            borderRadius: '8px',
            color: activeTab === tab.key ? '#00DCC8' : '#9CA3AF',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            transition: 'all 0.2s',
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}