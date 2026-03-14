import { useReducer, useEffect, useRef, useState } from 'react'
import type { ModuleProps } from '../../types/module'
import { ldReducer, initialLDState } from './state/reducer'
import { loadProgress, saveProgress } from './state/persistence'
import PracticePhase from './screens/PracticePhase'
import LessonPhase from './screens/LessonPhase'
import GuidedPhase from './screens/GuidedPhase'
import SkipGate from './screens/SkipGate'

export default function LongDivisionModule({ childName, childId, onExit }: ModuleProps) {
  const [state, dispatch] = useReducer(ldReducer, initialLDState)
  const [showModeSelect, setShowModeSelect] = useState(true)
  const hydratedRef = useRef(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const saved = loadProgress(childId)
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

  // Mode selection screen
  if (showModeSelect) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100dvh',
        fontFamily: 'Nunito, sans-serif',
        background: '#FFF5EB',
        padding: 24,
        position: 'relative',
      }}>
        {/* Home button */}
        <button
          onClick={onExit}
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            background: 'none',
            border: '2px solid #E5DDD0',
            borderRadius: 10,
            padding: '6px 16px',
            fontFamily: 'Quicksand, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            color: '#64748B',
            cursor: 'pointer',
          }}
        >
          ← Home
        </button>

        <h2 style={{
          fontFamily: 'Quicksand, sans-serif',
          fontWeight: 800,
          fontSize: 32,
          color: '#1E293B',
          margin: '0 0 8px',
        }}>
          Long Division
        </h2>
        <p style={{ color: '#64748B', fontSize: 16, margin: '0 0 40px' }}>
          What would you like to do, {childName}?
        </p>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Lesson card */}
          <button
            onClick={() => {
              dispatch({ type: 'HYDRATE', state: { phase: 'lesson' } })
              setShowModeSelect(false)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              border: '2px solid #E5DDD0',
              borderRadius: 16,
              padding: '32px 40px',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              minWidth: 180,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div style={{ fontSize: 40 }}>📖</div>
            <div style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, fontSize: 20, color: '#1E293B' }}>
              Lesson
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              {state.lessonCompleted ? 'Review the steps' : 'Learn how it works'}
            </div>
          </button>

          {/* Practice card */}
          <button
            onClick={() => {
              dispatch({ type: 'HYDRATE', state: { phase: 'practice' } })
              setShowModeSelect(false)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              border: '2px solid #E5DDD0',
              borderRadius: 16,
              padding: '32px 40px',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              minWidth: 180,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div style={{ fontSize: 40 }}>✏️</div>
            <div style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, fontSize: 20, color: '#1E293B' }}>
              Practice
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8' }}>
              Tier {state.tier} • {state.totalCorrect} solved
            </div>
          </button>
        </div>
      </div>
    )
  }

  switch (state.phase) {
    case 'lesson':
      return (
        <LessonPhase
          state={state}
          dispatch={dispatch}
          childName={childName}
          onExit={() => setShowModeSelect(true)}
        />
      )

    case 'guided':
      return (
        <GuidedPhase
          state={state}
          dispatch={dispatch}
          childName={childName}
          onExit={() => setShowModeSelect(true)}
        />
      )

    case 'practice':
      return (
        <PracticePhase
          state={state}
          dispatch={dispatch}
          childName={childName}
          onExit={() => setShowModeSelect(true)}
        />
      )

    case 'skip-gate':
      return (
        <SkipGate
          state={state}
          dispatch={dispatch}
        />
      )

    default:
      return null
  }
}
