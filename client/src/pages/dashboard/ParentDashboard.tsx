/**
 * ParentDashboard - Parent dashboard for monitoring children
 */
import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, Video, Calendar, MessageSquare, TrendingUp, Bell, BarChart3 } from 'lucide-react'

export default function ParentDashboard() {
  const { isRTL } = useLanguage()

  const children = [
    {
      id: 1,
      name: isRTL ? 'يوسف' : 'Yousef',
      age: 14,
      sport: 'football',
      position: isRTL ? 'وسط' : 'Midfielder',
      club: isRTL ? 'أكاديمية الأمل' : 'Al-Amal Academy',
      performance: 82,
      recentActivity: [
        { text: isRTL ? 'تدريب مكثف' : 'Intense training', date: '2h ago' },
        { text: isRTL ? 'مباراة ودية' : 'Friendly match', date: '1d ago' },
      ]
    },
    {
      id: 2,
      name: isRTL ? 'عبدالله' : 'Abdullah',
      age: 12,
      sport: 'football',
      position: isRTL ? 'مدافع' : 'Defender',
      club: isRTL ? 'أكاديمية النخبة' : 'Al-Nukhba Academy',
      performance: 78,
      recentActivity: [
        { text: isRTL ? 'تقييم أداء' : 'Performance review', date: '3d ago' },
        { text: isRTL ? 'بطولة المنطقة' : 'Regional championship', date: '1w ago' },
      ]
    }
  ]

  const notifications = [
    { id: 1, text: isRTL ? 'تدريب غداً الساعة 5 مساءً' : 'Training tomorrow at 5 PM', time: '1h ago', unread: true },
    { id: 2, text: isRTL ? 'تم رفع تحليل جديد ليوسف' : 'New analysis uploaded for Yousef', time: '2h ago', unread: true },
    { id: 3, text: isRTL ? 'موعد طبيعى بعد أسبوع' : 'Medical checkup in a week', time: '1d ago', unread: false },
  ]

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
              {isRTL ? 'مرحباً!' : 'Welcome!'}
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              {isRTL ? 'تابع أداء أبنائك' : 'Monitor your children performance'}
            </p>
          </div>
          <button style={{
            padding: '12px 20px',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            color: '#EF4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            <Bell size={18} />
            {notifications.filter(n => n.unread).length} {isRTL ? 'جديد' : 'new'}
          </button>
        </div>

        {/* Children Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {children.map((child) => (
            <div key={child.id} style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #1F2937'
            }}>
              {/* Child Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#007ABA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}>
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ color: '#EEEFEE', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                    {child.name}
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                    {child.age} {isRTL ? 'سنة' : 'years'} • {child.position}
                  </p>
                </div>
              </div>

              {/* Club & Sport */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  backgroundColor: 'rgba(0,220,200,0.1)',
                  color: '#00DCC8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {child.club}
                </span>
                <span style={{
                  backgroundColor: 'rgba(139,92,246,0.1)',
                  color: '#8B5CF6',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {child.sport}
                </span>
              </div>

              {/* Performance */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>{isRTL ? 'الأداء' : 'Performance'}</span>
                  <span style={{ color: '#00DCC8', fontWeight: '600', fontSize: '14px' }}>{child.performance}%</span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#1F2937',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${child.performance}%`,
                    backgroundColor: child.performance >= 80 ? '#00DCC8' : child.performance >= 60 ? '#F59E0B' : '#EF4444',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              {/* Recent Activity */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ color: '#EEEFEE', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {child.recentActivity.map((activity, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#EEEFEE' }}>{activity.text}</span>
                      <span style={{ color: '#6B7280' }}>{activity.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'rgba(0,122,186,0.1)',
                  border: '1px solid #007ABA',
                  borderRadius: '8px',
                  color: '#007ABA',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: "'Cairo', sans-serif"
                }}>
                  <BarChart3 size={14} />
                  {isRTL ? 'التفاصيل' : 'Details'}
                </button>
                <button style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'rgba(0,220,200,0.1)',
                  border: '1px solid #00DCC8',
                  borderRadius: '8px',
                  color: '#00DCC8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  fontFamily: "'Cairo', sans-serif"
                }}>
                  <MessageSquare size={14} />
                  {isRTL ? 'تواصل' : 'Contact'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications */}
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
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notification) => (
              <div key={notification.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: notification.unread ? 'rgba(0,220,200,0.05)' : 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                borderLeft: notification.unread ? '3px solid #00DCC8' : 'none'
              }}>
                <div>
                  <p style={{ color: '#EEEFEE', marginBottom: '4px' }}>{notification.text}</p>
                  <p style={{ color: '#6B7280', fontSize: '12px' }}>{notification.time}</p>
                </div>
                {notification.unread && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#00DCC8'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
