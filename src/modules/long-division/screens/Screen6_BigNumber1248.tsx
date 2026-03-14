import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import { computeDivisionHouse } from '../engine/computeDivisionHouse'
import WalkthroughScreen from './WalkthroughScreen'

interface Props {
  state: LDState
  dispatch: Dispatch<LDAction>
}

// 1248 ÷ 6 = 208
const houseData = computeDivisionHouse(1248, 6)

// Steps: divide(12÷6=2), multiply(2×6=12), subtract(12-12=0), bringdown(4),
//        divide(04÷6=0), multiply(0×6=0), subtract(4-0=4), bringdown(8),
//        divide(48÷6=8), multiply(8×6=48), subtract(48-48=0)
const NARRATIONS = [
  // Cycle 1 (full narration)
  'How many times does <strong>6</strong> go into <strong>12</strong>? The answer is <strong>2</strong>. Type it.',
  'Multiply: <strong>2 × 6 = 12</strong>. Type <strong>12</strong>.',
  'Subtract: <strong>12 − 12 = 0</strong>. Type <strong>0</strong>.',
  '', // bringdown — auto
  // Cycle 2 (zero in quotient)
  '<strong>6</strong> can\'t go into <strong>4</strong>, so we write <strong>0</strong>. This is okay! Type <strong>0</strong>.',
  'Multiply: <strong>0 × 6 = 0</strong>. Type <strong>0</strong>.',
  'Subtract: <strong>4 − 0 = 4</strong>. Type <strong>4</strong>.',
  '', // bringdown — auto
  // Cycle 3 (accelerated)
  '<strong>6</strong> goes into <strong>48</strong> exactly <strong>8</strong> times. Type <strong>8</strong>.',
  'Multiply: <strong>8 × 6 = 48</strong>. Type <strong>48</strong>.',
  'Subtract: <strong>48 − 48 = 0</strong>. Type <strong>0</strong>. Done!',
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Screen6_BigNumber1248({ state: _state, dispatch }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 26, color: '#1E293B', margin: 0 }}>
        A Bigger Number — 1248 ÷ 6
      </h2>
      <p style={{ margin: 0, fontSize: 15, color: '#64748B' }}>
        Watch out for cycle 2 — sometimes a digit is <em>too small</em> for the divisor!
      </p>
      <WalkthroughScreen
        dispatch={dispatch}
        houseData={houseData}
        narrations={NARRATIONS}
        completionText="Excellent! 1248 ÷ 6 = <strong>208</strong>. Notice the zero in the middle!"
      />
    </div>
  )
}
