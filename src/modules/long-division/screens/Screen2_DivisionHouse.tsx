import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import { computeDivisionHouse } from '../engine/computeDivisionHouse'
import DivisionHouse from '../components/DivisionHouse'

interface Props {
  state: LDState
  dispatch: Dispatch<LDAction>
}

const houseData = computeDivisionHouse(12, 3)

const CALLOUT_DEFS = [
  { label: 'Divisor', color: '#3B82F6', side: 'left' as const, gridRow: 1, gridCol: 0 },
  { label: 'Dividend', color: '#10B981', side: 'right' as const, gridRow: 1, gridCol: 2.5 },
  { label: 'Quotient', color: '#F59E0B', side: 'right' as const, gridRow: 0, gridCol: 3 },
]

const MC_OPTIONS = ['5', '20', '4']
const CORRECT = '20'

interface ArrowPos {
  labelX: number
  labelY: number
  arrowFromX: number
  arrowToX: number
  arrowY: number
}

export default function Screen2_DivisionHouse({ state, dispatch }: Props) {
  const [calloutStep, setCalloutStep] = useState(0)
  const [mcResult, setMcResult] = useState<'correct' | 'wrong' | null>(null)
  const [mcShaking, setMcShaking] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [arrows, setArrows] = useState<ArrowPos[]>([])

  // Measure grid cell positions after mount
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const grid = wrapper.querySelector('[class*="grid"]') as HTMLElement
    if (!grid) return

    const wrapperRect = wrapper.getBoundingClientRect()
    const gridRect = grid.getBoundingClientRect()
    const gridLeft = gridRect.left - wrapperRect.left
    const gridTop = gridRect.top - wrapperRect.top
    const cellW = gridRect.width / houseData.totalCols
    const cellH = gridRect.height / houseData.totalRows
    const wW = wrapperRect.width

    const newArrows: ArrowPos[] = CALLOUT_DEFS.map(def => {
      const cellCenterX = gridLeft + def.gridCol * cellW + cellW / 2
      const cellCenterY = gridTop + def.gridRow * cellH + cellH / 2

      if (def.side === 'left') {
        return {
          labelX: 8,
          labelY: cellCenterY,
          arrowFromX: 80,
          arrowToX: cellCenterX - cellW * 0.6,
          arrowY: cellCenterY,
        }
      } else {
        return {
          labelX: wW - 8,
          labelY: cellCenterY,
          arrowFromX: wW - 80,
          arrowToX: cellCenterX + cellW * 0.6,
          arrowY: cellCenterY,
        }
      }
    })

    setArrows(newArrows)
  }, [])

  // Auto-advance callouts every 1.2s
  useEffect(() => {
    if (calloutStep >= CALLOUT_DEFS.length) return
    const t = setTimeout(() => setCalloutStep(c => c + 1), 1200)
    return () => clearTimeout(t)
  }, [calloutStep])

  const handleMC = (choice: string) => {
    if (mcResult === 'correct') return
    if (choice === CORRECT) {
      setMcResult('correct')
      dispatch({ type: 'LESSON_INPUT_CORRECT' })
    } else {
      setMcShaking(choice)
      setTimeout(() => setMcShaking(null), 500)
      dispatch({ type: 'LESSON_INPUT_WRONG' })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 580, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 28, color: '#1E293B', margin: 0 }}>
        Meet the Division House
      </h2>

      {/* House with callout arrows */}
      <div ref={wrapperRef} style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '20px 100px' }}>
        <DivisionHouse
          houseData={houseData}
          currentStepIndex={houseData.steps.length}
          inputValue=""
          onInput={() => {}}
          staticMode={true}
        />

        {/* SVG arrow lines */}
        {arrows.length > 0 && (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
            <defs>
              {CALLOUT_DEFS.map(def => (
                <marker
                  key={`arrow-${def.label}`}
                  id={`arrow-${def.label}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={def.color} />
                </marker>
              ))}
            </defs>
            {arrows.map((pos, i) => (
              <line
                key={CALLOUT_DEFS[i].label}
                x1={pos.arrowFromX}
                y1={pos.arrowY}
                x2={pos.arrowToX}
                y2={pos.arrowY}
                stroke={CALLOUT_DEFS[i].color}
                strokeWidth="2.5"
                markerEnd={`url(#arrow-${CALLOUT_DEFS[i].label})`}
                opacity={calloutStep > i ? 1 : 0}
                style={{ transition: 'opacity 0.4s' }}
              />
            ))}
          </svg>
        )}

        {/* Callout label pills */}
        {arrows.length > 0 && CALLOUT_DEFS.map((def, i) => (
          <div
            key={def.label}
            style={{
              position: 'absolute',
              top: arrows[i].labelY,
              left: def.side === 'left' ? arrows[i].labelX : 'auto',
              right: def.side === 'right' ? 8 : 'auto',
              transform: 'translateY(-50%)',
              background: def.color,
              color: 'white',
              padding: '4px 14px',
              borderRadius: 20,
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              opacity: calloutStep > i ? 1 : 0,
              transformOrigin: def.side === 'left' ? 'left center' : 'right center',
              transition: 'opacity 0.4s',
              whiteSpace: 'nowrap',
            }}
          >
            {def.label}
          </div>
        ))}
      </div>

      {/* Multiple choice check */}
      {calloutStep >= CALLOUT_DEFS.length && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 17, color: '#334155', fontWeight: 600, margin: 0 }}>
            In <strong>20 ÷ 5 = 4</strong>, which number is the <em>dividend</em>?
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {MC_OPTIONS.map(opt => {
              let bg = '#F1F5F9'
              let border = '2px solid #E5DDD0'
              let color = '#334155'
              if (mcResult === 'correct' && opt === CORRECT) {
                bg = '#DCFCE7'; border = '2px solid #22C55E'; color = '#166534'
              } else if (mcShaking === opt) {
                bg = '#FEE2E2'; border = '2px solid #EF4444'
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleMC(opt)}
                  style={{
                    background: bg,
                    border,
                    color,
                    borderRadius: 10,
                    padding: '12px 28px',
                    fontFamily: 'Quicksand, sans-serif',
                    fontWeight: 700,
                    fontSize: 20,
                    cursor: mcResult === 'correct' ? 'default' : 'pointer',
                    transform: mcShaking === opt ? 'translateX(4px)' : 'none',
                    transition: 'transform 0.1s, background 0.2s',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
          {mcResult === 'correct' && (
            <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 16, margin: 0 }}>
              Correct! 20 is the number being divided — the dividend.
            </p>
          )}
          {mcResult !== 'correct' && mcShaking && (
            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: 15, margin: 0 }}>
              Try again!
            </p>
          )}
        </div>
      )}

      {/* Skip to practice link */}
      {!state.lessonCompleted && (
        <p style={{ fontSize: 14, color: '#94A3B8', marginTop: 8 }}>
          Already know long division?{' '}
          <button
            onClick={() => dispatch({ type: 'SKIP_LESSON' })}
            style={{
              background: 'none',
              border: 'none',
              color: '#F59E0B',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Skip to practice
          </button>
        </p>
      )}
    </div>
  )
}
