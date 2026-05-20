/**
 * StatBar — Ada2AI Coach Components
 *
 * Simple progress bar for displaying player/analysis stats.
 * Colors default to teal-prime (#00C2A8) matching project design system.
 */
interface StatBarProps {
  label: string
  value: number      // 0-100
  color?: string     // default: '#00C2A8' (teal-prime)
}

export function StatBar({ label, value, color = '#00C2A8' }: StatBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-ice-muted arabic-text">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}