/**
 * PageHeader — the Floodlight (D2) header in its working register.
 *
 * One header for every interior page, so the product reads as one design
 * instead of per-page variations of a gradient title. The landing page and
 * the coach dashboard keep their own photographic heroes; everything the
 * user *works* in uses this: rule + eyebrow, split-revealed title, grain,
 * a single radial glow, and a letterbox wipe.
 *
 * Colour discipline: teal is reserved for the first title line and the
 * eyebrow. Provenance colours (scout-blue = coach input, gold = unconfirmed,
 * ice-muted = unavailable) are set by the page content, never here.
 */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE, Letterbox, SplitReveal } from './Cinema'

interface PageHeaderProps {
  /** Small caps label above the title. */
  eyebrow: string
  icon?: LucideIcon
  /** First title line — rendered in teal. */
  titleTop: string
  /** Optional second line — rendered in ice-white. */
  titleBottom?: string
  description?: string
  /** Buttons, search fields or anything else that belongs in the header. */
  children?: ReactNode
  align?: 'start' | 'center'
  /** Tighter vertical rhythm for dense tool pages. */
  compact?: boolean
}

export default function PageHeader({
  eyebrow,
  icon: Icon,
  titleTop,
  titleBottom,
  description,
  children,
  align = 'start',
  compact = false,
}: PageHeaderProps) {
  const reduced = useReducedMotion()
  const centered = align === 'center'

  return (
    <section
      className={`relative overflow-hidden ${compact ? 'pb-8 pt-28 md:pb-10 md:pt-32' : 'pb-12 pt-32 md:pb-16 md:pt-40'}`}
      aria-label={eyebrow}
    >
      <div
        className={`absolute inset-0 ${centered
          ? 'bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,220,200,0.12),transparent_70%)]'
          : 'bg-[radial-gradient(55%_55%_at_80%_0%,rgba(0,220,200,0.12),transparent_70%)]'}`}
        aria-hidden="true"
      />
      <div className="grain-overlay" />
      <Letterbox height="3svh" />

      <div className={`relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${centered ? 'text-center' : ''}`}>
        <div className={`mb-5 flex items-center gap-3 text-sm font-semibold text-teal-prime ${centered ? 'justify-center' : ''}`}>
          <span className="h-px w-10 bg-teal-prime" aria-hidden="true" />
          {Icon && <Icon className="h-4 w-4" />}
          <span className="arabic-text">{eyebrow}</span>
        </div>

        <h1 className={`font-black leading-[1.22] tracking-tightest ${compact ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl lg:text-7xl'}`}>
          <SplitReveal text={titleTop} immediate delay={0.25} className="block text-teal-prime arabic-text" />
          {titleBottom && (
            <SplitReveal text={titleBottom} immediate delay={0.45} className="block text-ice-white arabic-text" />
          )}
        </h1>

        {(description || children) && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: titleBottom ? 0.85 : 0.65 }}
          >
            {description && (
              <p className={`mt-7 text-lg leading-relaxed text-ice-white/75 arabic-text ${centered ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
                {description}
              </p>
            )}
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
