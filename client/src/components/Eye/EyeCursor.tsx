import { useState, useEffect, useCallback, useRef } from 'react';
import type { CursorPoint } from './types';

export interface EyeCursorProps {
  /** The point to animate the cursor to */
  point: CursorPoint;
  /** Whether the cursor is visible */
  visible: boolean;
  /** Auto-hide after ms, default 3000 */
  duration?: number;
  /** Callback when animation completes */
  onAnimationEnd?: () => void;
}

const CURSOR_COLOR = '#00DCC8'; // Eye teal
const CURSOR_SIZE = 24;
const PULSE_DURATION = 2000;

/**
 * Animated SVG cursor that flies to specific DOM elements or coordinates.
 * Uses CSS transitions for smooth movement and a pulsing glow effect.
 */
export function EyeCursor({ point, visible, duration = 3000, onAnimationEnd }: EyeCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Resolve position: CSS selector > percentage coordinates > pixel coordinates
  const resolvePosition = useCallback((p: CursorPoint): { x: number; y: number } => {
    if (p.targetSelector) {
      const element = document.querySelector(p.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    }

    if (p.unit === 'percent' || !p.unit) {
      return {
        x: (p.x / 100) * window.innerWidth,
        y: (p.y / 100) * window.innerHeight,
      };
    }

    return { x: p.x, y: p.y };
  }, []);

  useEffect(() => {
    if (!visible) {
      setOpacity(0);
      return;
    }

    const target = resolvePosition(point);
    setPosition(target);
    setOpacity(1);

    // Auto-hide after duration
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setOpacity(0);
      onAnimationEnd?.();
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [point, visible, duration, resolvePosition, onAnimationEnd]);

  if (!visible && opacity === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x - CURSOR_SIZE / 2,
        top: position.y - CURSOR_SIZE / 2,
        zIndex: 99999,
        pointerEvents: 'none',
        opacity,
        transition: 'left 0.5s cubic-bezier(0.22, 1, 0.36, 1), top 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
      }}
    >
      {/* Cursor arrow */}
      <svg
        width={CURSOR_SIZE}
        height={CURSOR_SIZE}
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: `drop-shadow(0 0 8px ${point.color || CURSOR_COLOR})` }}
      >
        <path
          d="M4 4L10 20L12.5 12.5L20 10L4 4Z"
          fill={point.color || CURSOR_COLOR}
          stroke={point.color || CURSOR_COLOR}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Pulsing glow ring */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: -8,
          width: CURSOR_SIZE + 16,
          height: CURSOR_SIZE + 16,
          borderRadius: '50%',
          border: `2px solid ${point.color || CURSOR_COLOR}`,
          animation: `eye-pulse ${PULSE_DURATION}ms ease-in-out infinite`,
        }}
      />

      {/* Label */}
      {point.label && (
        <div
          style={{
            position: 'absolute',
            left: CURSOR_SIZE + 8,
            top: -4,
            background: point.color || CURSOR_COLOR,
            color: '#0D1220',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'Cairo, sans-serif',
            whiteSpace: 'nowrap',
            direction: 'rtl',
          }}
        >
          {point.label}
        </div>
      )}

      {/* Inject pulse animation */}
      <style>{`
        @keyframes eye-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}