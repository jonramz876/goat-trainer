import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import { computeDivisionHouse } from '../engine/computeDivisionHouse'
import {
  getDivideFeedback,
  getDivideHint,
  getMultiplyFeedback,
  getMultiplyHint,
  getSubtractFeedback,
  getSubtractHint,
} from '../engine/feedbackTemplates'
import DivisionHouse from '../components/DivisionHouse'
import StepPanel from '../components/StepPanel'
import FeedbackArea from '../components/FeedbackArea'
import NumberPad from '../../../components/shared/NumberPad'
import styles from './GuidedPhase.module.css'

interface GuidedPhaseProps {
  state: LDState
  dispatch: Dispatch<LDAction>
  childName: string
  onExit: () => void
}

const GUIDED_PROBLEMS = [
  { d: 72, v: 3 },
  { d: 95, v: 4 },
  { d: 738, v: 6 },
]

export default function GuidedPhase({ state, dispatch, childName, onExit }: GuidedPhaseProps) {
  const [inputValue, setInputValue] = useState('')
  const [feedbackText, setFeedbackText] = useState<string | null>(null)
  const [hintLevel, setHintLevel] = useState(0)

  const problemIndex = state.guidedProblemIndex
  const problem = GUIDED_PROBLEMS[problemIndex]

  const houseData = computeDivisionHouse(problem.d, problem.v)
  const stepIndex = state.guidedStepIndex
  const currentStep = houseData.steps[stepIndex] ?? null

  // Reset input/feedback when step advances
  const prevStep = useRef(stepIndex)
  useEffect(() => {
    if (stepIndex !== prevStep.current) {
      setInputValue('')
      setFeedbackText(null)
      setHintLevel(0)
      prevStep.current = stepIndex
    }
  }, [stepIndex])

  // Reset input/feedback when problem changes
  const prevProblem = useRef(problemIndex)
  useEffect(() => {
    if (problemIndex !== prevProblem.current) {
      setInputValue('')
      setFeedbackText(null)
      setHintLevel(0)
      prevProblem.current = problemIndex
    }
  }, [problemIndex])

  // Auto bringdown
  useEffect(() => {
    if (!currentStep?.auto) return
    const timer = setTimeout(() => {
      dispatch({ type: 'GUIDED_INPUT_CORRECT' })
    }, 600)
    return () => clearTimeout(timer)
  }, [currentStep, dispatch])

  // When all steps in a problem are done, show interstitial
  useEffect(() => {
    if (state.guidedShowingInterstitial) return
    if (stepIndex >= houseData.steps.length) {
      dispatch({ type: 'SHOW_GUIDED_INTERSTITIAL' })
    }
  }, [stepIndex, houseData.steps.length, state.guidedShowingInterstitial, dispatch])

  const handleHint = () => {
    if (!currentStep) return
    const tier = hintLevel + 1
    let hintText = ''

    if (currentStep.action === 'divide') {
      const promptNumber = currentStep.promptNumber ?? 0
      const correct = parseInt(currentStep.correctAnswer, 10)
      hintText = getDivideHint(tier, problem.v, promptNumber, correct)
    } else if (currentStep.action === 'multiply') {
      const parts = currentStep.promptText?.match(/(\d+)\s*[×x]\s*(\d+)/)
      const a = parts ? parseInt(parts[1], 10) : 0
      const b = parts ? parseInt(parts[2], 10) : problem.v
      const correct = parseInt(currentStep.correctAnswer, 10)
      hintText = getMultiplyHint(tier, a, b, correct)
    } else if (currentStep.action === 'subtract') {
      const parts = currentStep.promptText?.match(/(\d+)\s*[−-]\s*(\d+)/)
      const top = parts ? parseInt(parts[1], 10) : 0
      const bottom = parts ? parseInt(parts[2], 10) : 0
      const correct = parseInt(currentStep.correctAnswer, 10)
      hintText = getSubtractHint(tier, top, bottom, correct)
    }

    setFeedbackText(hintText)
    setHintLevel(h => h + 1)
  }

  const handleConfirm = () => {
    if (!currentStep || currentStep.auto) return
    const val = inputValue.trim()
    if (!val) return

    if (val === currentStep.correctAnswer) {
      setFeedbackText(null)
      dispatch({ type: 'GUIDED_INPUT_CORRECT' })
    } else {
      dispatch({ type: 'GUIDED_INPUT_WRONG' })
      let fb = ''
      if (currentStep.action === 'divide') {
        const promptNumber = currentStep.promptNumber ?? 0
        fb = getDivideFeedback({
          student: parseInt(val, 10),
          correct: parseInt(currentStep.correctAnswer, 10),
          divisor: problem.v,
          number: promptNumber,
        })
      } else if (currentStep.action === 'multiply') {
        const parts = currentStep.promptText?.match(/(\d+)\s*[×x]\s*(\d+)/)
        const a = parts ? parseInt(parts[1], 10) : 0
        fb = getMultiplyFeedback({
          a,
          b: problem.v,
          student: parseInt(val, 10),
          correct: parseInt(currentStep.correctAnswer, 10),
        })
      } else if (currentStep.action === 'subtract') {
        const parts = currentStep.promptText?.match(/(\d+)\s*[−-]\s*(\d+)/)
        const top = parts ? parseInt(parts[1], 10) : 0
        const bottom = parts ? parseInt(parts[2], 10) : 0
        fb = getSubtractFeedback({
          top,
          bottom,
          student: parseInt(val, 10),
          correct: parseInt(currentStep.correctAnswer, 10),
        })
      }
      setFeedbackText(fb || 'Not quite. Try again.')
    }
  }

  const promptText = currentStep?.promptText ?? '...'
  const isLastProblem = problemIndex >= GUIDED_PROBLEMS.length - 1
  const isDone = isLastProblem && state.guidedShowingInterstitial

  return (
    <div className={styles.guidedLayout}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.problemCounter}>
          Problem {problemIndex + 1} of {GUIDED_PROBLEMS.length}
        </span>
        <span style={{ fontFamily: 'Quicksand', fontWeight: 700, color: '#64748B' }}>
          {childName}
        </span>
        <button className={styles.exitButton} onClick={onExit}>Exit</button>
      </div>

      {/* Step panel */}
      <div className={styles.stepPanelArea}>
        <StepPanel activeStep={currentStep?.action ?? null} />
      </div>

      {/* Division house */}
      <div className={styles.houseArea}>
        <DivisionHouse
          houseData={houseData}
          currentStepIndex={stepIndex}
          inputValue={inputValue}
          onInput={setInputValue}
          showRemainder={false}
        />
      </div>

      {/* Feedback area */}
      <div className={styles.feedbackArea}>
        <FeedbackArea
          promptText={promptText}
          feedbackText={feedbackText}
          hintLevel={hintLevel}
          onHint={handleHint}
        />
      </div>

      {/* Number pad */}
      <div className={styles.padArea}>
        <NumberPad
          onDigit={(d) => {
            if (inputValue.length < 4) setInputValue(v => v + d)
          }}
          onBackspace={() => setInputValue(v => v.slice(0, -1))}
          onConfirm={handleConfirm}
          disabled={!currentStep || currentStep.auto === true}
        />
      </div>

      {/* Interstitial overlay */}
      {state.guidedShowingInterstitial && (
        <div className={styles.overlay}>
          <div className={styles.interstitialCard}>
            {isDone ? (
              <>
                <span className={styles.interstitialEmoji}>🎉</span>
                <p className={styles.interstitialTitle}>You're ready for practice!</p>
                <p className={styles.interstitialSub}>Amazing work on all 3 problems.</p>
                <button
                  className={styles.btnPrimary}
                  onClick={() => dispatch({ type: 'COMPLETE_GUIDED' })}
                >
                  Start Practice
                </button>
              </>
            ) : (
              <>
                <span className={styles.interstitialEmoji}>⭐</span>
                <p className={styles.interstitialTitle}>
                  Problem {problemIndex + 2} of {GUIDED_PROBLEMS.length}
                </p>
                <p className={styles.interstitialSub}>
                  {problem.d} ÷ {problem.v} done! Keep it up!
                </p>
                <button
                  className={styles.btnPrimary}
                  onClick={() => dispatch({ type: 'NEXT_GUIDED_PROBLEM' })}
                >
                  Let's Go
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
