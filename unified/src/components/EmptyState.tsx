interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
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
      color: '#EEEFEE',
    }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#00DCC8" strokeWidth="1.5">
        <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4m8-4v4M8 9v4m8-8v8" />
      </svg>
      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#EEEFEE', letterSpacing: 0, lineHeight: 1.4 }}>{title}</h3>
      {description && (
        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280', maxWidth: '400px' }}>{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)',
            color: '#000A0F',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 220, 200, 0.3)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}