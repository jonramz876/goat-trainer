/**
 * Shared walkthrough screen logic for Screens 4-6.
 * Each screen provides narration texts and a houseData.
 * The student types answers step by step with gentle 3-tier feedback.
 */
import { useState, useEffect, useRef } from 'react'
import type { Dispatch } from 'react'
import type { ComputedHouse } from '../engine/types'
import type { LDAction } from '../state/actions'
import DivisionHouse from '../components/DivisionHouse'
import StepPanel from '../components/StepPanel'
import NumberPad from '../../../components/shared/NumberPad'

export interface WalkthroughScreenProps {
  dispatch: Dispatch<LDAction>
  houseData: ComputedHouse
  /** Narration text for each step index. Bringdown steps can be omitted (auto). */
  narrations: string[]
  /** Shown after all steps complete */
  completionText: string
  /** Optional: extra content rendered after completion (e.g. quick check) */
  completionExtra?: React.ReactNode
}

export default function WalkthroughScreen({
  dispatch,
  houseData,
  narrations,
  completionText,
  completionExtra,
}: WalkthroughScreenProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [highlightNarration, setHighlightNarration] = useState(false)
  const [showHighlightAnswer, setShowHighlightAnswer] = useState(false)
  const [localAttempts, setLocalAttempts] = useState(0)
  const [started, setStarted] = useState(false)
  const [complete, setComplete] = useState(false)

  const prevStep = useRef(stepIndex)

  // Clear state on step advance
  useEffect(() => {
    if (stepIndex !== prevStep.current) {
      setInputValue('')
      setFeedback(null)
      setHighlightNarration(false)
      setShowHighlightAnswer(false)
      setLocalAttempts(0)
      prevStep.current = stepIndex
    }
  }, [stepIndex])

  const currentStep = houseData.steps[stepIndex] ?? null
  const isAllDone = stepIndex >= houseData.steps.length

  // Auto bringdown
  useEffect(() => {
    if (!currentStep?.auto) return
    const t = setTimeout(() => {
      setStepIndex(i => i + 1)
    }, 600)
    return () => clearTimeout(t)
  }, [currentStep])

  // When all steps done, mark complete
  useEffect(() => {
    if (isAllDone && !complete) {
      setComplete(true)
      dispatch({ type: 'LESSON_INPUT_CORRECT' })
    }
  }, [isAllDone, complete, dispatch])

  const handleConfirm = () => {
    if (!currentStep || currentStep.auto || !started) return
    if (!inputValue) return

    if (inputValue === currentStep.correctAnswer) {
      setFeedback(null)
      setHighlightNarration(false)
      setShowHighlightAnswer(false)
      setTimeout(() => {
        setStepIndex(i => i + 1)
      }, 800)
    } else {
      const attempts = localAttempts + 1
      setLocalAttempts(attempts)
      dispatch({ type: 'LESSON_INPUT_WRONG' })

      if (attempts === 1) {
        // Tier 1: pulse narration
        setHighlightNarration(true)
        setFeedback('Look at the bold number in the explanation above!')
      } else {
        // Tier 2+: highlight the answer
        setShowHighlightAnswer(true)
        setFeedback(`Type ${currentStep.correctAnswer} into the box.`)
      }
    }
  }

  const narration = narrations[stepIndex] ?? ''

  if (!started) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <StepPanel activeStep={null} />
          <DivisionHouse
            houseData={houseData}
            currentStepIndex={0}
            inputValue=""
            onInput={() => {}}
          />
        </div>
        <button
          onClick={() => setStarted(true)}
          style={{
            alignSelf: 'flex-start',
            background: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            padding: '12px 32px',
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: 700,
            fontSize: 17,
            cursor: 'pointer',
          }}
        >
          Start Step-by-Step
        </button>
      </div>
    )
  }

  if (isAllDone || complete) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <StepPanel activeStep={null} />
          <DivisionHouse
            houseData={houseData}
            currentStepIndex={houseData.steps.length}
            inputValue=""
            onInput={() => {}}
            showRemainder={houseData.remainder > 0}
          />
        </div>
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#22C55E',
            background: '#DCFCE7',
            borderRadius: 10,
            padding: '12px 16px',
            margin: 0,
          }}
          dangerouslySetInnerHTML={{ __html: completionText }}
        />
        {completionExtra}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680, width: '100%', fontFamily: 'Nunito, sans-serif' }}>
      {/* House + step panel */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <StepPanel activeStep={currentStep?.action ?? null} />
        <DivisionHouse
          houseData={houseData}
          currentStepIndex={stepIndex}
          inputValue={inputValue}
          onInput={setInputValue}
        />
      </div>

      {/* Narration */}
      {narration && (
        <div
          style={{
            background: highlightNarration ? '#FEF9C3' : '#F1F5F9',
            border: highlightNarration ? '2px solid #F59E0B' : '2px solid transparent',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 16,
            color: '#334155',
            lineHeight: 1.6,
            transition: 'all 0.3s',
          }}
          dangerouslySetInnerHTML={{ __html: narration }}
        />
      )}

      {/* Show highlight answer ring */}
      {showHighlightAnswer && currentStep && (
        <div style={{
          background: '#EFF6FF',
          border: '2px solid #3B82F6',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 15,
          color: '#1D4ED8',
          fontWeight: 700,
        }}>
          Type <span style={{ fontSize: 20, color: '#DC2626' }}>{currentStep.correctAnswer}</span> into the box.
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <p style={{ margin: 0, fontSize: 15, color: '#EF4444', fontWeight: 600 }}>{feedback}</p>
      )}

      {/* Number pad (skip for auto steps) */}
      {!currentStep?.auto && (
        <NumberPad
          onDigit={(d) => { if (inputValue.length < 4) setInputValue(v => v + d) }}
          onBackspace={() => setInputValue(v => v.slice(0, -1))}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
