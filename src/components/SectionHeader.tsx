import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function SectionHeader({ title, icon, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-teal-prime rounded-full flex-shrink-0" />
        {icon && <span className="text-teal-prime flex-shrink-0">{icon}</span>}
        <h2 className="font-bold text-ice-white text-base arabic-text">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}