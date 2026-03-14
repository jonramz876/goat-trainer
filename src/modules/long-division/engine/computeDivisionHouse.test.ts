import { describe, it, expect } from 'vitest'
import { computeDivisionHouse } from './computeDivisionHouse'
import type { CellData } from './types'

function findCell(cells: CellData[], row: number, col: number): CellData | undefined {
  return cells.find(c => c.row === row && c.col === col)
}

describe('computeDivisionHouse', () => {
  describe('12 ÷ 3 = 4 (single cycle, Screen 2 example)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(12, 3)
      expect(result.quotient).toBe(4)
      expect(result.remainder).toBe(0)
    })

    it('places divisor and dividend correctly', () => {
      const result = computeDivisionHouse(12, 3)
      expect(findCell(result.cells, 1, 0)?.digit).toBe('3')
      expect(findCell(result.cells, 1, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 1, 3)?.digit).toBe('2')
    })

    it('places quotient at correct column', () => {
      const result = computeDivisionHouse(12, 3)
      expect(findCell(result.cells, 0, 3)?.digit).toBe('4')
    })

    it('has correct grid dimensions', () => {
      const result = computeDivisionHouse(12, 3)
      expect(result.totalCols).toBe(4)
      expect(result.totalRows).toBe(5)
    })
  })

  describe('84 ÷ 4 = 21 (Screen 4: two cycles, no remainder)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(84, 4)
      expect(result.quotient).toBe(21)
      expect(result.remainder).toBe(0)
    })

    it('places all cells correctly', () => {
      const result = computeDivisionHouse(84, 4)
      expect(findCell(result.cells, 1, 0)?.digit).toBe('4')
      expect(findCell(result.cells, 1, 2)?.digit).toBe('8')
      expect(findCell(result.cells, 1, 3)?.digit).toBe('4')
      expect(findCell(result.cells, 0, 2)?.digit).toBe('2')
      expect(findCell(result.cells, 2, 2)?.digit).toBe('8')
      expect(findCell(result.cells, 4, 2)?.digit).toBe('0')
      expect(findCell(result.cells, 4, 3)?.digit).toBe('4')
      expect(findCell(result.cells, 4, 3)?.type).toBe('bringdown')
      expect(findCell(result.cells, 0, 3)?.digit).toBe('1')
      expect(findCell(result.cells, 5, 3)?.digit).toBe('4')
      expect(findCell(result.cells, 7, 3)?.digit).toBe('0')
    })

    it('has correct rules', () => {
      const result = computeDivisionHouse(84, 4)
      expect(result.rules).toContainEqual({ row: 3, fromCol: 2, toCol: 2 })
      expect(result.rules).toContainEqual({ row: 6, fromCol: 3, toCol: 3 })
    })

    it('has correct grid dimensions', () => {
      const result = computeDivisionHouse(84, 4)
      expect(result.totalCols).toBe(4)
      expect(result.totalRows).toBe(8)
    })

    it('generates correct step sequence', () => {
      const result = computeDivisionHouse(84, 4)
      const actions = result.steps.map(s => s.action)
      expect(actions).toEqual([
        'divide', 'multiply', 'subtract', 'bringdown',
        'divide', 'multiply', 'subtract',
      ])
    })
  })

  describe('85 ÷ 4 = 21 R1 (Screen 5: two cycles, with remainder)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(85, 4)
      expect(result.quotient).toBe(21)
      expect(result.remainder).toBe(1)
    })

    it('places final subtract result as 1', () => {
      const result = computeDivisionHouse(85, 4)
      expect(findCell(result.cells, 7, 3)?.digit).toBe('1')
    })
  })

  describe('72 ÷ 3 = 24 (Guided Example 1)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(72, 3)
      expect(result.quotient).toBe(24)
      expect(result.remainder).toBe(0)
    })

    it('places all cells correctly', () => {
      const result = computeDivisionHouse(72, 3)
      expect(findCell(result.cells, 0, 2)?.digit).toBe('2')
      expect(findCell(result.cells, 2, 2)?.digit).toBe('6')
      expect(findCell(result.cells, 4, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 4, 3)?.digit).toBe('2')
      expect(findCell(result.cells, 0, 3)?.digit).toBe('4')
      expect(findCell(result.cells, 5, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 5, 3)?.digit).toBe('2')
      expect(findCell(result.cells, 7, 3)?.digit).toBe('0')
    })

    it('has rules at correct positions', () => {
      const result = computeDivisionHouse(72, 3)
      expect(result.rules).toContainEqual({ row: 3, fromCol: 2, toCol: 2 })
      expect(result.rules).toContainEqual({ row: 6, fromCol: 2, toCol: 3 })
    })
  })

  describe('95 ÷ 4 = 23 R3 (Guided Example 2)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(95, 4)
      expect(result.quotient).toBe(23)
      expect(result.remainder).toBe(3)
    })

    it('places remainder digit correctly', () => {
      const result = computeDivisionHouse(95, 4)
      expect(findCell(result.cells, 7, 3)?.digit).toBe('3')
    })
  })

  describe('1248 ÷ 6 = 208 (Screen 6: three cycles, zero in quotient)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(result.quotient).toBe(208)
      expect(result.remainder).toBe(0)
    })

    it('handles leading digits correctly (6 > 1, uses two digits)', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(findCell(result.cells, 0, 3)?.digit).toBe('2')
    })

    it('places zero in quotient for cycle 1', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(findCell(result.cells, 0, 4)?.digit).toBe('0')
    })

    it('places all cycle cells correctly', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(findCell(result.cells, 2, 2)?.digit).toBe('1')
      expect(findCell(result.cells, 2, 3)?.digit).toBe('2')
      expect(findCell(result.cells, 4, 3)?.digit).toBe('0')
      expect(findCell(result.cells, 4, 4)?.digit).toBe('4')
      expect(findCell(result.cells, 5, 4)?.digit).toBe('0')
      expect(findCell(result.cells, 7, 4)?.digit).toBe('4')
      expect(findCell(result.cells, 7, 5)?.digit).toBe('8')
      expect(findCell(result.cells, 8, 4)?.digit).toBe('4')
      expect(findCell(result.cells, 8, 5)?.digit).toBe('8')
      expect(findCell(result.cells, 10, 5)?.digit).toBe('0')
    })

    it('has correct grid dimensions', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(result.totalCols).toBe(6)
      expect(result.totalRows).toBe(11)
    })

    it('marks cycle on each cell', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(findCell(result.cells, 0, 3)?.cycle).toBe(0)
      expect(findCell(result.cells, 2, 2)?.cycle).toBe(0)
      expect(findCell(result.cells, 0, 4)?.cycle).toBe(1)
      expect(findCell(result.cells, 5, 4)?.cycle).toBe(1)
      expect(findCell(result.cells, 0, 5)?.cycle).toBe(2)
      expect(findCell(result.cells, 8, 4)?.cycle).toBe(2)
    })

    it('marks showMinus only on leftmost multiply cell per cycle', () => {
      const result = computeDivisionHouse(1248, 6)
      expect(findCell(result.cells, 2, 2)?.showMinus).toBe(true)
      expect(findCell(result.cells, 2, 3)?.showMinus).toBe(false)
      expect(findCell(result.cells, 8, 4)?.showMinus).toBe(true)
      expect(findCell(result.cells, 8, 5)?.showMinus).toBe(false)
    })
  })

  describe('738 ÷ 6 = 123 (Guided Example 3)', () => {
    it('returns correct quotient and remainder', () => {
      const result = computeDivisionHouse(738, 6)
      expect(result.quotient).toBe(123)
      expect(result.remainder).toBe(0)
    })

    it('has 9 steps (3 cycles × 3 + 2 bringdowns)', () => {
      const result = computeDivisionHouse(738, 6)
      expect(result.steps).toHaveLength(11)
      const actions = result.steps.map(s => s.action)
      expect(actions).toEqual([
        'divide', 'multiply', 'subtract', 'bringdown',
        'divide', 'multiply', 'subtract', 'bringdown',
        'divide', 'multiply', 'subtract',
      ])
    })

    it('marks bringdown steps as auto', () => {
      const result = computeDivisionHouse(738, 6)
      const bringdowns = result.steps.filter(s => s.action === 'bringdown')
      expect(bringdowns).toHaveLength(2)
      bringdowns.forEach(b => expect(b.auto).toBe(true))
    })
  })

  describe('edge case: 63 ÷ 7 = 9 (single cycle, no bringdown)', () => {
    it('returns correct result', () => {
      const result = computeDivisionHouse(63, 7)
      expect(result.quotient).toBe(9)
      expect(result.remainder).toBe(0)
    })

    it('has only 3 steps (no bringdown)', () => {
      const result = computeDivisionHouse(63, 7)
      const actions = result.steps.map(s => s.action)
      expect(actions).toEqual(['divide', 'multiply', 'subtract'])
    })
  })

  describe('step data correctAnswer field', () => {
    it('has correct answers for 72÷3', () => {
      const result = computeDivisionHouse(72, 3)
      const nonAuto = result.steps.filter(s => !s.auto)
      expect(nonAuto[0].correctAnswer).toBe('2')
      expect(nonAuto[1].correctAnswer).toBe('6')
      expect(nonAuto[2].correctAnswer).toBe('1')
      expect(nonAuto[3].correctAnswer).toBe('4')
      expect(nonAuto[4].correctAnswer).toBe('12')
      expect(nonAuto[5].correctAnswer).toBe('0')
    })
  })
})
