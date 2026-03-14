import { useMemo } from 'react'
import type { ComputedHouse, CellState } from '../engine/types'
import { deriveCellStates } from '../engine/deriveCellStates'
import Cell from './Cell'
import Bracket from './Bracket'
import HorizontalRule from './HorizontalRule'
import BringDownArrow from './BringDownArrow'
import styles from './DivisionHouse.module.css'

interface DivisionHouseProps {
  houseData: ComputedHouse
  currentStepIndex: number
  inputValue: string
  onInput: (_value: string) => void
  staticMode?: boolean
  showRemainder?: boolean
  activeBringDown?: {
    fromRow: number
    fromCol: number
    toRow: number
    toCol: number
  } | null
}

export default function DivisionHouse({
  houseData,
  currentStepIndex,
  inputValue,
  onInput: _onInput,
  staticMode = false,
  showRemainder = false,
  activeBringDown = null,
}: DivisionHouseProps) {
  const cellWidth = 48
  const cellHeight = 56

  const cellStates = useMemo(() => {
    if (staticMode) {
      return houseData.cells.map(cell => ({
        ...cell,
        state: 'visible' as CellState,
      }))
    }
    return deriveCellStates(houseData, currentStepIndex)
  }, [houseData, currentStepIndex, staticMode])

  const visibleRuleRows = useMemo(() => {
    if (staticMode) return new Set(houseData.rules.map(r => r.row))
    const set = new Set<number>()
    for (const step of houseData.steps) {
      if (step.action === 'multiply' && step.stepIndex < currentStepIndex) {
        const multiplyRow = step.cells[0]?.row
        if (multiplyRow !== undefined) {
          set.add(multiplyRow + 1)
        }
      }
    }
    return set
  }, [houseData, currentStepIndex, staticMode])

  const visibleRows = useMemo(() => {
    if (staticMode) return houseData.totalRows
    let maxRow = 1
    for (const cs of cellStates) {
      if (cs.state !== 'hidden' && cs.row > maxRow) {
        maxRow = cs.row
      }
    }
    return maxRow + 1
  }, [cellStates, staticMode, houseData.totalRows])

  const currentStep = houseData.steps[currentStepIndex]
  const isMultiDigit = currentStep && currentStep.cells.length > 1 && !currentStep.auto

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${houseData.totalCols}, var(--cell-width, 48px))`,
    gridTemplateRows: `repeat(${houseData.totalRows}, var(--cell-height, 56px))`,
  }

  return (
    <div className={styles.houseContainer}>
      <div className={styles.grid} style={gridStyle}>
        {cellStates.map((cell) => {
          const isCurrentInput = cell.state === 'input'
          const spanCols = isCurrentInput && isMultiDigit ? currentStep.cells.length : undefined

          return (
            <Cell
              key={`${cell.row}-${cell.col}`}
              row={cell.row}
              col={isCurrentInput && isMultiDigit ? currentStep.cells[0].col : cell.col}
              digit={cell.digit}
              type={cell.type}
              state={cell.state}
              showMinus={cell.showMinus}
              inputValue={isCurrentInput ? inputValue : undefined}
              spanCols={spanCols}
            />
          )
        })}

        {houseData.rules.map((rule, i) => (
          <HorizontalRule
            key={`rule-${i}`}
            rule={rule}
            visible={visibleRuleRows.has(rule.row)}
          />
        ))}

        <Bracket
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          totalCols={houseData.totalCols}
          visibleRows={visibleRows}
        />

        {activeBringDown && (
          <BringDownArrow
            fromRow={activeBringDown.fromRow}
            fromCol={activeBringDown.fromCol}
            toRow={activeBringDown.toRow}
            toCol={activeBringDown.toCol}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            visible={true}
          />
        )}
      </div>

      {showRemainder && houseData.remainder > 0 && (
        <div className={styles.remainder}>R{houseData.remainder}</div>
      )}
    </div>
  )
}
