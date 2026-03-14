import { useState, useRef } from 'react'
import styles from './CookieAnimation.module.css'

interface CookieAnimationProps {
  onComplete: () => void
}

// 12 cookies, 3 groups of 4
// Initial positions: 4 per row, 3 rows at top
const INITIAL_POSITIONS: { x: number; y: number }[] = [
  { x: 90, y: 50 },  { x: 190, y: 50 },  { x: 290, y: 50 },  { x: 390, y: 50 },
  { x: 90, y: 110 }, { x: 190, y: 110 }, { x: 290, y: 110 }, { x: 390, y: 110 },
  { x: 90, y: 170 }, { x: 190, y: 170 }, { x: 290, y: 170 }, { x: 390, y: 170 },
]

// Group centers (bottom boxes) — 3 groups
const GROUP_CENTERS: { x: number; y: number }[] = [
  { x: 100, y: 285 },
  { x: 270, y: 285 },
  { x: 440, y: 285 },
]

// Assign each cookie to a group (round-robin)
const COOKIE_GROUPS: number[] = [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2]

// Landing spots within each group: 4 slots
const GROUP_OFFSETS: { dx: number; dy: number }[][] = [
  [{ dx: -24, dy: -12 }, { dx: 4, dy: -12 }, { dx: -24, dy: 12 }, { dx: 4, dy: 12 }],
  [{ dx: -24, dy: -12 }, { dx: 4, dy: -12 }, { dx: -24, dy: 12 }, { dx: 4, dy: 12 }],
  [{ dx: -24, dy: -12 }, { dx: 4, dy: -12 }, { dx: -24, dy: 12 }, { dx: 4, dy: 12 }],
]

export default function CookieAnimation({ onComplete }: CookieAnimationProps) {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(INITIAL_POSITIONS)
  const [landed, setLanded] = useState<boolean[]>(new Array(12).fill(false))
  const [counters, setCounters] = useState<number[]>([0, 0, 0])
  const [animating, setAnimating] = useState(false)
  const [done, setDone] = useState(false)
  const groupSlotCount = useRef([0, 0, 0])

  const handleWatch = () => {
    if (animating || done) return
    setAnimating(true)

    // Animate cookies one by one with 400ms delay each
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const groupIdx = COOKIE_GROUPS[i]
        const slotIdx = groupSlotCount.current[groupIdx]
        groupSlotCount.current[groupIdx]++

        const center = GROUP_CENTERS[groupIdx]
        const offset = GROUP_OFFSETS[groupIdx][slotIdx] ?? { dx: 0, dy: 0 }
        const targetX = center.x + offset.dx
        const targetY = center.y + offset.dy

        setPositions(prev => {
          const next = [...prev]
          next[i] = { x: targetX, y: targetY }
          return next
        })

        setLanded(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })

        setCounters(prev => {
          const next = [...prev]
          next[groupIdx] = next[groupIdx] + 1
          return next
        })

        if (i === 11) {
          setTimeout(() => {
            setDone(true)
            setAnimating(false)
            onComplete()
          }, 400)
        }
      }, i * 400)
    }
  }

  return (
    <div className={styles.container}>
      <svg
        className={styles.svg}
        viewBox="0 0 560 340"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Group boxes */}
        {GROUP_CENTERS.map((gc, gi) => (
          <g key={`group-${gi}`}>
            <rect
              x={gc.x - 50}
              y={gc.y - 32}
              width={100}
              height={64}
              rx={10}
              fill="#FEF3C7"
              stroke="#F59E0B"
              strokeWidth={2}
            />
            <text
              x={gc.x}
              y={gc.y - 36}
              textAnchor="middle"
              fontSize={13}
              fontFamily="Nunito, sans-serif"
              fontWeight="700"
              fill="#92400E"
            >
              Group {gi + 1}
            </text>
            {/* Counter badge */}
            {done && (
              <text
                x={gc.x}
                y={gc.y + 6}
                textAnchor="middle"
                fontSize={22}
                fontFamily="Quicksand, sans-serif"
                fontWeight="700"
                fill="#D97706"
              >
                {counters[gi]}
              </text>
            )}
          </g>
        ))}

        {/* Cookies */}
        {positions.map((pos, i) => (
          <g
            key={`cookie-${i}`}
            style={{
              transition: landed[i] ? 'transform 0.4s ease-in-out' : 'none',
              transform: `translate(${pos.x - INITIAL_POSITIONS[i].x}px, ${pos.y - INITIAL_POSITIONS[i].y}px)`,
            }}
          >
            <circle
              cx={INITIAL_POSITIONS[i].x}
              cy={INITIAL_POSITIONS[i].y}
              r={18}
              fill="#D4890E"
              stroke="#A0680A"
              strokeWidth={2}
            />
            <circle
              cx={INITIAL_POSITIONS[i].x - 5}
              cy={INITIAL_POSITIONS[i].y - 4}
              r={3}
              fill="#7C4A00"
            />
            <circle
              cx={INITIAL_POSITIONS[i].x + 6}
              cy={INITIAL_POSITIONS[i].y + 3}
              r={3}
              fill="#7C4A00"
            />
          </g>
        ))}
      </svg>

      <button
        className={styles.watchBtn}
        onClick={handleWatch}
        disabled={animating || done}
      >
        {done ? 'Done!' : animating ? 'Distributing...' : 'Watch'}
      </button>
    </div>
  )
}
