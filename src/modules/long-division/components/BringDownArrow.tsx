import { useEffect, useState } from 'react'

interface BringDownArrowProps {
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
  cellWidth: number
  cellHeight: number
  visible: boolean
}

export default function BringDownArrow({
  fromRow,
  fromCol,
  toRow,
  toCol,
  cellWidth,
  cellHeight,
  visible,
}: BringDownArrowProps) {
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    if (visible) {
      setDrawn(false)
      requestAnimationFrame(() => setDrawn(true))
    }
  }, [visible])

  if (!visible) return null

  const x1 = (fromCol + 0.5) * cellWidth
  const y1 = (fromRow + 1) * cellHeight
  const x2 = (toCol + 0.5) * cellWidth
  const y2 = toRow * cellHeight

  const midY = (y1 + y2) / 2
  const path = `M ${x1} ${y1} C ${x1 + 20} ${midY}, ${x2 + 20} ${midY}, ${x2} ${y2}`
  const pathLength = 200

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="#A855F7"
        strokeWidth={2}
        strokeDasharray={pathLength}
        strokeDashoffset={drawn ? 0 : pathLength}
        style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#A855F7" />
        </marker>
      </defs>
    </svg>
  )
}
