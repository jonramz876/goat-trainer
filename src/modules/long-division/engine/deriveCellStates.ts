import type { ComputedHouse, CellData, CellState } from './types'

export interface CellWithState extends CellData {
  state: CellState
}

export function deriveCellStates(
  houseData: ComputedHouse,
  currentStepIndex: number,
): CellWithState[] {
  const currentStep = houseData.steps[currentStepIndex]
  const currentCycle = currentStep?.cycle ?? 0

  return houseData.cells.map(cell => {
    // Fixed cells (divisor, dividend) are always visible
    if (cell.stepIndex === -1) {
      return { ...cell, state: 'visible' as CellState }
    }

    if (cell.stepIndex > currentStepIndex) {
      return { ...cell, state: 'hidden' as CellState }
    }

    if (cell.stepIndex < currentStepIndex) {
      // Dim cells from cycles more than 1 behind
      const dimmed = currentCycle - cell.cycle > 1
      return { ...cell, state: (dimmed ? 'dimmed' : 'visible') as CellState }
    }

    // cell.stepIndex === currentStepIndex
    return { ...cell, state: 'input' as CellState }
  })
}
