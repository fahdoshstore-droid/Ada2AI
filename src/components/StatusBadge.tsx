import { statusColors, statusLabels, type StatusKey } from '../lib/tokens'

interface StatusBadgeProps {
  status: StatusKey
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const s = statusColors[status] ?? statusColors.pending
  const isAnimated = status === 'processing'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium arabic-text ${className}`}
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAnimated ? 'animate-pulse' : ''}`}
        style={{ background: s.text }}
      />
      {statusLabels[status]}
    </span>
  )
}