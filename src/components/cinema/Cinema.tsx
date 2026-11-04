/**
 * Cinema.tsx — Ada2AI "Floodlight" motion primitives
 *
 * Presentation-only helpers built on the existing framer-motion dependency.
 * Rules baked in:
 *  - Only transform / opacity / clip-path are animated → no layout shift.
 *  - prefers-reduced-motion: every primitive renders its FINAL state, no animation.
 *  - No scroll hijacking: scroll-linked values only read scroll position.
 */
import { useRef, type ElementType, type ReactNode } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion'

export const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

/* ─────────────────────────── SplitReveal ───────────────────────────
 * Staggered word reveal. Arabic must not be split per-letter (it would
 * break letter joining), so we split on word boundaries only.
 */
interface SplitRevealProps {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
  stagger?: number
  /** animate on mount instead of waiting for the element to enter the viewport */
  immediate?: boolean
}

export function SplitReveal({
  text,
  as = 'span',
  className = '',
  delay = 0,
  stagger = 0.09,
  immediate = false,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const show = Boolean(reduced) || immediate || inView
  const Tag = as as ElementType
  const words = text.split(' ')

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingTop: '0.2em', marginTop: '-0.2em', paddingBottom: '0.25em', marginBottom: '-0.25em' }}
          >
            <motion.span
              className="inline-block"
              initial={reduced ? false : { y: '120%' }}
              animate={{ y: show ? '0%' : '120%' }}
              transition={{ duration: 0.95, ease: EASE, delay: delay + i * stagger }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}

/* ─────────────────────────── ImageReveal ───────────────────────────
 * clip-path mask reveal + subtle scroll parallax on the image inside.
 * The wrapper owns the size (aspect / height classes) so nothing shifts.
 */
interface ImageRevealProps {
  src: string
  alt?: string
  className?: string
  imgClassName?: string
  /** 'up' = curtain from the bottom, 'side' = sweep from the inline-start edge */
  from?: 'up' | 'side'
  delay?: number
  parallax?: number
  caption?: string
  children?: ReactNode
}

export function ImageReveal({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  from = 'up',
  delay = 0,
  parallax = 7,
  caption,
  children,
}: ImageRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`])

  const hidden = from === 'up' ? 'inset(100% 0 0 0)' : 'inset(0 0 0 100%)'
  const shown = 'inset(0% 0 0 0%)'

  return (
    <figure className={`${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} ${className}`} ref={ref}>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={reduced ? false : { clipPath: hidden }}
        animate={{ clipPath: reduced || inView ? shown : hidden }}
        transition={{ duration: 1.25, ease: EASE, delay }}
      >
        <motion.img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={reduced ? undefined : { y, scale: 1 + (parallax * 2) / 100 + 0.04 }}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
        {children}
      </motion.div>
      {caption ? (
        <figcaption className="absolute -bottom-6 start-0 text-[11px] tracking-wide text-ice-muted/70 arabic-text">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ─────────────────────────── GhostNumber ───────────────────────────
 * Large outlined chapter numeral with a gentle parallax drift.
 * Purely decorative (aria-hidden).
 */
export function GhostNumber({ n, className = '' }: { n: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '16%'])

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none select-none absolute z-0 ${className}`}>
      <motion.span
        style={{
          ...(reduced ? {} : { y }),
          WebkitTextStroke: '1.5px rgba(0, 220, 200, 0.22)',
          direction: 'ltr',
        }}
        className="block font-display font-black leading-none text-transparent text-[clamp(9rem,26vw,24rem)]"
      >
        {n}
      </motion.span>
    </div>
  )
}

/* ─────────────────────────── Letterbox ───────────────────────────
 * Cinematic bars that "open" on load (scaleY from tall → rest height).
 */
export function Letterbox({ height = '7svh', delay = 0.2 }: { height?: string; delay?: number }) {
  const reduced = useReducedMotion()
  const common = {
    initial: reduced ? false : { scaleY: 4.5 },
    animate: { scaleY: 1 },
    transition: { duration: 1.7, ease: EASE, delay },
  } as const
  return (
    <>
      <motion.div
        {...common}
        style={{ height, transformOrigin: 'top' }}
        className="absolute inset-x-0 top-0 z-20 bg-navy-dark"
        aria-hidden="true"
      />
      <motion.div
        {...common}
        style={{ height, transformOrigin: 'bottom' }}
        className="absolute inset-x-0 bottom-0 z-20 bg-navy-dark"
        aria-hidden="true"
      />
    </>
  )
}

/* ─────────────────────── Stagger / StaggerItem ───────────────────────
 * Container that reveals its items one after another when in view.
 * Content stays fully readable & selectable once settled (≈ <1s).
 */
const containerVariants = (gap: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

export function Stagger({
  children,
  className = '',
  gap = 0.09,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  gap?: number
  delay?: number
  as?: 'div' | 'ul' | 'section'
}) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      variants={containerVariants(gap, delay)}
      initial={reduced ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
    >
      {children}
    </MotionTag>
  )
}

export function StaggerItem({
  children,
  className = '',
  x = 0,
  y = 28,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  x?: number
  y?: number
  as?: 'div' | 'li' | 'article'
}) {
  const MotionTag = motion[as]
  const variants: Variants = {
    hidden: { opacity: 0, x, y },
    show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.8, ease: EASE } },
  }
  return (
    <MotionTag className={className} variants={variants}>
      {children}
    </MotionTag>
  )
}

/* ─────────────────────────── SideReveal ───────────────────────────
 * Panel that slides in from the side behind a clip-path mask.
 * `from="start"` enters from the inline-start edge (right in RTL).
 */
export function SideReveal({
  children,
  className = '',
  from = 'start',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  from?: 'start' | 'end'
  delay?: number
}) {
  const reduced = useReducedMotion()
  // RTL: start = right edge. Physical offsets are used deliberately.
  const dx = from === 'start' ? 56 : -56
  const hidden = from === 'start' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, x: dx, clipPath: hidden }}
      whileInView={{ opacity: 1, x: 0, clipPath: 'inset(0 0 0 0)' }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.95, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}
