/**
 * Dashboard Home - Unified dashboard for all user types
 */
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import BackButton from '@/components/BackButton'
import { Users, BarChart3, Video, TrendingUp, Calendar, Activity } from 'lucide-react'
import { useLocation } from 'wouter'

export default function DashboardHome() {
  const { user } = useAuth()
  const { isRTL } = useLanguage()
  const [, navigate] = useLocation()

  const quickActions = [
    { path: '/dashboard/videos', border: '#00DCC830', icon: <Video size={24} color="#00DCC8" style={{ marginBottom: '12px' }} />, title: isRTL ? 'رفع فيديو' : 'Upload Video', desc: isRTL ? 'ارفع فيديو لتحليل الأداء' : 'Upload a video for performance analysis' },
    { path: '/dashboard/stats', border: '#10B98130', icon: <BarChart3 size={24} color="#10B981" style={{ marginBottom: '12px' }} />, title: isRTL ? 'عرض الإحصائيات' : 'View Statistics', desc: isRTL ? 'تحليل شامل للأداء' : 'Comprehensive performance analysis' },
    { path: '/dashboard/profile', border: '#007ABA30', icon: <Users size={24} color="#007ABA" style={{ marginBottom: '12px' }} />, title: isRTL ? 'إدارة الملف' : 'Manage Profile', desc: isRTL ? 'تحديث البيانات الشخصية' : 'Update personal information' },
  ]

  // Mock stats - replace with real data from Supabase
  const stats = [
    { icon: <Activity size={24} />, value: '12', label: isRTL ? 'مباريات' : 'Matches', color: '#00DCC8' },
    { icon: <TrendingUp size={24} />, value: '85%', label: isRTL ? 'أداء' : 'Performance', color: '#10B981' },
    { icon: <Video size={24} />, value: '5', label: isRTL ? 'فيديو' : 'Videos', color: '#007ABA' },
    { icon: <Calendar size={24} />, value: '3', label: isRTL ? 'تدريبات' : 'Training', color: '#F59E0B' },
  ]

  const recentActivity = [
    { id: 1, text: isRTL ? 'تم رفع فيديو جديد' : 'New video uploaded', time: '2h ago' },
    { id: 2, text: isRTL ? 'تحديث الملف الشخصي' : 'Profile updated', time: '5h ago' },
    { id: 3, text: isRTL ? 'إضافة إنجاز جديد' : 'New achievement added', time: '1d ago' },
  ]

  return (
    <DashboardLayout>
      <div>
        <BackButton fallbackRoute="/dashboards" />
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            color: '#EEEFEE',
            fontSize: '32px',
            fontWeight: 'bold',
            fontFamily: "'Cairo', sans-serif",
            marginBottom: '8px'
          }}>
            {isRTL ? 'مرحباً' : 'Welcome'}, {user?.email?.split('@')[0]}
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '16px' }}>
            {isRTL ? 'نظرة عامة على نشاطك' : 'Overview of your activity'}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${stat.color}30`
            }}>
              <div style={{ color: stat.color, marginBottom: '12px' }}>
                {stat.icon}
              </div>
              <h3 style={{
                color: '#EEEFEE',
                fontSize: '28px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
                marginBottom: '4px'
              }}>
                {stat.value}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #1F2937'
        }}>
          <h2 style={{
            color: '#EEEFEE',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.map((item) => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#EEEFEE' }}>{item.text}</span>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {quickActions.map((action, i) => (
            <div key={i} onClick={() => navigate(action.path)} style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${action.border}`,
              cursor: 'pointer'
            }}>
              {action.icon}
              <h3 style={{ color: '#EEEFEE', marginBottom: '8px' }}>
                {action.title}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                {action.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
