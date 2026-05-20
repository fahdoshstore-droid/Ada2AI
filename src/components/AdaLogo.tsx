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
  const uniqueId = React.useId().replace(/:/g, '')

  const colors = {
    teal: '#00C2A8',
    blue: '#007ABA',
    navy: '#0a1628',
    white: '#ffffff',
    stroke: 'rgba(0,220,200,0.3)',
  }

  const isLight = variant === 'light'
  const iconFill = isLight ? colors.navy : `url(#grad-${uniqueId})`
  const textColor = isLight ? colors.navy : colors.white

  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ height: size }}>
      <svg
        viewBox="0 0 100 100"
        height={size}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Ada2AI logo"
      >
        <defs>
          <linearGradient id={`grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.teal} />
            <stop offset="100%" stopColor={colors.blue} />
          </linearGradient>
        </defs>
        <path
          d="M50 5 L85 25 L85 65 L50 95 L15 75 L15 25 Z"
          fill={iconFill}
          stroke={colors.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M45 25 L65 25 L40 55 L60 55 L35 85 L45 50 L30 50 Z"
          fill={colors.white}
        />
      </svg>

      {showText && (
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: size * 0.75,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Ada */}
          <span style={{ color: textColor }}>Ada</span>
          {/* 2 — teal دائماً */}
          <span style={{ color: colors.teal }}>2</span>
          {/* AI */}
          <span style={{ color: textColor }}>AI</span>
        </span>
      )}
    </div>
  )
}