import styles from './Bracket.module.css'

interface BracketProps {
  cellWidth: number
  cellHeight: number
  totalCols: number
  visibleRows: number
}

export default function Bracket({ cellWidth, cellHeight, totalCols, visibleRows }: BracketProps) {
  const vertLeft = cellWidth * 2 - 3
  const vertTop = cellHeight
  const vertHeight = cellHeight * Math.max(1, visibleRows - 1)

  const horizLeft = cellWidth * 2
  const horizTop = cellHeight
  const horizWidth = cellWidth * (totalCols - 2)

  const cornerLeft = vertLeft - 3
  const cornerTop = vertTop - 3

  return (
    <div className={styles.bracketContainer}>
      <div
        className={styles.verticalBar}
        style={{ left: `${vertLeft}px`, top: `${vertTop}px`, height: `${vertHeight}px` }}
      />
      <div
        className={styles.horizontalBar}
        style={{ left: `${horizLeft}px`, top: `${horizTop}px`, width: `${horizWidth}px` }}
      />
      <div
        className={styles.corner}
        style={{ left: `${cornerLeft}px`, top: `${cornerTop}px` }}
      />
    </div>
  )
}
