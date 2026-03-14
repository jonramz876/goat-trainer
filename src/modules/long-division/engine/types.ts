// --- Division House Algorithm Types ---

export interface CellData {
  row: number
  col: number
  digit: string
  type: 'quotient' | 'multiply' | 'subtract' | 'bringdown' | 'dividend' | 'divisor'
  stepIndex: number
  cycle: number
  showMinus: boolean
}

export interface RuleData {
  row: number
  fromCol: number
  toCol: number
}

export interface StepData {
  stepIndex: number
  action: 'divide' | 'multiply' | 'subtract' | 'bringdown'
  cycle: number
  cells: { row: number; col: number; digit: string }[]
  correctAnswer: string
  promptNumber?: number
  promptText?: string
  auto?: boolean
  type: string
}

export interface ComputedHouse {
  cells: CellData[]
  rules: RuleData[]
  totalRows: number
  totalCols: number
  quotient: number
  remainder: number
  steps: StepData[]
}

// --- Problem Types ---

export interface Problem {
  dividend: number
  divisor: number
  quotient: number
  remainder: number
}

// --- State Types ---

export interface InProgressState {
  dividend: number
  divisor: number
  currentStepIndex: number
  tier: number
  streak: number
  problemClean: boolean
}

export interface StepAccuracy {
  divide: { correct: number; total: number }
  multiply: { correct: number; total: number }
  subtract: { correct: number; total: number }
}

export interface ChildProgress {
  tier: number
  totalCorrect: number
  totalAttempted: number
  highestTier: number
  streak: number
  consecutiveDirtyProblems: number
  lastSessionDate: string
  lessonCompleted: boolean
  guidedCompleted: boolean
  stepAccuracy: StepAccuracy
  inProgress: InProgressState | null
  recentProblems: Array<{ dividend: number; divisor: number }>
}

export type Phase = 'skip-gate' | 'lesson' | 'guided' | 'practice'

export interface LDState {
  phase: Phase
  // Lesson
  lessonScreen: number
  lessonStepWithinScreen: number
  lessonInteractionComplete: boolean
  lessonMaxScreenReached: number
  lessonInputAttempts: number
  // Guided
  guidedProblemIndex: number
  guidedStepIndex: number
  guidedAttempts: number
  guidedShowingInterstitial: boolean
  // Practice
  currentProblem: Problem | null
  currentHouseData: ComputedHouse | null
  currentStepIndex: number
  currentAttempts: number
  currentHintLevel: number
  inputValue: string
  tier: number
  highestTier: number
  streak: number
  problemClean: boolean
  consecutiveDirtyProblems: number
  totalCorrect: number
  totalAttempted: number
  recentProblems: Problem[]
  lessonCompleted: boolean
  guidedCompleted: boolean
  showingCompletion: boolean
  showingTierAdvance: boolean
  showTenProblemCheck: boolean
  // Step accuracy
  stepAccuracy: StepAccuracy
  // Mini-drill
  showingMiniDrill: boolean
  miniDrillDivisor: number
  recentMultiplyHints: boolean[]
  // Resume
  inProgress: InProgressState | null
}

export type CellState = 'hidden' | 'visible' | 'active' | 'input' | 'correct' | 'wrong' | 'dimmed'
