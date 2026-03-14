import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import { computeDivisionHouse } from '../engine/computeDivisionHouse'
import WalkthroughScreen from './WalkthroughScreen'

interface Props {
  state: LDState
  dispatch: Dispatch<LDAction>
}

const houseData = computeDivisionHouse(84, 4)

// Narrations indexed by step. Bringdown steps auto-advance and have no narration needed.
const NARRATIONS = [
  'How many times does <strong>4</strong> go into <strong>8</strong>? The answer is <strong>2</strong>. Type it above.',
  'Now multiply: <strong>2 × 4 = 8</strong>. Type <strong>8</strong> below.',
  'Subtract: <strong>8 − 8 = 0</strong>. Type <strong>0</strong>.',
  '', // bringdown — auto
  'How many times does <strong>4</strong> go into <strong>4</strong>? That\'s <strong>1</strong>. Type it.',
  '<strong>1 × 4 = 4</strong>. Type <strong>4</strong>.',
  '<strong>4 − 4 = 0</strong>. Type <strong>0</strong>. We\'re done!',
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Screen4_Walkthrough84({ state: _state, dispatch }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 26, color: '#1E293B', margin: 0 }}>
        Let's Try: 84 ÷ 4
      </h2>
      <WalkthroughScreen
        dispatch={dispatch}
        houseData={houseData}
        narrations={NARRATIONS}
        completionText="Great job! 84 ÷ 4 = <strong>21</strong>"
      />
    </div>
  )
}
