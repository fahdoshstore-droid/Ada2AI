import React from 'react'

interface AdaLogoProps {
  size?: number
  showText?: boolean
  className?: string
  variant?: 'dark' | 'light' | 'gradient'
}

export function AdaLogo({
  size = 40,
  showText = true,
  className = '',
  variant = 'dark',
}: AdaLogoProps) {
  const uid = React.useId().replace(/:/g, '')
  const isLight = variant === 'light'
  const iconFill = isLight ? '#0a1628' : `url(#g-${uid})`
  const textColor = isLight ? '#0a1628' : '#ffffff'

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`g-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C2A8" />
            <stop offset="100%" stopColor="#007ABA" />
          </linearGradient>
        </defs>
        <path
          d="M50 5 L85 25 L85 65 L50 95 L15 75 L15 25 L50 5 L50 18 L28 30 L28 70 L50 82 L72 70 L72 35 L60 45 L50 35 L65 15 L50 5 Z"
          fill={iconFill}
          fillRule="evenodd"
        />
        <path
          d="M48 20 L68 20 L45 50 L65 50 L35 85 L48 45 L32 45 Z"
          fill="#ffffff"
        />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "'Barlow Condensed', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: size * 0.85,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <span style={{ color: textColor }}>Ada</span>
          <span style={{ color: '#00C2A8' }}>2</span>
          <span style={{ color: textColor }}>AI</span>
        </span>
      )}
    </div>
  )
}