export type LDAction =
  // Navigation
  | { type: 'SKIP_LESSON' }
  | { type: 'START_GUIDED' }
  | { type: 'START_PRACTICE' }
  // Lesson
  | { type: 'NEXT_LESSON_SCREEN' }
  | { type: 'PREV_LESSON_SCREEN' }
  | { type: 'LESSON_STEP_ADVANCE' }
  | { type: 'LESSON_INPUT_CORRECT' }
  | { type: 'LESSON_INPUT_WRONG' }
  | { type: 'COMPLETE_LESSON' }
  // Guided
  | { type: 'GUIDED_INPUT_CORRECT' }
  | { type: 'GUIDED_INPUT_WRONG' }
  | { type: 'SHOW_GUIDED_INTERSTITIAL' }
  | { type: 'NEXT_GUIDED_PROBLEM' }
  | { type: 'COMPLETE_GUIDED' }
  // Practice
  | { type: 'SET_CURRENT_PROBLEM'; problem: import('../engine/types').Problem; houseData: import('../engine/types').ComputedHouse }
  | { type: 'SET_INPUT'; value: string }
  | { type: 'STEP_CORRECT' }
  | { type: 'STEP_WRONG' }
  | { type: 'USE_HINT' }
  | { type: 'PROBLEM_COMPLETE' }
  | { type: 'ADVANCE_TIER' }
  | { type: 'DEMOTE_TIER' }
  | { type: 'DISMISS_TIER_ADVANCE' }
  | { type: 'DISMISS_COMPLETION' }
  | { type: 'SHOW_TEN_PROBLEM_CHECK' }
  | { type: 'DISMISS_TEN_PROBLEM_CHECK' }
  | { type: 'SHOW_MINI_DRILL'; divisor: number }
  | { type: 'DISMISS_MINI_DRILL' }
  // Hydration
  | { type: 'HYDRATE'; state: Partial<import('../engine/types').LDState> }
