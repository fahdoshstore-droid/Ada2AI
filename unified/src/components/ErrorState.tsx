interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'حدث خطأ غير متوقع', onRetry }: ErrorStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '12px',
      padding: '32px',
      textAlign: 'center',
      background: 'linear-gradient(180deg, #000A0F 0%, #0A0E1A 100%)',
      fontFamily: "'Cairo', sans-serif",
    }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h3 style={{
        margin: 0,
        fontSize: '20px',
        fontWeight: 700,
        color: '#EEEFEE',
        fontFamily: "'Orbitron', sans-serif",
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      }}>حدث خطأ</h3>
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: '#6B7280',
        maxWidth: '400px',
        lineHeight: 1.5,
      }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)',
            color: '#EEEFEE',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            boxShadow: '0 0 20px rgba(0, 220, 200, 0.3)',
          }}
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}