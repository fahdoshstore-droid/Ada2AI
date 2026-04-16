/**
 * StatsTab - Performance charts and analytics
 */
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface StatsTabProps {
  performanceData: { name: string; performance: number; attendance: number; goals: number }[]
  goalsData: { name: string; value: number; color: string }[]
  monthlyPerformance: { month: string; performance: number; attendance: number }[]
  isRTL: boolean
}

export default function StatsTab({ performanceData, goalsData, monthlyPerformance, isRTL }: StatsTabProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Performance Chart */}
      <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
        <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
          {isRTL ? 'أداء اللاعبين' : 'Player Performance'}
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px' }} />
            <Bar dataKey="performance" fill="#00DCC8" name={isRTL ? 'الأداء' : 'Performance'} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goals Pie */}
      <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
        <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
          {isRTL ? 'الأهداف' : 'Goals'}
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={goalsData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {goalsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00DCC8' }} />
            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'أهدافنا' : 'Our Goals'} ({goalsData[0]?.value})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'أهداف الخصم' : 'Against'} ({goalsData[1]?.value})</span>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div style={{ gridColumn: 'span 2', backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
        <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
          {isRTL ? 'الأداء الشهري' : 'Monthly Performance'}
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="performance" stroke="#00DCC8" strokeWidth={2} name={isRTL ? 'الأداء' : 'Performance'} />
            <Line type="monotone" dataKey="attendance" stroke="#007ABA" strokeWidth={2} name={isRTL ? 'الحضور' : 'Attendance'} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}