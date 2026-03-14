import { describe, it, expect } from 'vitest'
import { deriveCellStates } from './deriveCellStates'
import { computeDivisionHouse } from './computeDivisionHouse'
import type { CellState } from './types'

describe('deriveCellStates', () => {
  const house = computeDivisionHouse(1248, 6)

  it('hides all work cells at step 0', () => {
    const states = deriveCellStates(house, 0)
    const step0 = states.filter(s => s.state === 'input')
    expect(step0.length).toBeGreaterThan(0)

    const futureWork = states.filter(s =>
      s.stepIndex > 0 && s.stepIndex !== -1
    )
    futureWork.forEach(s => expect(s.state).toBe('hidden'))
  })

  it('shows completed cells as visible', () => {
    const states = deriveCellStates(house, 2)
    const step0 = states.filter(s => s.stepIndex === 0)
    step0.forEach(s => expect(s.state).toBe('visible'))
  })

  it('dims old cycle cells', () => {
    const states = deriveCellStates(house, 8)
    const cycle0Cells = states.filter(s => s.cycle === 0 && s.stepIndex >= 0)
    cycle0Cells.forEach(s => expect(s.state).toBe('dimmed'))
  })

  it('keeps adjacent cycle cells visible (not dimmed)', () => {
    const states = deriveCellStates(house, 8)
    const cycle1Cells = states.filter(s => s.cycle === 1 && s.stepIndex >= 0 && s.stepIndex < 8)
    cycle1Cells.forEach(s => expect(s.state).toBe('visible'))
  })

  it('always shows dividend and divisor as visible', () => {
    const states = deriveCellStates(house, 0)
    const fixed = states.filter(s => s.type === 'dividend' || s.type === 'divisor')
    fixed.forEach(s => expect(s.state).toBe('visible'))
  })
})
