/**
 * FootageIntel — "Footage to Intelligence" section
 *
 * A match frame whose analysis layers appear step by step:
 *   scan sweep → player boxes → labels → pitch zones → results panel.
 *
 * IMPORTANT (honesty): everything drawn over the frame and every figure in the
 * panel is an ILLUSTRATION of the "تسجيل نتائج التحليل" form fields the
 * coach workspace already has (touches, speed, possession, zones). It is NOT
 * output of an automatic tracker. A persistent "توضيحي" badge says so.
 */
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import matchFrame from '../../assets/cinema/match-frame.jpg'
import { EASE, GhostNumber, SplitReveal } from './Cinema'

// Box positions are % of the 1536×864 frame, placed over visible players.
const BOXES = [
  { id: 'a', l: 27.9, t: 57.9, w: 3.4, h: 10.2, label: 'لاعب ١' },
  { id: 'b', l: 47.9, t: 67.8, w: 3.6, h: 11.5, label: 'لاعب ٢' },
  { id: 'c', l: 33.6, t: 54.2, w: 3.2, h: 8.2, label: 'لاعب ٣' },
  { id: 'd', l: 44.5, t: 43.1, w: 2.8, h: 7.7, label: 'لاعب ٤' },
  { id: 'e', l: 79.5, t: 82.4, w: 2.4, h: 12.8, label: 'لاعب ٥' },
] as const

const ROWS = [
  { label: 'عدد اللمسات', value: '45' },
  { label: 'السرعة (كم/س)', value: '28' },
  { label: 'مشاركة في الاستحواذ', value: '62%' },
] as const

const ZONES = [
  { label: 'دفاعي', pct: 20 },
  { label: 'وسط', pct: 45 },
  { label: 'هجومي', pct: 35 },
] as const

export default function FootageIntel() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '0px 0px -18% 0px' })
  const on = Boolean(reduced) || inView
  const t = (s: number) => (reduced ? 0 : s)

  return (
    <section className="relative overflow-hidden bg-[#000A0F] py-24 md:py-40" aria-label="من فيديو المباراة إلى نتائج التحليل">
      <GhostNumber n="02" className="-top-8 end-[-3%]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-3xl md:mb-20">
          <span className="text-label-caps mb-4 inline-block">من اللقطة إلى المعلومة</span>
          <SplitReveal
            as="h2"
            text="من فيديو المباراة إلى نتائج التحليل"
            className="text-4xl font-black leading-[1.25] tracking-tightest text-ice-white arabic-text md:text-6xl"
          />
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ice-muted arabic-text">
            ارفع فيديو اللاعب أو المنافس، ثم تابع حالة التحليل وسجّل النتائج: اللمسات، السرعة، الاستحواذ ومناطق التحرك.
          </p>
        </div>

        <div ref={ref} className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── Frame ── */}
          <div className="relative lg:col-span-8">
            <div className="relative aspect-video overflow-hidden border border-white/10 bg-black">
              <img src={matchFrame} alt="لقطة من مباراة" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F]/70 via-transparent to-[#000A0F]/30" />

              {/* 1. scan sweep */}
              {!reduced && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  initial={{ y: '-100%' }}
                  animate={{ y: on ? '100%' : '-100%' }}
                  transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.2 }}
                >
                  <div className="h-full w-full bg-gradient-to-b from-transparent via-teal-prime/10 to-teal-prime/35 border-b border-teal-prime/80" />
                </motion.div>
              )}

              {/* 4. zones (appear last) */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: on ? 1 : 0 }}
                transition={{ duration: 0.8, delay: t(3.1) }}
              >
                {ZONES.map((z) => (
                  <div key={z.label} style={{ width: `${z.pct}%` }} className="relative border-s border-dashed border-teal-prime/35 first:border-s-0">
                    <span className="absolute start-2 top-2 font-display text-[10px] tracking-widest text-teal-prime/90 md:text-xs">{z.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* 2 + 3. boxes then labels */}
              {BOXES.map((b, i) => (
                <div
                  key={b.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute"
                  style={{ left: `${b.l}%`, top: `${b.t}%`, width: `${b.w}%`, height: `${b.h}%` }}
                >
                  <motion.div
                    className="h-full w-full border border-teal-prime shadow-[0_0_14px_rgba(0,220,200,0.45)]"
                    initial={reduced ? false : { opacity: 0, scale: 1.5 }}
                    animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.5 }}
                    transition={{ duration: 0.5, ease: EASE, delay: t(0.9 + i * 0.32) }}
                  />
                  <motion.span
                    className="absolute -top-5 start-0 whitespace-nowrap bg-teal-prime px-1.5 py-px text-[9px] font-bold text-navy-dark md:text-[11px] arabic-text"
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
                    transition={{ duration: 0.45, ease: EASE, delay: t(1.15 + i * 0.32) }}
                  >
                    {b.label}
                  </motion.span>
                </div>
              ))}

              {/* illustrative badge — always visible */}
              <div className="absolute end-3 top-3 z-10 flex items-center gap-2 border border-teal-prime/60 bg-[#000A0F]/80 px-3 py-1.5 text-[11px] font-bold text-teal-prime backdrop-blur-sm arabic-text">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-prime" />
                توضيحي — التراكبات ليست نتيجة رصد آلي
              </div>
            </div>
            <p className="mt-3 text-[11px] text-ice-muted/70 arabic-text">لقطة مولّدة بالذكاء الاصطناعي لأغراض العرض.</p>
          </div>

          {/* ── Results panel ── */}
          <div className="lg:col-span-4">
            <div className="border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-ice-white arabic-text">تسجيل نتائج التحليل</h3>
                <span className="border border-teal-prime/50 px-2 py-0.5 text-[10px] font-bold text-teal-prime arabic-text">توضيحي</span>
              </div>

              <ul>
                {ROWS.map((r, i) => (
                  <motion.li
                    key={r.label}
                    className="flex items-baseline justify-between border-t border-white/10 py-4"
                    initial={reduced ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: on ? 1 : 0, x: on ? 0 : 24 }}
                    transition={{ duration: 0.7, ease: EASE, delay: t(2.4 + i * 0.28) }}
                  >
                    <span className="text-sm text-ice-muted arabic-text">{r.label}</span>
                    <span className="font-display text-4xl font-bold text-ice-white">{r.value}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-3 text-sm text-ice-muted arabic-text">مناطق التحرك (المجموع 100%)</p>
                <div className="flex h-9 gap-0.5" dir="rtl">
                  {ZONES.map((z, i) => (
                    <motion.div
                      key={z.label}
                      className={`flex origin-right items-center justify-center text-[11px] font-bold arabic-text ${
                        i === 1 ? 'bg-teal-prime text-navy-dark' : i === 2 ? 'bg-scout-blue text-white' : 'bg-white/15 text-ice-white'
                      }`}
                      style={{ width: `${z.pct}%` }}
                      initial={reduced ? false : { scaleX: 0 }}
                      animate={{ scaleX: on ? 1 : 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: t(3.3 + i * 0.15) }}
                    >
                      {z.label} {z.pct}
                    </motion.div>
                  ))}
                </div>
              </div>

              <p className="mt-6 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-ice-muted/80 arabic-text">
                الأرقام أعلاه أمثلة توضيحية لحقول النموذج، وليست بيانات لاعب أو مباراة حقيقية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
