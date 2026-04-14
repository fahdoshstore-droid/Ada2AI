/**
 * HighlightOverlay - Visual highlighting for pitch areas
 * 
 * Provides visual overlay on the pitch to highlight zones,
 * show optimal positions, and guide player movement.
 */

import React, { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type HighlightZone = 
  | 'penalty-area'
  | 'center'
  | 'left-wing'
  | 'right-wing'
  | 'defensive-third'
  | 'middle-third'
  | 'attacking-third'
  | 'goalkeeper-zone';

export interface HighlightConfig {
  zone: HighlightZone;
  color: string;
  opacity: number;
  pulse?: boolean;
  label?: string;
}

export interface ArrowConfig {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  animated?: boolean;
}

export interface HighlightOverlayProps {
  /** Current highlights */
  highlights?: HighlightConfig[];
  
  /** Current arrows */
  arrows?: ArrowConfig[];
  
  /** Is active */
  isActive?: boolean;
  
  /** Language */
  language?: 'ar' | 'en';
  
  /** On click handler */
  onZoneClick?: (zone: HighlightZone) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Zone to CSS mapping
// ─────────────────────────────────────────────────────────────────────────────

const zoneStyles: Record<HighlightZone, React.CSSProperties> = {
  'penalty-area': { top: '0%', left: '30%', width: '40%', height: '17%' },
  'center': { top: '40%', left: '40%', width: '20%', height: '20%' },
  'left-wing': { top: '30%', left: '0%', width: '25%', height: '40%' },
  'right-wing': { top: '30%', left: '75%', width: '25%', height: '40%' },
  'defensive-third': { top: '67%', left: '0%', width: '100%', height: '33%' },
  'middle-third': { top: '34%', left: '0%', width: '100%', height: '33%' },
  'attacking-third': { top: '0%', left: '0%', width: '100%', height: '33%' },
  'goalkeeper-zone': { top: '85%', left: '35%', width: '30%', height: '15%' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Single Zone Highlight
// ─────────────────────────────────────────────────────────────────────────────

interface ZoneHighlightProps {
  config: HighlightConfig;
  isRtl: boolean;
  onClick?: () => void;
}

function ZoneHighlight({ config, isRtl, onClick }: ZoneHighlightProps) {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    if (config.pulse) {
      const interval = setInterval(() => {
        setPulse(p => !p);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [config.pulse]);
  
  const style: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '8px',
    border: `2px solid ${config.color}`,
    background: `${config.color}${Math.round(config.opacity * 255).toString(16).padStart(2, '0')}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transform: pulse ? 'scale(1.02)' : 'scale(1)',
    boxShadow: pulse ? `0 0 20px ${config.color}` : 'none',
    zIndex: 15,
    ...zoneStyles[config.zone],
  };
  
  return (
    <div 
      style={style}
      onClick={onClick}
      className="group"
    >
      {/* Label */}
      {config.label && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
          style={{
            background: config.color,
            color: '#0D1220',
            fontFamily: isRtl ? "'Tajawal', sans-serif" : "'Space Grotesk', sans-serif",
          }}
        >
          {config.label}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Arrow Component
// ─────────────────────────────────────────────────────────────────────────────

interface ArrowProps {
  config: ArrowConfig;
  isRtl: boolean;
}

function Arrow({ config, isRtl }: ArrowProps) {
  // Calculate SVG path
  const { from, to } = config;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${from.x}%`,
        top: `${from.y}%`,
        width: `${Math.sqrt(dx * dx + dy * dy)}%`,
        height: '4px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        zIndex: 20,
      }}
    >
      {/* Arrow line */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background: config.color,
          boxShadow: `0 0 8px ${config.color}`,
        }}
      />
      
      {/* Arrow head */}
      <div
        className="absolute end-0 top-1/2 -translate-y-1/2"
        style={{
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: `10px solid ${config.color}`,
        }}
      />
      
      {/* Animation */}
      {config.animated && (
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, white, transparent)` }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Overlay Component
// ─────────────────────────────────────────────────────────────────────────────

export default function HighlightOverlay({
  highlights = [],
  arrows = [],
  isActive = false,
  language = 'ar',
  onZoneClick,
}: HighlightOverlayProps) {
  const isRtl = language === 'ar';
  
  if (!isActive) return null;
  
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 15 }}
    >
      {/* Zone Highlights */}
      {highlights.map((config, i) => (
        <ZoneHighlight
          key={`zone-${i}`}
          config={config}
          isRtl={isRtl}
          onClick={onZoneClick ? () => onZoneClick(config.zone) : undefined}
        />
      ))}
      
      {/* Arrows */}
      {arrows.map((config, i) => (
        <Arrow key={`arrow-${i}`} config={config} isRtl={isRtl} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset Highlight Configurations
// ─────────────────────────────────────────────────────────────────────────────

export const presetHighlights: Record<string, HighlightConfig[]> = {
  '4-4-2': [
    { zone: 'defensive-third', color: '#3B82F6', opacity: 0.3, label: isRtl => isRtl ? 'المنطقة الدفاعية' : 'Defensive Zone' },
    { zone: 'middle-third', color: '#22C55E', opacity: 0.25, label: isRtl => isRtl ? 'منطقة الوسط' : 'Midfield Zone' },
    { zone: 'attacking-third', color: '#EF4444', opacity: 0.25, label: isRtl => isRtl ? 'منطقة الهجوم' : 'Attack Zone' },
  ],
  '4-3-3': [
    { zone: 'defensive-third', color: '#3B82F6', opacity: 0.3 },
    { zone: 'left-wing', color: '#22C55E', opacity: 0.25, label: 'LW' },
    { zone: 'right-wing', color: '#22C55E', opacity: 0.25, label: 'RW' },
    { zone: 'center', color: '#EF4444', opacity: 0.3 },
  ],
  '3-5-2': [
    { zone: 'defensive-third', color: '#3B82F6', opacity: 0.3 },
    { zone: 'middle-third', color: '#22C55E', opacity: 0.35 },
    { zone: 'attacking-third', color: '#EF4444', opacity: 0.25 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper to create arrow between players
// ─────────────────────────────────────────────────────────────────────────────

export function createArrow(
  fromPlayer: { x: number; y: number },
  toPlayer: { x: number; y: number },
  color = '#00DCC8'
): ArrowConfig {
  return {
    from: { x: fromPlayer.x, y: fromPlayer.y },
    to: { x: toPlayer.x, y: toPlayer.y },
    color,
    animated: true,
  };
}