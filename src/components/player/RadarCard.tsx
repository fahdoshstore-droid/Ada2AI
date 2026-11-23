/**
 * RadarCard — one metric group drawn as a polygon (radar) chart.
 *
 * Plain SVG, no chart library. Values are 0..max on every axis; an optional
 * `compare` series (e.g. the player's previous evaluation) is drawn dashed
 * underneath. Only values that exist are passed in — nothing is estimated.
 */
import { useId, type ReactNode } from 'react'

export interface RadarAxis { label: string; value: number }

interface RadarCardProps {
  eyebrow: string
  /** Big number at the top of the card. */
  headline: string
  headlineCaption?: ReactNode
  color: string
  axes: RadarAxis[]
  compare?: { label: string; values: number[] }
  max?: number
  /** Footer caption under BEST/WORST values, e.g. a date. */
  footnote?: string
}

const SIZE = 300
const C = SIZE / 2
const R = 92
const RINGS = 4

function point(i: number, n: number, ratio: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
  return [C + Math.cos(a) * R * ratio, C + Math.sin(a) * R * ratio] as const
}

const poly = (vals: number[], max: number) =>
  vals.map((v, i) => point(i, vals.length, Math.max(0, Math.min(v, max)) / max).join(',')).join(' ')

export default function RadarCard({ eyebrow, headline, headlineCaption, color, axes, compare, max = 100, footnote }: RadarCardProps) {
  const gid = useId()
  const n = axes.length
  if (n < 3) return null
  const values = axes.map(a => a.value)
  const best = axes.reduce((b, a) => (a.value > b.value ? a : b))
  const worst = axes.reduce((w, a) => (a.value < w.value ? a : w))
  const summary = axes.map(a => `${a.label} ${a.value}`).join('، ')

  return (
    <figure className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5" dir="rtl">
      <figcaption>
        <p className="text-[11px] font-bold tracking-wide text-ice-muted arabic-text">{eyebrow}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-3xl font-black leading-none" style={{ color }}>{headline}</span>
          {headlineCaption && <span className="text-sm text-ice-muted arabic-text">{headlineCaption}</span>}
        </p>
      </figcaption>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto mt-2 w-full max-w-[300px] overflow-visible" role="img" aria-label={`${eyebrow}: ${summary}`}>
        <defs>
          <radialGradient id={gid}>
            <stop offset="0%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="0.25" />
          </radialGradient>
        </defs>
        {/* grid rings */}
        {Array.from({ length: RINGS }, (_, r) => (
          <polygon key={r} points={poly(Array(n).fill(((r + 1) / RINGS) * max), max)} fill="none" stroke="rgba(238,239,238,0.08)" strokeWidth="1" />
        ))}
        {/* spokes */}
        {axes.map((_, i) => {
          const [x, y] = point(i, n, 1)
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgba(238,239,238,0.08)" strokeWidth="1" />
        })}
        {/* previous series */}
        {compare && compare.values.length === n && (
          <polygon points={poly(compare.values, max)} fill="none" stroke="rgba(238,239,238,0.45)" strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        {/* current series */}
        <polygon points={poly(values, max)} fill={`url(#${gid})`} stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {values.map((v, i) => {
          const [x, y] = point(i, n, Math.max(0, Math.min(v, max)) / max)
          return <circle key={i} cx={x} cy={y} r="3.5" fill={color} />
        })}
        {/* labels */}
        {axes.map((a, i) => {
          const [x, y] = point(i, n, 1.24)
          const dx = x - C
          const anchor = Math.abs(dx) < 4 ? 'middle' : dx > 0 ? 'start' : 'end'
          return (
            <g key={a.label} style={{ fontFamily: 'inherit' }}>
              <text x={x} y={y - 7} textAnchor={anchor} dominantBaseline="middle" className="fill-ice-white text-[12px] font-bold">{a.label}</text>
              <text x={x} y={y + 9} textAnchor={anchor} dominantBaseline="middle" direction="ltr" className="fill-ice-muted text-[11px]">{a.value}</text>
            </g>
          )
        })}
      </svg>

      {compare && (
        <p className="mt-1 flex items-center justify-center gap-4 text-[11px] text-ice-muted arabic-text">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ background: color }} /> الحالي</span>
          <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-ice-white/60" /> {compare.label}</span>
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 border-t border-white/10 pt-4 text-center">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-ice-muted arabic-text">الأقوى</p>
          <p className="mt-1 text-base font-black text-ice-white arabic-text">{best.label} <span className="font-display text-teal-prime">{best.value}</span></p>
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-widest text-ice-muted arabic-text">يحتاج تطوير</p>
          <p className="mt-1 text-base font-black text-ice-white arabic-text">{worst.label} <span className="font-display text-gold">{worst.value}</span></p>
        </div>
      </div>
      {footnote && <p className="mt-3 text-center text-[11px] text-ice-muted arabic-text">{footnote}</p>}
    </figure>
  )
}
