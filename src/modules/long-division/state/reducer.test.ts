import { describe, it, expect } from 'vitest'
import { ldReducer, initialLDState } from './reducer'

describe('ldReducer', () => {
  describe('lesson navigation', () => {
    it('advances lesson screen', () => {
      const state = ldReducer(initialLDState, { type: 'NEXT_LESSON_SCREEN' })
      expect(state.lessonScreen).toBe(2)
      expect(state.lessonMaxScreenReached).toBe(2)
    })

    it('tracks max screen reached', () => {
      let state = initialLDState
      state = ldReducer(state, { type: 'NEXT_LESSON_SCREEN' })
      state = ldReducer(state, { type: 'NEXT_LESSON_SCREEN' })
      state = ldReducer(state, { type: 'PREV_LESSON_SCREEN' })
      expect(state.lessonScreen).toBe(2)
      expect(state.lessonMaxScreenReached).toBe(3)
    })

    it('resets lesson input attempts on screen advance', () => {
      let state = { ...initialLDState, lessonInputAttempts: 2 }
      state = ldReducer(state, { type: 'NEXT_LESSON_SCREEN' })
      expect(state.lessonInputAttempts).toBe(0)
    })
  })

  describe('practice - streak and tier', () => {
    it('increments streak on clean problem', () => {
      const state = { ...initialLDState, phase: 'practice' as const, streak: 2, problemClean: true }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.streak).toBe(3)
    })

    it('resets streak on dirty problem', () => {
      const state = { ...initialLDState, phase: 'practice' as const, streak: 3, problemClean: false }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.streak).toBe(0)
    })

    it('triggers tier advance at streak 5', () => {
      const state = { ...initialLDState, phase: 'practice' as const, streak: 4, problemClean: true, tier: 2 }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.showingTierAdvance).toBe(true)
    })

    it('advances tier', () => {
      const state = { ...initialLDState, tier: 2, highestTier: 2 }
      const next = ldReducer(state, { type: 'ADVANCE_TIER' })
      expect(next.tier).toBe(3)
      expect(next.highestTier).toBe(3)
      expect(next.streak).toBe(0)
      expect(next.consecutiveDirtyProblems).toBe(0)
    })

    it('tracks consecutive dirty problems', () => {
      const state = { ...initialLDState, phase: 'practice' as const, problemClean: false, consecutiveDirtyProblems: 1 }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.consecutiveDirtyProblems).toBe(2)
    })

    it('demotes tier at 3 consecutive dirty (but not below 1)', () => {
      const state = { ...initialLDState, tier: 1, consecutiveDirtyProblems: 2, problemClean: false, phase: 'practice' as const }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.tier).toBe(1)
    })

    it('demotes tier at 3 consecutive dirty when above tier 1', () => {
      const state = { ...initialLDState, tier: 3, consecutiveDirtyProblems: 2, problemClean: false, phase: 'practice' as const }
      const next = ldReducer(state, { type: 'PROBLEM_COMPLETE' })
      expect(next.tier).toBe(2)
    })
  })

  describe('hints', () => {
    it('increments hint level and marks dirty', () => {
      const state = { ...initialLDState, currentHintLevel: 0, problemClean: true }
      const next = ldReducer(state, { type: 'USE_HINT' })
      expect(next.currentHintLevel).toBe(1)
      expect(next.problemClean).toBe(false)
    })
  })

  describe('step correct/wrong', () => {
    it('advances step on correct', () => {
      const state = { ...initialLDState, currentStepIndex: 2 }
      const next = ldReducer(state, { type: 'STEP_CORRECT' })
      expect(next.currentStepIndex).toBe(3)
      expect(next.currentAttempts).toBe(0)
      expect(next.currentHintLevel).toBe(0)
      expect(next.inputValue).toBe('')
    })

    it('marks dirty on wrong', () => {
      const state = { ...initialLDState, currentAttempts: 0, problemClean: true }
      const next = ldReducer(state, { type: 'STEP_WRONG' })
      expect(next.currentAttempts).toBe(1)
      expect(next.problemClean).toBe(false)
    })
  })

  describe('skip lesson', () => {
    it('jumps to practice tier 2', () => {
      const next = ldReducer(initialLDState, { type: 'SKIP_LESSON' })
      expect(next.phase).toBe('practice')
      expect(next.tier).toBe(2)
      expect(next.lessonCompleted).toBe(true)
      expect(next.guidedCompleted).toBe(true)
    })
  })
})
