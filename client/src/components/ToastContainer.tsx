/**
 * ToastContainer - Temporary notification toasts
 */
import React from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToast } from '@/contexts/NotificationContext'

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#0A0E1A',
          border: '1px solid #10B981',
          icon: <CheckCircle size={20} color="#10B981" />
        }
      case 'error':
        return {
          backgroundColor: '#0A0E1A',
          border: '1px solid #EF4444',
          icon: <XCircle size={20} color="#EF4444" />
        }
      default:
        return {
          backgroundColor: '#0A0E1A',
          border: '1px solid #007ABA',
          icon: <Info size={20} color="#007ABA" />
        }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 9999
    }}>
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type)
        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: style.backgroundColor,
              border: style.border,
              borderRadius: '10px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              minWidth: '280px',
              maxWidth: '400px',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            {style.icon}
            <p style={{
              flex: 1,
              color: '#EEEFEE',
              fontSize: '14px',
              fontFamily: "'Cairo', sans-serif",
              margin: 0
            }}>
              {toast.message}
            </p>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6B7280',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
