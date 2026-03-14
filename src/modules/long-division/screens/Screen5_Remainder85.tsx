import { useState } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import { computeDivisionHouse } from '../engine/computeDivisionHouse'
import WalkthroughScreen from './WalkthroughScreen'

interface Props {
  state: LDState
  dispatch: Dispatch<LDAction>
}

const houseData = computeDivisionHouse(85, 4)

const NARRATIONS = [
  'How many times does <strong>4</strong> go into <strong>8</strong>? The answer is <strong>2</strong>. Type it.',
  'Multiply: <strong>2 × 4 = 8</strong>. Type <strong>8</strong>.',
  'Subtract: <strong>8 − 8 = 0</strong>. Type <strong>0</strong>.',
  '', // bringdown — auto
  'How many times does <strong>4</strong> go into <strong>5</strong>? The answer is <strong>1</strong>. Type it.',
  'Multiply: <strong>1 × 4 = 4</strong>. Type <strong>4</strong>.',
  'Subtract: <strong>5 − 4 = 1</strong>. Type <strong>1</strong>.',
]

const COMPLETION_TEXT =
  'We have <strong>1</strong> left over but no more digits to bring down. That\'s our <strong>remainder</strong>! 85 ÷ 4 = 21 R1'

const QC_OPTIONS = ['3', '3 R1', '4', '3 R2']
const QC_CORRECT = '3 R1'

function QuickCheck({ dispatch }: { dispatch: Dispatch<LDAction> }) {
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [wrongOpt, setWrongOpt] = useState<string | null>(null)

  const handleChoice = (opt: string) => {
    if (result === 'correct') return
    if (opt === QC_CORRECT) {
      setResult('correct')
      dispatch({ type: 'LESSON_INPUT_CORRECT' })
    } else {
      setWrongOpt(opt)
      setTimeout(() => setWrongOpt(null), 500)
      dispatch({ type: 'LESSON_INPUT_WRONG' })
    }
  }

  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ margin: 0, fontWeight: 700, color: '#334155', fontSize: 16 }}>
        Quick check: What is <strong>13 ÷ 4</strong>?
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {QC_OPTIONS.map(opt => {
          const isCorrectShown = result === 'correct' && opt === QC_CORRECT
          const isWrong = wrongOpt === opt
          return (
            <button
              key={opt}
              onClick={() => handleChoice(opt)}
              style={{
                background: isCorrectShown ? '#DCFCE7' : isWrong ? '#FEE2E2' : '#F1F5F9',
                border: `2px solid ${isCorrectShown ? '#22C55E' : isWrong ? '#EF4444' : '#E5DDD0'}`,
                borderRadius: 10,
                padding: '10px 20px',
                fontFamily: 'Quicksand, sans-serif',
                fontWeight: 700,
                fontSize: 17,
                cursor: result === 'correct' ? 'default' : 'pointer',
                transform: isWrong ? 'translateX(3px)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {result === 'correct' && (
        <p style={{ margin: 0, color: '#22C55E', fontWeight: 700 }}>Correct! 13 ÷ 4 = 3 R1</p>
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Screen5_Remainder85({ state: _state, dispatch }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 26, color: '#1E293B', margin: 0 }}>
        What About Remainders? — 85 ÷ 4
      </h2>
      <WalkthroughScreen
        dispatch={dispatch}
        houseData={houseData}
        narrations={NARRATIONS}
        completionText={COMPLETION_TEXT}
        completionExtra={<QuickCheck dispatch={dispatch} />}
      />
    </div>
  )
}
