import { useReducer, useEffect, useRef } from 'react'
import type { ModuleProps } from '../../types/module'
import { ldReducer, initialLDState } from './state/reducer'
import { loadProgress, saveProgress } from './state/persistence'
import PracticePhase from './screens/PracticePhase'

export default function LongDivisionModule({ childName, childId, onExit }: ModuleProps) {
  const [state, dispatch] = useReducer(ldReducer, initialLDState)
  const hydratedRef = useRef(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const saved = loadProgress(childId)
    // ChildProgress.recentProblems is {dividend, divisor}[] but LDState needs Problem[]
    // Map to full Problem shape; quotient/remainder not needed for dedup logic
    const hydrateState: Partial<import('./engine/types').LDState> = {
      tier: saved.tier,
      totalCorrect: saved.totalCorrect,
      totalAttempted: saved.totalAttempted,
      highestTier: saved.highestTier,
      streak: saved.streak,
      consecutiveDirtyProblems: saved.consecutiveDirtyProblems,
      lessonCompleted: saved.lessonCompleted,
      guidedCompleted: saved.guidedCompleted,
      stepAccuracy: saved.stepAccuracy,
      inProgress: saved.inProgress,
      recentProblems: saved.recentProblems.map(p => ({
        dividend: p.dividend,
        divisor: p.divisor,
        quotient: 0,
        remainder: 0,
      })),
    }
    dispatch({ type: 'HYDRATE', state: hydrateState })
  }, [childId])

  // Persist meaningful state changes
  const prevSaveKey = useRef('')
  useEffect(() => {
    if (!hydratedRef.current) return
    const saveKey = `${state.tier}-${state.totalCorrect}-${state.totalAttempted}-${state.streak}-${state.consecutiveDirtyProblems}-${state.lessonCompleted}-${state.guidedCompleted}`
    if (saveKey === prevSaveKey.current) return
    prevSaveKey.current = saveKey

    saveProgress(childId, {
      tier: state.tier,
      totalCorrect: state.totalCorrect,
      totalAttempted: state.totalAttempted,
      highestTier: state.highestTier,
      streak: state.streak,
      consecutiveDirtyProblems: state.consecutiveDirtyProblems,
      lastSessionDate: new Date().toISOString().slice(0, 10),
      lessonCompleted: state.lessonCompleted,
      guidedCompleted: state.guidedCompleted,
      stepAccuracy: state.stepAccuracy,
      inProgress: state.inProgress,
      recentProblems: state.recentProblems,
    })
  }, [
    childId,
    state.tier,
    state.totalCorrect,
    state.totalAttempted,
    state.highestTier,
    state.streak,
    state.consecutiveDirtyProblems,
    state.lessonCompleted,
    state.guidedCompleted,
    state.stepAccuracy,
    state.inProgress,
    state.recentProblems,
  ])

  switch (state.phase) {
    case 'lesson':
      return (
        <div style={{ padding: 32, fontFamily: 'Quicksand, sans-serif' }}>
          Lesson Phase (Coming in Chunk 5)
        </div>
      )

    case 'guided':
      return (
        <div style={{ padding: 32, fontFamily: 'Quicksand, sans-serif' }}>
          Guided Phase (Coming in Chunk 5)
        </div>
      )

    case 'practice':
      return (
        <PracticePhase
          state={state}
          dispatch={dispatch}
          childName={childName}
          onExit={onExit}
        />
      )

    case 'skip-gate':
      return (
        <div style={{ padding: 32, fontFamily: 'Quicksand, sans-serif' }}>
          Skip Gate (Coming in Chunk 5)
        </div>
      )

    default:
      return null
  }
}
