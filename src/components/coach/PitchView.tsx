/**
 * PitchView — Ada2AI Coach Workspace
 *
 * Interactive football pitch with drag-and-drop player positioning.
 * Real players from Supabase — no hardcoded data.
 *
 * Extracted from scout-ai-project pitch logic,
 * adapted for Ada2AI Player type + React Router + RTL Arabic.
 */
import { useState, useRef, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Player } from '../../lib/supabase'

// ── Formations ──────────────────────────────────────────────

interface PlayerPos { x: number; y: number }

const FORMATIONS: Record<string, Record<number, PlayerPos>> = {
  '4-3-3': {
    0:  { x: 50, y: 88 },
    1:  { x: 20, y: 68 }, 2:  { x: 40, y: 65 },
    3:  { x: 60, y: 65 }, 4:  { x: 80, y: 68 },
    5:  { x: 30, y: 44 }, 6:  { x: 50, y: 42 },
    7:  { x: 70, y: 44 },
    8:  { x: 20, y: 20 }, 9:  { x: 50, y: 16 },
    10: { x: 80, y: 20 },
  },
  '4-4-2': {
    0:  { x: 50, y: 88 },
    1:  { x: 20, y: 68 }, 2:  { x: 40, y: 65 },
    3:  { x: 60, y: 65 }, 4:  { x: 80, y: 68 },
    5:  { x: 20, y: 44 }, 6:  { x: 40, y: 44 },
    7:  { x: 60, y: 44 }, 8:  { x: 80, y: 44 },
    9:  { x: 35, y: 18 }, 10: { x: 65, y: 18 },
  },
  '3-5-2': {
    0:  { x: 50, y: 88 },
    1:  { x: 25, y: 65 }, 2:  { x: 50, y: 62 }, 3:  { x: 75, y: 65 },
    4:  { x: 12, y: 44 }, 5:  { x: 30, y: 42 }, 6:  { x: 50, y: 40 },
    7:  { x: 70, y: 42 }, 8:  { x: 88, y: 44 },
    9:  { x: 35, y: 18 }, 10: { x: 65, y: 18 },
  },
}

// ── Role classification from position string ────────────────

type Role = 'gk' | 'def' | 'mid' | 'fwd'

function classifyRole(position?: string): Role {
  if (!position) return 'mid' // default
  const p = position.toLowerCase()
  if (p.includes('حارس') || p.includes('goalkeeper') || p.includes('gk')) return 'gk'
  if (p.includes('مدافع') || p.includes('دفاع') || p.includes('defender') || p.includes('back') || p.includes('cb') || p.includes('cb')) return 'def'
  if (p.includes('مهاجم') || p.includes('هجوم') || p.includes('مهاجم') || p.includes('forward') || p.includes('striker') || p.includes('st') || p.includes('fw') || p.includes('رأس حربة')) return 'fwd'
  return 'mid'
}

const ROLE_COLORS: Record<Role, { bg: string; border: string; glow: string; label: string }> = {
  gk:  { bg: 'linear-gradient(135deg, #FF8C00, #FF6B35)', border: '#FF6B35', glow: '#FF6B3560', label: 'حارس' },
  def: { bg: 'linear-gradient(135deg, #00D4FF, #0080FF)', border: '#00D4FF', glow: '#00D4FF60', label: 'مدافع' },
  mid: { bg: 'linear-gradient(135deg, #00FF88, #00CC66)', border: '#00FF88', glow: '#00FF8860', label: 'وسط' },
  fwd: { bg: 'linear-gradient(135deg, #FF4444, #CC2222)', border: '#FF4444', glow: '#FF444460', label: 'مهاجم' },
}

// ── Props ───────────────────────────────────────────────────

interface PitchViewProps {
  players: Player[]
  formation: '4-3-3' | '4-4-2' | '3-5-2'
  onFormationChange: (f: string) => void
}

// ── Component ───────────────────────────────────────────────

