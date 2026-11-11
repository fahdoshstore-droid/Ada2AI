import { describe, it, expect } from 'vitest'
import {
  PILLARS, TOTAL_CRITERIA, emptyDraft, emptyRatings, missingCriteria, pillarPercent,
  ratedCount, sanitizeRatings, totalScore, validateDraft, type ReportRatings,
} from './scoutReport'

/** Ratings from the reference paper form (غيث القرشي) — its printed total is 70. */
function referenceRatings(): ReportRatings {
  const rows: Record<string, number[]> = {
    technical: [3, 3, 4, 4, 3, 3, 3, 5],
    tactical: [3, 4, 4, 4, 4, 3, 3, 3],
    physical: [5, 3, 3, 3, 4, 3, 4, 3],
    mental: [4, 4, 3, 4, 4, 3, 3, 3],
  }
  const r = emptyRatings()
  for (const p of PILLARS) p.criteria.forEach((c, i) => { r[p.key][c.key] = rows[p.key][i] })
  return r
}

describe('scout report model', () => {
  it('has four pillars of eight criteria with unique keys', () => {
    expect(PILLARS.map(p => p.key)).toEqual(['technical', 'tactical', 'physical', 'mental'])
    for (const p of PILLARS) {
      expect(p.criteria).toHaveLength(8)
      expect(new Set(p.criteria.map(c => c.key)).size).toBe(8)
    }
    expect(TOTAL_CRITERIA).toBe(32)
  })

  it('reproduces the paper form total of 70%', () => {
    const r = referenceRatings()
    expect(totalScore(r)).toBe(70)
    expect(PILLARS.map(p => pillarPercent(p, r[p.key]))).toEqual([70, 70, 70, 70])
    expect(ratedCount(r)).toBe(32)
    expect(missingCriteria(r)).toEqual([])
  })

  it('scores the extremes and an empty report', () => {
    const all = (v: number) => {
      const r = emptyRatings()
      for (const p of PILLARS) for (const c of p.criteria) r[p.key][c.key] = v
      return r
    }
    expect(totalScore(all(5))).toBe(100)
    expect(totalScore(all(1))).toBe(20)
    expect(totalScore(emptyRatings())).toBe(0)
    expect(missingCriteria(emptyRatings())).toHaveLength(32)
  })

  it('sanitizes out-of-range, non-integer and unknown ratings', () => {
    const dirty = { technical: { short_pass: 9, long_pass: 2.5, shooting: 4, hacked: 5 }, bogus: { x: 1 } } as never
    const clean = sanitizeRatings(dirty)
    expect(clean.technical).toEqual({ shooting: 4 })
    expect(clean.tactical).toEqual({})
    expect(sanitizeRatings(null)).toEqual(emptyRatings())
  })

  it('validates required fields', () => {
    const d = emptyDraft('2026-04-10')
    expect(validateDraft(d, 2026)).toEqual(['player_name', 'position', 'scout_name', 'ratings'])

    const ok = { ...d, player_name: 'غيث القرشي', birth_year: 2010, position: 'محور', scout_name: 'بدر الجناحي', ratings: referenceRatings() }
    expect(validateDraft(ok, 2026)).toEqual([])
    expect(validateDraft({ ...ok, birth_year: 2030 }, 2026)).toEqual(['birth_year'])
    expect(validateDraft({ ...ok, discovery_date: '4/10/2026' }, 2026)).toEqual(['discovery_date'])
  })
})
