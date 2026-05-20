interface AdaLogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function AdaLogo({ size = 40, showText = true, className = '' }: AdaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagonal shape */}
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          fill="url(#ada-grad)"
          stroke="rgba(0,194,168,0.3)"
          strokeWidth="0.5"
        />
        {/* Lightning bolt */}
        <path
          d="M23 8L14 21H20L17 32L26 19H20L23 8Z"
          fill="white"
          opacity="0.95"
        />
        <defs>
          <linearGradient id="ada-grad" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00C2A8" />
            <stop offset="100%" stopColor="#007ABA" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span
          className="font-display text-xl font-bold text-ice-white"
          style={{ letterSpacing: '-0.02em' }}
        >
          Ada2AI
        </span>
      )}
    </div>
  )
}