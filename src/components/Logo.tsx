interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
  className?: string
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const s = sizes[size]
  const textSizes = { sm: '16px', md: '20px', lg: '26px' }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          fill="url(#ada2ai-grad)"
          stroke="rgba(0,194,168,0.3)"
          strokeWidth="0.5"
        />
        <path d="M22 8L14 21H20L18 32L26 19H20L22 8Z" fill="white" fillOpacity="0.95" />
        <defs>
          <linearGradient id="ada2ai-grad" x1="4" y1="2" x2="36" y2="38">
            <stop offset="0%" stopColor="#00C2A8" />
            <stop offset="100%" stopColor="#007ABA" />
          </linearGradient>
        </defs>
      </svg>
      {variant === 'full' && (
        <span
          className="font-bold tracking-tight text-ice-white"
          style={{ fontSize: textSizes[size], fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Ada2AI
        </span>
      )}
    </div>
  )
}