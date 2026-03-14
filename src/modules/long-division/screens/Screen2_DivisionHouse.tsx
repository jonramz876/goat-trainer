import { useState, useEffect } from 'react'
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

const CALLOUTS = [
  { label: 'Divisor', x: -60, y: 0, color: '#3B82F6' },
  { label: 'Dividend', x: 60, y: -40, color: '#10B981' },
  { label: 'Quotient', x: 60, y: -80, color: '#F59E0B' },
]

const MC_OPTIONS = ['5', '20', '4']
const CORRECT = '20'

export default function Screen2_DivisionHouse({ dispatch }: Props) {
  const [calloutStep, setCalloutStep] = useState(0)
  const [mcResult, setMcResult] = useState<'correct' | 'wrong' | null>(null)
  const [mcShaking, setMcShaking] = useState<string | null>(null)

  // Auto-advance callouts every 1.2s
  useEffect(() => {
    if (calloutStep >= CALLOUTS.length) return
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

  const screenStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
    maxWidth: 580,
    width: '100%',
    fontFamily: 'Nunito, sans-serif',
  }

  return (
    <div style={screenStyle}>
      <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 28, color: '#1E293B', margin: 0 }}>
        Meet the Division House
      </h2>

      {/* House with callouts */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', padding: '40px 60px 20px' }}>
        <DivisionHouse
          houseData={houseData}
          currentStepIndex={houseData.steps.length}
          inputValue=""
          onInput={() => {}}
          staticMode={true}
        />

        {/* Callout labels */}
        {CALLOUTS.map((c, i) => (
          <div
            key={c.label}
            style={{
              position: 'absolute',
              top: `calc(50% + ${c.y}px)`,
              left: i === 0 ? '4px' : 'auto',
              right: i > 0 ? '4px' : 'auto',
              background: c.color,
              color: 'white',
              padding: '4px 12px',
              borderRadius: 20,
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              opacity: calloutStep > i ? 1 : 0,
              transform: calloutStep > i ? 'scale(1)' : 'scale(0.6)',
              transition: 'opacity 0.4s, transform 0.4s',
              whiteSpace: 'nowrap',
            }}
          >
            {c.label}
          </div>
        ))}
      </div>

      {/* Multiple choice check */}
      {calloutStep >= CALLOUTS.length && (
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
    </div>
  )
}
