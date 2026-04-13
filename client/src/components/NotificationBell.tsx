/**
 * NotificationBell - Real-time notification bell with dropdown
 */
import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, X, Trash2, Clock } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const { isRTL } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return isRTL ? 'الآن' : 'Just now'
    if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`
    if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`
    return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
      case 'error': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
      case 'warning': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
      case 'player_update': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#007ABA' }} />
      case 'match_alert': return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
      default: return <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6B7280' }} />
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: isOpen ? 'rgba(0,220,200,0.1)' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? '#00DCC8' : '#374151',
          borderRadius: '8px',
          color: isOpen ? '#00DCC8' : '#9CA3AF',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: isRTL ? 'auto' : '-4px',
            left: isRTL ? '-4px' : 'auto',
            backgroundColor: '#EF4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 5px',
            borderRadius: '10px',
            minWidth: '16px',
            textAlign: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: isRTL ? 'auto' : '0',
          right: isRTL ? '0' : 'auto',
          marginTop: '8px',
          width: '360px',
          maxHeight: '480px',
          backgroundColor: '#0A0E1A',
          border: '1px solid #374151',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #1F2937'
          }}>
            <h3 style={{ color: '#EEEFEE', fontWeight: '600', fontSize: '16px' }}>
              {isRTL ? 'الإشعارات' : 'Notifications'}
              {unreadCount > 0 && (
                <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: 'normal', marginRight: '8px' }}>
                  ({unreadCount} {isRTL ? 'غير مقروء' : 'unread'})
                </span>
              )}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#00DCC8',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                >
                  <CheckCheck size={14} />
                  {isRTL ? 'تحديد الكل كمقروء' : 'Mark all read'}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#EF4444',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <Bell size={32} color="#374151" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#6B7280', fontSize: '14px' }}>
                  {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #1F2937',
                    backgroundColor: notif.read ? 'transparent' : 'rgba(0,220,200,0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : 'rgba(0,220,200,0.03)'}
                >
                  <div style={{ flexShrink: 0, paddingTop: '4px' }}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{
                        color: '#EEEFEE',
                        fontSize: '14px',
                        fontWeight: notif.read ? 'normal' : '600',
                        marginBottom: '4px'
                      }}>
                        {notif.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id) }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6B7280',
                          padding: '2px'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '6px', lineHeight: 1.4 }}>
                      {notif.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', fontSize: '11px' }}>
                      <Clock size={10} />
                      {formatTime(notif.created_at)}
                    </div>
                  </div>
                  {!notif.read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#00DCC8',
                      flexShrink: 0,
                      marginTop: '6px'
                    }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #1F2937',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#00DCC8',
                  fontSize: '13px',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
