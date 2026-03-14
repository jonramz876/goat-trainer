import type { LDState } from '../engine/types'
import type { LDAction } from './actions'

export const initialLDState: LDState = {
  phase: 'lesson',
  // Lesson
  lessonScreen: 1,
  lessonStepWithinScreen: 0,
  lessonInteractionComplete: false,
  lessonMaxScreenReached: 1,
  lessonInputAttempts: 0,
  // Guided
  guidedProblemIndex: 0,
  guidedStepIndex: 0,
  guidedAttempts: 0,
  guidedShowingInterstitial: false,
  // Practice
  currentProblem: null,
  currentHouseData: null,
  currentStepIndex: 0,
  currentAttempts: 0,
  currentHintLevel: 0,
  inputValue: '',
  tier: 1,
  highestTier: 1,
  streak: 0,
  problemClean: true,
  consecutiveDirtyProblems: 0,
  totalCorrect: 0,
  totalAttempted: 0,
  recentProblems: [],
  lessonCompleted: false,
  guidedCompleted: false,
  showingCompletion: false,
  showingTierAdvance: false,
  showTenProblemCheck: false,
  // Step accuracy
  stepAccuracy: {
    divide: { correct: 0, total: 0 },
    multiply: { correct: 0, total: 0 },
    subtract: { correct: 0, total: 0 },
  },
  // Mini-drill
  showingMiniDrill: false,
  miniDrillDivisor: 0,
  recentMultiplyHints: [],
  // Resume
  inProgress: null,
}

export function ldReducer(state: LDState, action: LDAction): LDState {
  switch (action.type) {
    // --- Navigation ---
    case 'SKIP_LESSON':
      return {
        ...state,
        phase: 'practice',
        tier: 2,
        lessonCompleted: true,
        guidedCompleted: true,
      }

    case 'START_GUIDED':
      return { ...state, phase: 'guided' }

    case 'START_PRACTICE':
      return { ...state, phase: 'practice' }

    // --- Lesson ---
    case 'NEXT_LESSON_SCREEN': {
      const nextScreen = state.lessonScreen + 1
      return {
        ...state,
        lessonScreen: nextScreen,
        lessonMaxScreenReached: Math.max(state.lessonMaxScreenReached, nextScreen),
        lessonStepWithinScreen: 0,
        lessonInteractionComplete: false,
        lessonInputAttempts: 0,
      }
    }

    case 'PREV_LESSON_SCREEN':
      return {
        ...state,
        lessonScreen: Math.max(1, state.lessonScreen - 1),
      }

    case 'LESSON_STEP_ADVANCE':
      return { ...state, lessonStepWithinScreen: state.lessonStepWithinScreen + 1 }

    case 'LESSON_INPUT_CORRECT':
      return { ...state, lessonInputAttempts: 0, lessonInteractionComplete: true }

    case 'LESSON_INPUT_WRONG':
      return { ...state, lessonInputAttempts: state.lessonInputAttempts + 1 }

    case 'COMPLETE_LESSON':
      return { ...state, lessonCompleted: true, phase: 'guided' }

    // --- Guided ---
    case 'GUIDED_INPUT_CORRECT':
      return { ...state, guidedStepIndex: state.guidedStepIndex + 1, guidedAttempts: 0 }

    case 'GUIDED_INPUT_WRONG':
      return { ...state, guidedAttempts: state.guidedAttempts + 1 }

    case 'SHOW_GUIDED_INTERSTITIAL':
      return { ...state, guidedShowingInterstitial: true }

    case 'NEXT_GUIDED_PROBLEM':
      return {
        ...state,
        guidedProblemIndex: state.guidedProblemIndex + 1,
        guidedStepIndex: 0,
        guidedAttempts: 0,
        guidedShowingInterstitial: false,
      }

    case 'COMPLETE_GUIDED':
      return { ...state, guidedCompleted: true, phase: 'practice' }

    // --- Practice ---
    case 'SET_CURRENT_PROBLEM':
      return {
        ...state,
        currentProblem: action.problem,
        currentHouseData: action.houseData,
        currentStepIndex: 0,
        currentAttempts: 0,
        currentHintLevel: 0,
        inputValue: '',
        problemClean: true,
      }

    case 'SET_INPUT':
      return { ...state, inputValue: action.value }

    case 'STEP_CORRECT':
      return {
        ...state,
        currentStepIndex: state.currentStepIndex + 1,
        currentAttempts: 0,
        currentHintLevel: 0,
        inputValue: '',
      }

    case 'STEP_WRONG':
      return {
        ...state,
        currentAttempts: state.currentAttempts + 1,
        problemClean: false,
      }

    case 'USE_HINT':
      return {
        ...state,
        currentHintLevel: state.currentHintLevel + 1,
        problemClean: false,
      }

    case 'PROBLEM_COMPLETE': {
      const wasClean = state.problemClean
      const newTotalCorrect = state.totalCorrect + 1
      const newTotalAttempted = state.totalAttempted + 1

      // Streak logic
      const newStreak = wasClean ? state.streak + 1 : 0

      // Consecutive dirty logic
      const newConsecutiveDirty = wasClean ? 0 : state.consecutiveDirtyProblems + 1

      // Tier advance trigger: streak reaches 5 after increment
      const triggerTierAdvance = wasClean && newStreak >= 5

      // Auto-demote: 3 consecutive dirty and tier > 1
      const shouldDemote = !wasClean && newConsecutiveDirty >= 3 && state.tier > 1
      const newTier = shouldDemote ? state.tier - 1 : state.tier

      return {
        ...state,
        totalCorrect: newTotalCorrect,
        totalAttempted: newTotalAttempted,
        streak: newStreak,
        consecutiveDirtyProblems: newConsecutiveDirty,
        showingTierAdvance: triggerTierAdvance,
        tier: newTier,
        // Reset problem state
        currentProblem: null,
        currentHouseData: null,
        currentStepIndex: 0,
        currentAttempts: 0,
        currentHintLevel: 0,
        inputValue: '',
        problemClean: true,
      }
    }

    case 'ADVANCE_TIER': {
      const newTier = state.tier + 1
      return {
        ...state,
        tier: newTier,
        highestTier: Math.max(state.highestTier, newTier),
        streak: 0,
        consecutiveDirtyProblems: 0,
        showingTierAdvance: false,
      }
    }

    case 'DEMOTE_TIER':
      return {
        ...state,
        tier: Math.max(1, state.tier - 1),
        streak: 0,
        consecutiveDirtyProblems: 0,
      }

    case 'DISMISS_TIER_ADVANCE':
      return { ...state, showingTierAdvance: false }

    case 'DISMISS_COMPLETION':
      return { ...state, showingCompletion: false }

    case 'SHOW_TEN_PROBLEM_CHECK':
      return { ...state, showTenProblemCheck: true }

    case 'DISMISS_TEN_PROBLEM_CHECK':
      return { ...state, showTenProblemCheck: false }

    case 'SHOW_MINI_DRILL':
      return { ...state, showingMiniDrill: true, miniDrillDivisor: action.divisor }

    case 'DISMISS_MINI_DRILL':
      return { ...state, showingMiniDrill: false }

    case 'HYDRATE':
      return { ...state, ...action.state }

    default:
      return state
  }
}