export default function PitchView({ players, formation, onFormationChange }: PitchViewProps) {
  const [playerPositions, setPlayerPositions] = useState<Record<number, PlayerPos>>(
    () => ({ ...FORMATIONS[formation] })
  )
  const [dragInfo, setDragInfo] = useState<{ id: number; startX: number; startY: number } | null>(null)
  const pitchRef = useRef<HTMLDivElement>(null)

  // Reset positions when formation changes
  const handleFormationChange = (f: string) => {
    onFormationChange(f)
    setPlayerPositions({ ...FORMATIONS[f] })
  }

  // Take first 11 players
  const startingPlayers = players.slice(0, 11)

  // Position-slot mapping: slot index → player
  const slotPlayers: Map<number, Player> = new Map()
  startingPlayers.forEach((player, idx) => {
    slotPlayers.set(idx, player)
  })

  // ── Drag handlers ──
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, slotId: number) => {
    e.stopPropagation()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragInfo({ id: slotId, startX: clientX, startY: clientY })
  }, [])

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragInfo || !pitchRef.current) return
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const rect = pitchRef.current.getBoundingClientRect()
    const x = Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(95, Math.max(5, ((clientY - rect.top) / rect.height) * 100))
    setPlayerPositions(prev => ({ ...prev, [dragInfo.id]: { x, y } }))
  }, [dragInfo])

  const handleDragEnd = useCallback(() => {
    setDragInfo(null)
  }, [])

  const currentFormationSlots = FORMATIONS[formation]
  const totalSlots = Object.keys(currentFormationSlots).length

  return (
    <div dir="rtl" className="space-y-3">
      {/* Formation selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ice-white arabic-text flex items-center gap-2">
          ⚽ تشكيل الفريق
        </h3>
        <div className="relative">
          <select
            value={formation}
            onChange={e => handleFormationChange(e.target.value)}
            className="appearance-none pl-8 pr-4 py-2 rounded-xl text-sm font-bold outline-none cursor-pointer arabic-text"
            style={{
              background: 'rgba(0,194,168,0.1)',
              border: '1px solid rgba(0,194,168,0.3)',
              color: '#00C2A8',
            }}
          >
            {Object.keys(FORMATIONS).map(f => (
              <option key={f} value={f} style={{ background: '#0D1526' }}>{f}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#00C2A8' }} />
        </div>
      </div>

      {/* Pitch */}
      <div
        ref={pitchRef}
        className="rounded-2xl overflow-hidden relative select-none"
        style={{
          minHeight: '300px',
          height: '420px',
          cursor: dragInfo ? 'grabbing' : 'default',
          userSelect: 'none',
        }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Grass */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a2e1a 0%, #0d3d22 30%, #0f4a28 50%, #0d3d22 70%, #0a2e1a 100%)' }} />

        {/* Field lines SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="5" y="3" width="90" height="94" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.4)" />
          <rect x="25" y="3" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <rect x="35" y="3" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <rect x="25" y="79" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <rect x="35" y="89" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <path d="M 35 21 A 10 10 0 0 1 65 21" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <path d="M 35 79 A 10 10 0 0 0 65 79" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
        </svg>

        {/* Players */}
        {Array.from({ length: totalSlots }).map((_, slotIdx) => {
          const pos = playerPositions[slotIdx] || currentFormationSlots[slotIdx]
          const player = slotPlayers.get(slotIdx)
          const role: Role = player ? classifyRole(player.position) : 'mid'
          const rc = ROLE_COLORS[role]
          const isDragging = dragInfo?.id === slotIdx
          const firstName = player?.name?.split(' ')[0] || `لاعب ${slotIdx + 1}`
          const displayNumber = player?.jersey_number || slotIdx + 1

          return (
            <div
              key={slotIdx}
              className="absolute flex flex-col items-center group"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isDragging ? 50 : 10,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'left 0.15s, top 0.15s',
              }}
              onMouseDown={e => handleDragStart(e, slotIdx)}
              onTouchStart={e => handleDragStart(e, slotIdx)}
            >
              <div
                className="w-10 h-10 rounded-full flex flex-col items-center justify-center relative"
                style={{
                  background: rc.bg,
                  boxShadow: isDragging
                    ? `0 0 20px ${rc.glow}, 0 0 0 2px ${rc.border}`
                    : `0 0 12px ${rc.glow}`,
                  transform: isDragging ? 'scale(1.15)' : undefined,
                  transition: isDragging ? 'none' : 'transform 0.15s',
                }}
              >
                <span className="text-white font-black text-xs leading-none">{displayNumber}</span>
              </div>
              {/* Name label */}
              <div
                className="mt-0.5 text-center opacity-80 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none px-1.5 py-0.5 rounded"
                style={{ fontSize: '9px', color: '#fff', fontFamily: 'Tajawal, sans-serif', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.6)' }}
              >
                {firstName}
              </div>
            </div>
          )
        })}

        {/* Formation label */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-xs font-black" style={{ background: 'rgba(0,0,0,0.5)', color: '#00C2A8', border: '1px solid rgba(0,194,168,0.2)' }}>
          {formation}
        </div>

        {/* Drag hint */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.4)', fontFamily: 'Tajawal, sans-serif' }}>
          اسحب اللاعبين لتحريكهم
        </div>

        {/* Legend */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {Object.entries(ROLE_COLORS).map(([role, rc]) => (
            <div key={role} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: rc.bg }} />
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontFamily: 'Tajawal, sans-serif' }}>{rc.label}</span>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {startingPlayers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm arabic-text" style={{ color: 'rgba(255,255,255,0.4)' }}>
              لا يوجد لاعبين — أضف لاعبين لعرض التشكيل
            </p>
          </div>
        )}
      </div>

      {/* Player count info */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <span className="arabic-text">
          {startingPlayers.length === 0
            ? 'لم يتم إضافة لاعبين'
            : startingPlayers.length < 11
              ? `${startingPlayers.length}/11 لاعب — ${11 - startingPlayers.length} مواقع فارغة`
              : 'التشكيل مكتمل (11 لاعب)'}
        </span>
        {startingPlayers.length > 0 && startingPlayers.length < 11 && (
          <span className="arabic-text" style={{ color: '#FFD700' }}>
            ⚠️ مواقع فارغة تُعرض كلاعبين مجهولين
          </span>
        )}
      </div>
    </div>
  )
}