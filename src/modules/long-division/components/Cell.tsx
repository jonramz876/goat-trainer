import { useRef, useEffect } from 'react'
import type { CellState } from '../engine/types'
import styles from './Cell.module.css'

interface CellProps {
  row: number
  col: number
  digit: string
  type: string
  state: CellState
  showMinus: boolean
  inputValue?: string
  spanCols?: number
  isRevealing?: boolean
}

export default function Cell({
  row,
  col,
  digit,
  type,
  state,
  showMinus,
  inputValue,
  spanCols,
  isRevealing,
}: CellProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state])

  const gridStyle: React.CSSProperties = {
    gridRow: row + 1,
    gridColumn: spanCols
      ? `${col + 1} / span ${spanCols}`
      : col + 1,
  }

  const stateClass = styles[state] ?? ''
  const typeClass = styles[type] ?? ''
  const revealClass = isRevealing ? styles.revealing : ''

  if (state === 'hidden') {
    return <div className={`${styles.cell} ${stateClass}`} style={gridStyle} />
  }

  if (state === 'input') {
    return (
      <div className={`${styles.cell} ${typeClass} ${stateClass}`} style={gridStyle}>
        {showMinus && <span className={styles.minus}>−</span>}
        <input
          ref={inputRef}
          className={styles.inputField}
          type="text"
          inputMode="none"
          value={inputValue ?? ''}
          readOnly
          autoComplete="off"
        />
      </div>
    )
  }

  return (
    <div
      className={`${styles.cell} ${typeClass} ${stateClass} ${revealClass}`}
      style={gridStyle}
    >
      {showMinus && <span className={styles.minus}>−</span>}
      {digit}
    </div>
  )
}
