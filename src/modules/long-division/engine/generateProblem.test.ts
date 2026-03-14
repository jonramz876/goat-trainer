import { describe, it, expect } from 'vitest'
import { generateProblem, FALLBACK_PROBLEMS } from './generateProblem'
import type { Problem } from './types'

describe('generateProblem', () => {
  describe('Tier 1: 2-digit ÷ 1-digit, no remainder', () => {
    it('generates valid problems', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(1, [])
        expect(p.dividend).toBeGreaterThanOrEqual(10)
        expect(p.dividend).toBeLessThanOrEqual(99)
        expect(p.divisor).toBeGreaterThanOrEqual(2)
        expect(p.divisor).toBeLessThanOrEqual(9)
        expect(p.remainder).toBe(0)
        expect(p.quotient).toBe(Math.floor(p.dividend / p.divisor))
      }
    })

    it('never produces zero in quotient', () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem(1, [])
        expect(String(p.quotient)).not.toContain('0')
      }
    })
  })

  describe('Tier 2: 2-digit ÷ 1-digit, with remainder', () => {
    it('always has a remainder', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(2, [])
        expect(p.remainder).toBeGreaterThan(0)
      }
    })

    it('never produces zero in quotient', () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem(2, [])
        expect(String(p.quotient)).not.toContain('0')
      }
    })
  })

  describe('Tier 3: 3-digit ÷ 1-digit, no remainder', () => {
    it('generates 3-digit dividends', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(3, [])
        expect(p.dividend).toBeGreaterThanOrEqual(100)
        expect(p.dividend).toBeLessThanOrEqual(999)
        expect(p.remainder).toBe(0)
      }
    })

    it('never produces zero in quotient', () => {
      for (let i = 0; i < 50; i++) {
        const p = generateProblem(3, [])
        expect(String(p.quotient)).not.toContain('0')
      }
    })
  })

  describe('Tier 4: 3-digit ÷ 1-digit, with remainder', () => {
    it('always has a remainder', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(4, [])
        expect(p.remainder).toBeGreaterThan(0)
      }
    })
  })

  describe('Tier 5: 3-4 digit, may have zero in quotient', () => {
    it('generates 3-4 digit dividends', () => {
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(5, [])
        expect(p.dividend).toBeGreaterThanOrEqual(100)
        expect(p.dividend).toBeLessThanOrEqual(9999)
      }
    })
  })

  describe('deduplication', () => {
    it('avoids recent problems', () => {
      const recent = [
        { dividend: 84, divisor: 4 },
        { dividend: 63, divisor: 7 },
      ]
      let dupeCount = 0
      for (let i = 0; i < 20; i++) {
        const p = generateProblem(1, recent)
        if (recent.some(r => r.dividend === p.dividend && r.divisor === p.divisor)) {
          dupeCount++
        }
      }
      expect(dupeCount).toBeLessThan(5)
    })
  })

  describe('fallback problems', () => {
    it('has valid fallbacks for all 5 tiers', () => {
      for (let tier = 1; tier <= 5; tier++) {
        const fb = FALLBACK_PROBLEMS[tier]
        expect(fb).toBeDefined()
        expect(fb.quotient).toBe(Math.floor(fb.dividend / fb.divisor))
        expect(fb.remainder).toBe(fb.dividend % fb.divisor)
      }
    })
  })
})
