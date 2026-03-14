import type { CellData, RuleData, StepData, ComputedHouse } from './types'

export function computeDivisionHouse(dividend: number, divisor: number): ComputedHouse {
  const digits = String(dividend).split('').map(Number)
  const D = digits.length

  const cells: CellData[] = []
  const rules: RuleData[] = []
  const steps: StepData[] = []

  // Fixed cells: divisor at (1, 0)
  cells.push({
    row: 1, col: 0, digit: String(divisor),
    type: 'divisor', stepIndex: -1, cycle: -1, showMinus: false,
  })

  // Fixed cells: dividend digits at (1, 2+i)
  for (let i = 0; i < D; i++) {
    cells.push({
      row: 1, col: 2 + i, digit: String(digits[i]),
      type: 'dividend', stepIndex: -1, cycle: -1, showMinus: false,
    })
  }

  // Determine leading digits for first divide
  let currentNumber = digits[0]
  let digitsUsed = 1
  while (currentNumber < divisor && digitsUsed < D) {
    digitsUsed++
    currentNumber = currentNumber * 10 + digits[digitsUsed - 1]
  }

  let quotientCol = 2 + digitsUsed - 1
  let nextDigitIndex = digitsUsed
  let cycle = 0
  let stepIndex = 0
  let quotientStr = ''
  let lastSubtractResult = 0

  // Main loop
  while (true) {
    // DIVIDE
    const quotientDigit = Math.floor(currentNumber / divisor)
    quotientStr += String(quotientDigit)

    const divideCell: CellData = {
      row: 0, col: quotientCol, digit: String(quotientDigit),
      type: 'quotient', stepIndex, cycle, showMinus: false,
    }
    cells.push(divideCell)

    steps.push({
      stepIndex,
      action: 'divide',
      cycle,
      cells: [{ row: 0, col: quotientCol, digit: String(quotientDigit) }],
      correctAnswer: String(quotientDigit),
      promptNumber: currentNumber,
      promptText: `How many times does ${divisor} go into ${currentNumber}?`,
      type: 'quotient',
    })
    stepIndex++

    // MULTIPLY
    const multiplyResult = quotientDigit * divisor
    const multiplyStr = String(multiplyResult)
    const multiplyCells: CellData[] = []

    for (let i = 0; i < multiplyStr.length; i++) {
      const cell: CellData = {
        row: 2 + cycle * 3,
        col: quotientCol - multiplyStr.length + 1 + i,
        digit: multiplyStr[i],
        type: 'multiply',
        stepIndex,
        cycle,
        showMinus: i === 0,
      }
      cells.push(cell)
      multiplyCells.push(cell)
    }

    steps.push({
      stepIndex,
      action: 'multiply',
      cycle,
      cells: multiplyCells.map(c => ({ row: c.row, col: c.col, digit: c.digit })),
      correctAnswer: String(multiplyResult),
      promptText: `${quotientDigit} × ${divisor}`,
      type: 'multiply',
    })
    stepIndex++

    // HORIZONTAL RULE
    rules.push({
      row: 3 + cycle * 3,
      fromCol: quotientCol - multiplyStr.length + 1,
      toCol: quotientCol,
    })

    // SUBTRACT
    const subtractResult = currentNumber - multiplyResult
    lastSubtractResult = subtractResult
    const subtractStr = String(subtractResult)

    const subtractCells: CellData[] = []
    for (let i = 0; i < subtractStr.length; i++) {
      const cell: CellData = {
        row: 4 + cycle * 3,
        col: quotientCol - subtractStr.length + 1 + i,
        digit: subtractStr[i],
        type: 'subtract',
        stepIndex,
        cycle,
        showMinus: false,
      }
      cells.push(cell)
      subtractCells.push(cell)
    }

    steps.push({
      stepIndex,
      action: 'subtract',
      cycle,
      cells: subtractCells.map(c => ({ row: c.row, col: c.col, digit: c.digit })),
      correctAnswer: String(subtractResult),
      promptText: `${currentNumber} − ${multiplyResult}`,
      type: 'subtract',
    })
    stepIndex++

    // BRING DOWN
    if (nextDigitIndex < D) {
      const broughtDigit = digits[nextDigitIndex]
      const bringDownCol = 2 + nextDigitIndex

      const bdCell: CellData = {
        row: 4 + cycle * 3,
        col: bringDownCol,
        digit: String(broughtDigit),
        type: 'bringdown',
        stepIndex,
        cycle,
        showMinus: false,
      }
      cells.push(bdCell)

      steps.push({
        stepIndex,
        action: 'bringdown',
        cycle,
        cells: [{ row: bdCell.row, col: bdCell.col, digit: bdCell.digit }],
        correctAnswer: String(broughtDigit),
        auto: true,
        type: 'bringdown',
      })
      stepIndex++

      currentNumber = subtractResult * 10 + broughtDigit
      quotientCol = bringDownCol
      nextDigitIndex++
      cycle++
    } else {
      // Done — subtractResult is remainder
      break
    }
  }

  return {
    cells,
    rules,
    totalRows: 2 + cycle * 3 + 3,
    totalCols: 2 + D,
    quotient: parseInt(quotientStr, 10),
    remainder: lastSubtractResult,
    steps,
  }
}
