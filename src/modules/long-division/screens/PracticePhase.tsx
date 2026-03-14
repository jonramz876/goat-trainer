import { useEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import { generateProblem } from '../engine/generateProblem'
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
import TierDisplay from '../components/TierDisplay'
import NumberPad from '../../../components/shared/NumberPad'
import MultiplicationDrill from '../miniDrills/MultiplicationDrill'
import styles from './PracticePhase.module.css'

interface PracticePhaseProps {
  state: LDState
  dispatch: Dispatch<LDAction>
  childName: string
  onExit: () => void
}

export default function PracticePhase({ state, dispatch, childName, onExit }: PracticePhaseProps) {
  const [feedbackText, setFeedbackText] = useState<string | null>(null)

  // Track problem init to avoid double-dispatch in StrictMode
  const initializingRef = useRef(false)

  // Problem initialization
  useEffect(() => {
    if (state.currentProblem === null && !initializingRef.current) {
      initializingRef.current = true
      const problem = generateProblem(state.tier, state.recentProblems)
      const houseData = computeDivisionHouse(problem.dividend, problem.divisor)
      dispatch({ type: 'SET_CURRENT_PROBLEM', problem, houseData })
    }
    if (state.currentProblem !== null) {
      initializingRef.current = false
    }
  }, [state.currentProblem, state.tier, state.recentProblems, dispatch])

  // Clear feedback when step advances
  const prevStepIndex = useRef(state.currentStepIndex)
  useEffect(() => {
    if (state.currentStepIndex !== prevStepIndex.current) {
      setFeedbackText(null)
      prevStepIndex.current = state.currentStepIndex
    }
  }, [state.currentStepIndex])

  // Auto bringdown
  useEffect(() => {
    if (!state.currentHouseData) return
    const currentStep = state.currentHouseData.steps[state.currentStepIndex]
    if (!currentStep?.auto) return

    const timer = setTimeout(() => {
      dispatch({ type: 'STEP_CORRECT' })
    }, 600)

    return () => clearTimeout(timer)
  }, [state.currentHouseData, state.currentStepIndex, dispatch])

  // Tier advance auto-dismiss after 2s
  useEffect(() => {
    if (!state.showingTierAdvance) return
    const timer = setTimeout(() => {
      dispatch({ type: 'ADVANCE_TIER' })
      dispatch({ type: 'DISMISS_TIER_ADVANCE' })
    }, 2000)
    return () => clearTimeout(timer)
  }, [state.showingTierAdvance, dispatch])

  // Completion overlay auto-dismiss after 1.5s
  useEffect(() => {
    if (!state.showingCompletion) return
    const timer = setTimeout(() => {
      dispatch({ type: 'DISMISS_COMPLETION' })
    }, 1500)
    return () => clearTimeout(timer)
  }, [state.showingCompletion, dispatch])

  const handleHint = () => {
    if (!state.currentHouseData || !state.currentProblem) return
    const currentStep = state.currentHouseData.steps[state.currentStepIndex]
    if (!currentStep) return

    const hintLevel = state.currentHintLevel
    const divisor = state.currentProblem.divisor
    let hintText = ''

    if (currentStep.action === 'divide') {
      const promptNumber = currentStep.promptNumber ?? 0
      const correct = parseInt(currentStep.correctAnswer, 10)
      hintText = getDivideHint(hintLevel + 1, divisor, promptNumber, correct)
    } else if (currentStep.action === 'multiply') {
      // Extract quotient digit from the step's correctAnswer context
      // promptText is like "3 × 4", we need a and b
      const parts = currentStep.promptText?.match(/(\d+)\s*[×x]\s*(\d+)/)
      const a = parts ? parseInt(parts[1], 10) : 0
      const b = parts ? parseInt(parts[2], 10) : divisor
      const correct = parseInt(currentStep.correctAnswer, 10)
      hintText = getMultiplyHint(hintLevel + 1, a, b, correct)
    } else if (currentStep.action === 'subtract') {
      // promptText is like "84 − 80"
      const parts = currentStep.promptText?.match(/(\d+)\s*[−-]\s*(\d+)/)
      const top = parts ? parseInt(parts[1], 10) : 0
      const bottom = parts ? parseInt(parts[2], 10) : 0
      const correct = parseInt(currentStep.correctAnswer, 10)
      hintText = getSubtractHint(hintLevel + 1, top, bottom, correct)
    }

    setFeedbackText(hintText)
    dispatch({ type: 'USE_HINT' })
  }

  const handleConfirm = () => {
    if (!state.currentHouseData || !state.currentProblem) return
    const currentStep = state.currentHouseData.steps[state.currentStepIndex]
    if (!currentStep || currentStep.auto) return

    const inputValue = state.inputValue.trim()
    if (!inputValue) return

    const correct = currentStep.correctAnswer
    const divisor = state.currentProblem.divisor
    const isFirstAttempt = state.currentAttempts === 0

    if (inputValue === correct) {
      // Correct answer
      const isLastStep = state.currentStepIndex >= state.currentHouseData.steps.length - 1

      // Update step accuracy — reducer doesn't do this automatically, track first-attempt here
      // We dispatch STEP_CORRECT first, then check if problem is complete
      // Step accuracy update: only count if first attempt
      // Note: reducer tracks stepAccuracy but doesn't update it in STEP_CORRECT.
      // We handle it inline here by checking isFirstAttempt before dispatching.
      void isFirstAttempt // acknowledged; reducer does not update stepAccuracy on STEP_CORRECT

      dispatch({ type: 'STEP_CORRECT' })
      setFeedbackText(null)

      if (isLastStep) {
        dispatch({ type: 'PROBLEM_COMPLETE' })
      }
    } else {
      // Wrong answer
      dispatch({ type: 'STEP_WRONG' })

      let fb = ''
      if (currentStep.action === 'divide') {
        const promptNumber = currentStep.promptNumber ?? 0
        fb = getDivideFeedback({
          student: parseInt(inputValue, 10),
          correct: parseInt(correct, 10),
          divisor,
          number: promptNumber,
        })
      } else if (currentStep.action === 'multiply') {
        const parts = currentStep.promptText?.match(/(\d+)\s*[×x]\s*(\d+)/)
        const a = parts ? parseInt(parts[1], 10) : 0
        fb = getMultiplyFeedback({
          a,
          b: divisor,
          student: parseInt(inputValue, 10),
          correct: parseInt(correct, 10),
        })
      } else if (currentStep.action === 'subtract') {
        const parts = currentStep.promptText?.match(/(\d+)\s*[−-]\s*(\d+)/)
        const top = parts ? parseInt(parts[1], 10) : 0
        const bottom = parts ? parseInt(parts[2], 10) : 0
        fb = getSubtractFeedback({
          top,
          bottom,
          student: parseInt(inputValue, 10),
          correct: parseInt(correct, 10),
        })
      }

      setFeedbackText(fb || 'Not quite. Try again.')
    }
  }

  const currentStep = state.currentHouseData?.steps[state.currentStepIndex] ?? null
  const promptText = currentStep?.promptText ?? '...'

  return (
    <div className={styles.practiceLayout}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <TierDisplay
          tier={state.tier}
          streak={state.streak}
          showAdvance={false}
        />
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
        {state.currentHouseData && (
          <DivisionHouse
            houseData={state.currentHouseData}
            currentStepIndex={state.currentStepIndex}
            inputValue={state.inputValue}
            onInput={(v) => dispatch({ type: 'SET_INPUT', value: v })}
          />
        )}
      </div>

      {/* Feedback area */}
      <div className={styles.feedbackArea}>
        <FeedbackArea
          promptText={promptText}
          feedbackText={feedbackText}
          hintLevel={state.currentHintLevel}
          onHint={handleHint}
        />
      </div>

      {/* Number pad */}
      <div className={styles.padArea}>
        <NumberPad
          onDigit={(d) => {
            if (state.inputValue.length < 4) {
              dispatch({ type: 'SET_INPUT', value: state.inputValue + d })
            }
          }}
          onBackspace={() => {
            dispatch({ type: 'SET_INPUT', value: state.inputValue.slice(0, -1) })
          }}
          onConfirm={handleConfirm}
          disabled={!state.currentHouseData || currentStep?.auto === true}
        />
      </div>

      {/* Completion overlay */}
      {state.showingCompletion && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <div className={styles.completionCheck}>✅</div>
            <p className={styles.overlayTitle}>Nice work!</p>
          </div>
        </div>
      )}

      {/* Tier advance overlay */}
      {state.showingTierAdvance && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <div className={styles.tierAdvanceBadge}>Level Up!</div>
            <p className={styles.overlayTitle}>Moving to Tier {state.tier + 1}</p>
            <p className={styles.overlaySubtext}>Great streak, {childName}!</p>
          </div>
        </div>
      )}

      {/* 10-problem check-in */}
      {state.showTenProblemCheck && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <p className={styles.overlayTitle}>Keep going?</p>
            <p className={styles.overlaySubtext}>You've been at it for a while. Take a break or keep going!</p>
            <div className={styles.overlayButtons}>
              <button
                className={styles.btnPrimary}
                onClick={() => dispatch({ type: 'DISMISS_TEN_PROBLEM_CHECK' })}
              >
                Keep Going
              </button>
              <button className={styles.btnSecondary} onClick={onExit}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini-drill overlay */}
      {state.showingMiniDrill && (
        <MultiplicationDrill
          divisor={state.miniDrillDivisor}
          childName={childName}
          onComplete={() => dispatch({ type: 'DISMISS_MINI_DRILL' })}
        />
      )}
    </div>
  )
}
