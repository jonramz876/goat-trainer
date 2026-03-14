import { describe, it, expect, beforeEach } from 'vitest'
import { saveProgress, loadProgress, DEFAULT_PROGRESS } from './persistence'
import type { ChildProgress } from '../engine/types'

describe('persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and loads progress round-trip', () => {
    const progress: ChildProgress = {
      ...DEFAULT_PROGRESS,
      tier: 3,
      totalCorrect: 25,
      streak: 4,
    }
    saveProgress('jack', progress)
    const loaded = loadProgress('jack')
    expect(loaded.tier).toBe(3)
    expect(loaded.totalCorrect).toBe(25)
    expect(loaded.streak).toBe(4)
  })

  it('returns defaults when no saved data', () => {
    const loaded = loadProgress('reese')
    expect(loaded).toEqual(DEFAULT_PROGRESS)
  })

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem('goat-trainer-kate-long-division', 'not-json')
    const loaded = loadProgress('kate')
    expect(loaded).toEqual(DEFAULT_PROGRESS)
  })

  it('preserves inProgress state', () => {
    const progress: ChildProgress = {
      ...DEFAULT_PROGRESS,
      inProgress: {
        dividend: 84,
        divisor: 4,
        currentStepIndex: 3,
        tier: 2,
        streak: 1,
        problemClean: true,
      },
    }
    saveProgress('jack', progress)
    const loaded = loadProgress('jack')
    expect(loaded.inProgress?.dividend).toBe(84)
    expect(loaded.inProgress?.currentStepIndex).toBe(3)
  })
})
