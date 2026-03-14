import { useState, useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import { computeDivisionHouse } from '../engine/computeDivisionHouse'
import DivisionHouse from '../components/DivisionHouse'
import StepPanel from '../components/StepPanel'
import FeedbackArea from '../components/FeedbackArea'
import NumberPad from '../../../components/shared/NumberPad'

interface SkipGateProps {
  state: LDState
  dispatch: Dispatch<LDAction>
}

const DIVIDEND = 84
const DIVISOR = 3
const houseData = computeDivisionHouse(DIVIDEND, DIVISOR)

export default function SkipGate({ dispatch }: SkipGateProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [feedbackText, setFeedbackText] = useState<string | null>(null)
  const [allCorrect, setAllCorrect] = useState(true) // tracks first-attempt perfection
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)

  const prevStep = useRef(stepIndex)

  // Clear input on step advance
  useEffect(() => {
    if (stepIndex !== prevStep.current) {
      setInputValue('')
      setFeedbackText(null)
      prevStep.current = stepIndex
    }
  }, [stepIndex])

  // Auto bringdown
  const currentStep = houseData.steps[stepIndex] ?? null
  useEffect(() => {
    if (!currentStep?.auto) return
    const t = setTimeout(() => {
      setStepIndex(i => i + 1)
    }, 600)
    return () => clearTimeout(t)
  }, [currentStep])

  // All steps done
  const isAllDone = stepIndex >= houseData.steps.length
  useEffect(() => {
    if (isAllDone && !done) {
      setDone(true)
      if (allCorrect) {
        dispatch({ type: 'SKIP_LESSON' })
      } else {
        setFailed(true)
      }
    }
  }, [isAllDone, done, allCorrect, dispatch])

  const handleConfirm = () => {
    if (!currentStep || currentStep.auto) return
    if (!inputValue) return

    if (inputValue === currentStep.correctAnswer) {
      setFeedbackText(null)
      setStepIndex(i => i + 1)
    } else {
      // Any wrong answer marks as failed — no hints
      setAllCorrect(false)
      setFeedbackText('Not quite — try again.')
    }
  }

  if (failed) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        gap: 24,
        fontFamily: 'Nunito, sans-serif',
        padding: 32,
        background: '#FDF6EC',
      }}>
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: 400,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <p style={{ fontSize: 48, margin: '0 0 16px' }}>🤔</p>
          <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 24, color: '#1E293B', margin: '0 0 12px' }}>
            Not quite!
          </h2>
          <p style={{ color: '#64748B', fontSize: 16, margin: '0 0 28px' }}>
            Let's review the lesson first. You'll be a pro in no time!
          </p>
          <button
            onClick={() => dispatch({ type: 'HYDRATE', state: { phase: 'lesson', lessonScreen: 1 } })}
            style={{
              background: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '14px 36px',
              fontFamily: 'Quicksand, sans-serif',
              fontWeight: 700,
              fontSize: 17,
              cursor: 'pointer',
            }}
          >
            Back to Lesson
          </button>
        </div>
      </div>
    )
  }

  const promptText = currentStep?.promptText ?? '...'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '100px 1fr 240px',
      gridTemplateRows: 'auto 1fr auto',
      gap: 16,
      padding: 16,
      height: '100dvh',
      boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 800, fontSize: 22, color: '#1E293B', margin: 0 }}>
            Skip Gate: 84 ÷ 3
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#64748B', margin: '2px 0 0' }}>
            Solve it perfectly on your first try!
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'HYDRATE', state: { phase: 'lesson', lessonScreen: 1 } })}
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            color: '#64748B',
            cursor: 'pointer',
          }}
        >
          Back to Lesson
        </button>
      </div>

      {/* Step panel */}
      <div style={{ gridColumn: 1, gridRow: 2 }}>
        <StepPanel activeStep={currentStep?.action ?? null} />
      </div>

      {/* Division house */}
      <div style={{ gridColumn: 2, gridRow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DivisionHouse
          houseData={houseData}
          currentStepIndex={stepIndex}
          inputValue={inputValue}
          onInput={setInputValue}
        />
      </div>

      {/* Feedback area — no hints in skip gate */}
      <div style={{ gridColumn: 3, gridRow: 2 }}>
        <FeedbackArea
          promptText={promptText}
          feedbackText={feedbackText}
          hintLevel={3}
          onHint={() => {}}
          maxHints={0}
        />
      </div>

      {/* Number pad */}
      <div style={{ gridColumn: '1 / -1', gridRow: 3 }}>
        <NumberPad
          onDigit={(d) => { if (inputValue.length < 4) setInputValue(v => v + d) }}
          onBackspace={() => setInputValue(v => v.slice(0, -1))}
          onConfirm={handleConfirm}
          disabled={!currentStep || currentStep.auto === true}
        />
      </div>
    </div>
  )
}
