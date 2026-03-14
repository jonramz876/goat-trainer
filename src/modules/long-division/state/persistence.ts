import type { ChildProgress } from '../engine/types'

const STORAGE_PREFIX = 'goat-trainer-'
const MODULE_SUFFIX = '-long-division'

export const DEFAULT_PROGRESS: ChildProgress = {
  tier: 1,
  totalCorrect: 0,
  totalAttempted: 0,
  highestTier: 1,
  streak: 0,
  consecutiveDirtyProblems: 0,
  lastSessionDate: '',
  lessonCompleted: false,
  guidedCompleted: false,
  stepAccuracy: {
    divide: { correct: 0, total: 0 },
    multiply: { correct: 0, total: 0 },
    subtract: { correct: 0, total: 0 },
  },
  inProgress: null,
  recentProblems: [],
}

export function saveProgress(childId: string, progress: ChildProgress): void {
  const key = `${STORAGE_PREFIX}${childId}${MODULE_SUFFIX}`
  localStorage.setItem(key, JSON.stringify(progress))
}

export function clearProgress(childId: string): void {
  const key = `${STORAGE_PREFIX}${childId}${MODULE_SUFFIX}`
  localStorage.removeItem(key)
}

export function loadProgress(childId: string): ChildProgress {
  const key = `${STORAGE_PREFIX}${childId}${MODULE_SUFFIX}`
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { ...DEFAULT_PROGRESS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PROGRESS, ...parsed }
  } catch {
    return { ...DEFAULT_PROGRESS }
  }
}
