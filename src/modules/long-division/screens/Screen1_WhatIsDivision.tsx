import { useState } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import CookieAnimation from '../components/CookieAnimation'
import NumberPad from '../../../components/shared/NumberPad'

interface Props {
  state: LDState
  dispatch: Dispatch<LDAction>
  childName: string
}

const screenStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  maxWidth: 560,
  width: '100%',
  fontFamily: 'Nunito, sans-serif',
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'Quicksand, sans-serif',
  fontWeight: 800,
  fontSize: 28,
  color: '#1E293B',
  margin: 0,
}

const narrationStyle: React.CSSProperties = {
  fontSize: 18,
  color: '#334155',
  lineHeight: 1.6,
  margin: 0,
}

export default function Screen1_WhatIsDivision({ state, dispatch }: Props) {
  const [animDone, setAnimDone] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleConfirm = () => {
    if (!animDone || answered) return
    if (!inputVal) return

    if (inputVal === '4') {
      setFeedback('Correct! Each group gets 4 cookies.')
      setAnswered(true)
      dispatch({ type: 'LESSON_INPUT_CORRECT' })
    } else {
      dispatch({ type: 'LESSON_INPUT_WRONG' })
      setFeedback('Count the cookies in each group!')
    }
  }

  return (
    <div style={screenStyle}>
      <h2 style={titleStyle}>What Is Division?</h2>

      <p style={narrationStyle}>
        Imagine you have <strong>12</strong> cookies and want to share them equally with <strong>3</strong> friends.
      </p>

      <CookieAnimation onComplete={() => setAnimDone(true)} />

      {animDone && !answered && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={narrationStyle}>
            Each group gets{' '}
            <span
              style={{
                display: 'inline-block',
                minWidth: 40,
                textAlign: 'center',
                borderBottom: '2px solid #F59E0B',
                color: inputVal ? '#1E293B' : '#94A3B8',
                fontWeight: 700,
              }}
            >
              {inputVal || '___'}
            </span>{' '}
            cookies
          </p>
          {feedback && (
            <p style={{ color: '#EF4444', fontWeight: 600, margin: 0 }}>{feedback}</p>
          )}
          <NumberPad
            onDigit={(d) => { if (inputVal.length < 2) setInputVal(v => v + d) }}
            onBackspace={() => setInputVal(v => v.slice(0, -1))}
            onConfirm={handleConfirm}
          />
        </div>
      )}

      {answered && (
        <p style={{ ...narrationStyle, color: '#22C55E', fontWeight: 700 }}>
          {feedback}
        </p>
      )}

      {/* Skip gate link */}
      {!state.lessonCompleted && (
        <p style={{ fontSize: 14, color: '#94A3B8', marginTop: 8 }}>
          Already know long division?{' '}
          <button
            onClick={() => dispatch({ type: 'HYDRATE', state: { phase: 'skip-gate' } })}
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
            Prove it!
          </button>
        </p>
      )}
    </div>
  )
}
