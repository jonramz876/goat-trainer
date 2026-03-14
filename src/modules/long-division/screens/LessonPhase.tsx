import { useState, useEffect } from 'react'
import type { Dispatch } from 'react'
import type { LDState } from '../engine/types'
import type { LDAction } from '../state/actions'
import Screen1_WhatIsDivision from './Screen1_WhatIsDivision'
import Screen2_DivisionHouse from './Screen2_DivisionHouse'
import Screen3_FourSteps from './Screen3_FourSteps'
import Screen4_Walkthrough84 from './Screen4_Walkthrough84'
import Screen5_Remainder85 from './Screen5_Remainder85'
import Screen6_BigNumber1248 from './Screen6_BigNumber1248'
import Screen7_Summary from './Screen7_Summary'
import styles from './LessonPhase.module.css'

const TOTAL_SCREENS = 7

interface LessonPhaseProps {
  state: LDState
  dispatch: Dispatch<LDAction>
  childName: string
}

export default function LessonPhase({ state, dispatch, childName }: LessonPhaseProps) {
  const [nextReady, setNextReady] = useState(false)

  // 800ms pacing delay after interaction completes
  useEffect(() => {
    if (!state.lessonInteractionComplete) {
      setNextReady(false)
      return
    }
    const timer = setTimeout(() => setNextReady(true), 800)
    return () => clearTimeout(timer)
  }, [state.lessonInteractionComplete])

  const screen = state.lessonScreen
  const canGoBack = screen > 1
  const isLastScreen = screen === TOTAL_SCREENS
  const canGoNext = nextReady && screen <= state.lessonMaxScreenReached + 1

  const handleNext = () => {
    if (!canGoNext) return
    if (isLastScreen) {
      dispatch({ type: 'COMPLETE_LESSON' })
    } else {
      dispatch({ type: 'NEXT_LESSON_SCREEN' })
    }
  }

  const handleBack = () => {
    if (!canGoBack) return
    dispatch({ type: 'PREV_LESSON_SCREEN' })
  }

  const renderScreen = () => {
    switch (screen) {
      case 1: return <Screen1_WhatIsDivision state={state} dispatch={dispatch} childName={childName} />
      case 2: return <Screen2_DivisionHouse state={state} dispatch={dispatch} />
      case 3: return <Screen3_FourSteps state={state} dispatch={dispatch} />
      case 4: return <Screen4_Walkthrough84 state={state} dispatch={dispatch} />
      case 5: return <Screen5_Remainder85 state={state} dispatch={dispatch} />
      case 6: return <Screen6_BigNumber1248 state={state} dispatch={dispatch} />
      case 7: return <Screen7_Summary dispatch={dispatch} />
      default: return null
    }
  }

  return (
    <div className={styles.lessonLayout}>
      {/* Progress dots */}
      <div className={styles.progressBar}>
        {Array.from({ length: TOTAL_SCREENS }, (_, i) => {
          const dotScreen = i + 1
          let cls = styles.dot
          if (dotScreen === screen) cls += ' ' + styles.active
          else if (dotScreen < screen) cls += ' ' + styles.completed
          return <div key={i} className={cls} />
        })}
      </div>

      {/* Screen content */}
      <div className={styles.screenArea}>
        {renderScreen()}
      </div>

      {/* Navigation */}
      <div className={styles.navButtons}>
        <button
          className={styles.navBtn}
          onClick={handleBack}
          disabled={!canGoBack}
        >
          Back
        </button>
        <button
          className={`${styles.navBtn} ${styles.primary}`}
          onClick={handleNext}
          disabled={!canGoNext}
        >
          {isLastScreen ? "Let's Go!" : 'Next'}
        </button>
      </div>
    </div>
  )
}
