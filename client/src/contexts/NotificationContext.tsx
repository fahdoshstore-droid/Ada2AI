/**
 * NotificationContext - Real-time notifications system
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'player_update' | 'match_alert' | 'system'
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
  metadata?: Record<string, any>
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const unreadCount = notifications.filter(n => !n.read).length

  // Load notifications from localStorage (demo mode)
  useEffect(() => {
    const saved = localStorage.getItem('ada2ai_notifications')
    if (saved) {
      setNotifications(JSON.parse(saved))
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('ada2ai_notifications', JSON.stringify(notifications))
    }
  }, [notifications, isLoading])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      created_at: new Date().toISOString()
    }
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep max 50
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      isLoading
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

// Hook for toast notifications (non-persistent)
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, showToast, dismissToast }
}
